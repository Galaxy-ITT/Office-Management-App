"use client"

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/userContext/userContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileIcon, 
  Loader2, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
import { ForwardedRecord, fetchForwardedRecords, updateForwardedRecordStatus, forwardRecordToEmployee, fetchDepartmentEmployees, Employee } from "./_queries";
import { useToast } from "@/hooks/use-toast";

export default function ForwardedRecords() {
  const { userData } = useContext(UserContext);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ForwardedRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ForwardedRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [forwardNotes, setForwardNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        if (!userData?.department_name) return;
        
        const result = await fetchForwardedRecords(userData.department_name);
        if (result.success && result.data) {
          setRecords(result.data as ForwardedRecord[]);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load forwarded records",
            variant: "destructive",
          });
        }
        // Load department employees for forwarding options
        if (userData.department_id) {
          const empResult = await fetchDepartmentEmployees(userData.department_id);
          if (empResult.success && empResult.data) {
            setEmployees(empResult.data as Employee[]);
          }
        }
      } catch (error) {
        console.error("Error loading forwarded records:", error);
        toast({
          title: "Error",
          description: "Failed to load forwarded records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userData?.department_name) {
      loadRecords();
    }
  }, [userData, toast]);

  const handleStatusUpdate = async (forwardId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const result = await updateForwardedRecordStatus(forwardId, newStatus);
      
      if (result.success) {
        // Update the local state
        setRecords(prevRecords => 
          prevRecords.map(record => 
            record.forward_id === forwardId 
              ? { ...record, status: newStatus } 
              : record
          )
        );
        
        toast({
          title: "Success",
          description: "Record status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update record status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update record status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleForwardRecord = async () => {
    if (!selectedRecord || !selectedEmployee || !userData?.admin_id) {
      toast({
        title: "Error",
        description: "Missing required information for forwarding",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      const forwardData = {
        record_id: selectedRecord.record_id,
        file_id: selectedRecord.file_id,
        forwarded_by: Number(userData.admin_id),
        forwarded_to: selectedEmployee,
        recipient_type: "employee",
        notes: forwardNotes,
        department_id: userData.department_id
      };
      
      // Validate forwarded_by is a valid number
      if (isNaN(forwardData.forwarded_by)) {
        toast({
          title: "Error",
          description: "Invalid admin ID. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      
      const result = await forwardRecordToEmployee(forwardData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Record forwarded successfully",
        });
        setIsForwardDialogOpen(false);
        setSelectedEmployee("");
        setForwardNotes("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to forward record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error forwarding record:", error);
      toast({
        title: "Error",
        description: "Failed to forward record",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Forwarded Records</CardTitle>
          <CardDescription>
            Records and files forwarded to your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-10">
              <FileIcon className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No forwarded records</h3>
              <p className="text-muted-foreground">
                There are no records forwarded to your department at this time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Forwarded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.forward_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileIcon className="h-4 w-4 mr-2" />
                          {record.file_name || "Unnamed File"}
                        </div>
                      </TableCell>
                      <TableCell>{record.forwarder_name || "Unknown"}</TableCell>
                      <TableCell>{formatDate(record.forward_date)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {record.file_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a 
                                href={`/api/files/download/${record.file_id}`} 
                                download 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          )}
                          {record.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleStatusUpdate(record.forward_id, "approved")}
                                disabled={updating}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleStatusUpdate(record.forward_id, "rejected")}
                                disabled={updating}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>
              View and manage the forwarded record
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">File Name</h4>
                  <p>{selectedRecord.file_name || "Unnamed File"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <p>{getStatusBadge(selectedRecord.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Forwarded By</h4>
                  <p>{selectedRecord.forwarder_name || "Unknown"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                  <p>{formatDate(selectedRecord.forward_date)}</p>
                </div>
              </div>
              
              {selectedRecord.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="p-3 bg-muted rounded-md">{selectedRecord.notes}</p>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
             {/*   <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setSelectedRecord(record => {
                      setIsForwardDialogOpen(true);
                      return record;
                    });
                  }}
                >
                  Forward to Employee
                </Button> 
                */}
                
                <div className="space-x-2">
                  {selectedRecord.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        className="text-green-600"
                        onClick={() => {
                          handleStatusUpdate(selectedRecord.forward_id, "approved");
                          setIsViewDialogOpen(false);
                        }}
                        disabled={updating}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          handleStatusUpdate(selectedRecord.forward_id, "rejected");
                          setIsViewDialogOpen(false);
                        }}
                        disabled={updating}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Forward Record Dialog */}
      <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Forward Record</DialogTitle>
            <DialogDescription>
              Forward this record to an employee in your department
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Select Employee
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_id} value={employee.employee_id}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Notes (Optional)
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={forwardNotes}
                onChange={(e) => setForwardNotes(e.target.value)}
                placeholder="Add any notes or instructions for the employee"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForwardDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleForwardRecord}
              disabled={!selectedEmployee || updating}
            >
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 