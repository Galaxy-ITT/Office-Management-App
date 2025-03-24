"use client"

import { useState, useContext, useEffect } from "react"
import { UserContext } from "@/userContext/userContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, AlertCircle, FileText, Plus, Upload, Loader2, Download } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { submitLeaveApplication, fetchEmployeeLeaves } from "../_queries"

// Define the type for leaves data
type LeaveData = {
  leave_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
  application_date: string
  evidence_name?: string
  evidence_url?: string
  evidence_file?: string
}

interface EmployeeLeavesProps {
  leaveData: LeaveData[]
  compact?: boolean
  hideApplyButton?: boolean
}

// Form schema for leave application
const leaveFormSchema = z.object({
  leave_type: z.string().min(1, "Please select a leave type"),
  start_date: z.string().min(1, "Please select a start date"),
  end_date: z.string().min(1, "Please select an end date"),
  reason: z.string().min(5, "Please provide a reason for your leave"),
  evidence: z.custom<FileList | null>()
    .optional()
    .superRefine((val, ctx) => {
      // Custom validation will run only in browser context
      if (typeof window !== 'undefined' && val instanceof FileList) {
        if (val.length > 0 && val[0].size > 5 * 1024 * 1024) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'File size must be less than 5MB',
          });
        }
      }
      return true;
    }),
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export function EmployeeLeaves({ leaveData, compact = false, hideApplyButton = false }: EmployeeLeavesProps) {
  const { userData } = useContext(UserContext)
  const { toast } = useToast()
  const [leaves, setLeaves] = useState<LeaveData[]>(leaveData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentEvidence, setCurrentEvidence] = useState<{ data: string; name: string } | null>(null)
  const [isViewingEvidence, setIsViewingEvidence] = useState(false)

  // Create form
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: "",
    },
  });

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Handle form submission
  const onSubmit = async (values: LeaveFormValues) => {
    if (!userData?.employee_id) {
      toast({
        title: "Error",
        description: "Employee ID not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Show loading notification without trying to dismiss it later
    toast({
      title: "Submitting...",
      description: "Your leave application is being processed",
      duration: 3000, // Auto-dismiss after 3 seconds
    });

    try {
      let evidenceUrl = "";
      let evidenceName = "";
      let evidenceBase64: string | undefined = undefined;

      // Process file upload if exists
      if (selectedFile) {
        evidenceName = selectedFile.name;
        
        // Convert file to base64 for storing in database
        const fileReader = new FileReader();
        evidenceBase64 = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = reject;
          fileReader.readAsDataURL(selectedFile);
        });
      }

      // Create leave application
      const leaveId = uuidv4();
      const leaveData = {
        leave_id: leaveId,
        employee_id: userData.employee_id,
        leave_type: values.leave_type,
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason,
        evidence_url: evidenceUrl,
        evidence_name: evidenceName,
        evidence_file: evidenceBase64,
        status: "pending",
        application_date: new Date().toISOString(),
      };

      // Use the server action
      const response = await submitLeaveApplication(leaveData);
      
      if (response.success) {
        // Add the new leave to the state
        const newLeave: LeaveData = {
          leave_id: leaveId,
          leave_type: values.leave_type,
          start_date: values.start_date,
          end_date: values.end_date,
          reason: values.reason,
          status: "pending",
          application_date: new Date().toISOString(),
          evidence_name: evidenceName,
          evidence_url: evidenceUrl,
          evidence_file: evidenceBase64,
        };

        // Update the state with the new leave
        setLeaves(prevLeaves => [newLeave, ...prevLeaves]);
        
        // Reset form
        form.reset();
        setSelectedFile(null);
        
        // Close dialog - ensure this happens by forcing state update
        setIsDialogOpen(false);
        
        // Success notification
        toast({
          title: "Success",
          description: "Leave application submitted successfully",
          variant: "default",
          className: "bg-green-500 text-white",
          duration: 3000,
        });
        
        // Optional: Refresh data from server to ensure consistency
        setTimeout(() => {
          fetchLeaveData();
        }, 500);
      } else {
        throw new Error(response.error || "Failed to submit leave application");
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      
      // Error notification
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit leave application",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a reliable function to fetch leave data
  const fetchLeaveData = async () => {
    try {
      if (!userData?.employee_id) return;
      
      const response = await fetchEmployeeLeaves(userData.employee_id);
      
      if (response && response.success && Array.isArray(response.data)) {
        // Convert dates from Date objects to strings if needed
        const formattedLeaves = response.data.map(leave => ({
          ...leave,
          start_date: typeof leave.start_date === 'string' 
            ? leave.start_date 
            : new Date(leave.start_date).toISOString(),
          end_date: typeof leave.end_date === 'string' 
            ? leave.end_date 
            : new Date(leave.end_date).toISOString(),
          application_date: typeof leave.application_date === 'string' 
            ? leave.application_date 
            : new Date(leave.application_date).toISOString(),
          // Convert null values to undefined for optional fields
          evidence_name: leave.evidence_name || undefined,
          evidence_url: leave.evidence_url || undefined,
          evidence_file: leave.evidence_file || undefined
        }));
        
        setLeaves(formattedLeaves);
      } else {
        console.warn("Received invalid data format from server:", response);
        toast({
          title: "Note",
          description: "Unable to refresh leave data. Some information may be outdated.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  // Calculate leave duration in days
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end days
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success"
      case "rejected":
        return "destructive"
      case "pending":
        return "warning"
      default:
        return "secondary"
    }
  }

  // Sort leave applications by date (most recent first)
  const sortedLeaves = [...leaves].sort((a, b) => 
    new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
  )

  // For compact view, show only the most recent 3 applications
  const displayLeaves = compact ? sortedLeaves.slice(0, 3) : sortedLeaves

  // Helper function to convert various buffer formats to string
  const bufferToString = (buffer: any): string => {
    if (!buffer) return '';
    
    // Handle case 1: Already a string
    if (typeof buffer === 'string') return buffer;
    
    // Handle case 2: Node.js Buffer
    if (Buffer.isBuffer(buffer)) return buffer.toString('utf-8');
    
    // Handle case 3: Serialized buffer with data property
    if (buffer.type === 'Buffer' && Array.isArray(buffer.data)) {
      return Buffer.from(buffer.data).toString('utf-8');
    }
    
    // Handle case 4: Array of bytes
    if (Array.isArray(buffer)) {
      return Buffer.from(buffer).toString('utf-8');
    }
    
    // Fallback: Convert to JSON
    try {
      return JSON.stringify(buffer);
    } catch (e) {
      console.error('Failed to convert buffer to string:', e);
      return '[Unable to display file content]';
    }
  };

  // Then update the viewEvidence function to use this helper
  const viewEvidence = (evidenceFile: any, evidenceName: string) => {
    const fileData = bufferToString(evidenceFile);
    setCurrentEvidence({ data: fileData, name: evidenceName || 'Evidence' });
    setIsViewingEvidence(true);
  };

  // Add this after fetching leaves data to check if files are present
  useEffect(() => {
    if (leaves.length > 0) {
      console.log("Leaves data:", leaves);
      // Check if any leaves have evidence files
      const leavesWithEvidence = leaves.filter(leave => leave.evidence_file);
      console.log(`Found ${leavesWithEvidence.length} leaves with evidence files`);
    }
  }, [leaves]);

  // Function to handle file download
  const downloadFile = (data: string, filename: string) => {
    // Create an anchor element and set the href to the file data
    const a = document.createElement('a');
    
    // If it's already a data URL, use it directly
    if (data.startsWith('data:')) {
      a.href = data;
    } else {
      // Otherwise, try to create a data URL - assume it's text/plain if we can't determine
      a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Add the modal component inside your component
  const EvidenceModal = () => {
    if (!currentEvidence) return null;
    
    return (
      <Dialog open={isViewingEvidence} onOpenChange={setIsViewingEvidence}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Evidence: {currentEvidence.name}</DialogTitle>
            <DialogDescription>
              Attached file for leave application
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex justify-center">
            {currentEvidence.data.startsWith('data:image/') ? (
              <img 
                src={currentEvidence.data} 
                alt={currentEvidence.name} 
                className="max-w-full max-h-[70vh] object-contain" 
              />
            ) : currentEvidence.data.startsWith('data:application/pdf') ? (
              <iframe 
                src={currentEvidence.data} 
                className="w-full h-[70vh] border-none" 
                title={currentEvidence.name} 
              />
            ) : (
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">File Preview Not Available</h3>
                <p className="mb-4">This file type cannot be previewed directly.</p>
                <Button 
                  onClick={() => downloadFile(currentEvidence.data, currentEvidence.name)}
                  className="inline-flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewingEvidence(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => downloadFile(currentEvidence.data, currentEvidence.name)}
              className="inline-flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Leave Applications</CardTitle>
            <CardDescription>
              View your leave history and application status
            </CardDescription>
          </div>
          {!hideApplyButton && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>
                    Submit a new leave application. Required fields are marked with an asterisk (*).
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="leave_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leave Type *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="annual">Annual Leave</SelectItem>
                              <SelectItem value="sick">Sick Leave</SelectItem>
                              <SelectItem value="maternity">Maternity Leave</SelectItem>
                              <SelectItem value="paternity">Paternity Leave</SelectItem>
                              <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                              <SelectItem value="study">Study Leave</SelectItem>
                              <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Leave *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide details about your leave request..."
                              className="min-h-[80px]"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="evidence"
                      render={({ field: { ref, ...field } }) => (
                        <FormItem>
                          <FormLabel>Supporting Evidence (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col gap-2">
                              <Input
                                ref={ref}
                                type="file"
                                onChange={(e) => {
                                  field.onChange(e.target.files);
                                  handleFileChange(e);
                                }}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                              />
                              {selectedFile && (
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload medical certificates or other relevant documents (PDF, JPG, PNG, max 5MB)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">No leave applications found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You haven't submitted any leave applications yet.
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[320px]" : "max-h-[450px]"}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  {!compact && <TableHead>Evidence</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLeaves.map((leave) => (
                  <TableRow key={leave.leave_id}>
                    <TableCell className="font-medium">{leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(leave.start_date)}
                        </span>
                        <span className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(leave.end_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        <span>{calculateDuration(leave.start_date, leave.end_date)} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </TableCell>
                    {!compact && (
                      <TableCell>
                        {leave.evidence_file ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewEvidence(leave.evidence_file, leave.evidence_name || "Evidence")}
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View File
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        {compact && leaves.length > 3 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing 3 of {leaves.length} leave applications
          </div>
        )}
      </CardContent>
      
      {/* Add the evidence modal */}
      <EvidenceModal />
    </Card>
  )
}

export default EmployeeLeaves 