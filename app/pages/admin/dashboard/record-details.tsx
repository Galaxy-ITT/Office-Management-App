"use client"

import { useState, useEffect } from "react"
import { useFileSystem, type Record } from "./file-system-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, X, Save, Send, FileText, Calendar, User, Tag, Paperclip } from "lucide-react"
import { handleFileOperation, handleForwardRecord, fetchDepartments, fetchEmployees } from "./file-system-server"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RecordDetailsProps {
  record: Record
  fileId: string
}

export default function RecordDetails({ record, fileId }: RecordDetailsProps) {
  const { selectRecord, deleteRecord, updateRecord, adminData } = useFileSystem()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false)
  const [forwardTo, setForwardTo] = useState("")
  const [forwardRecipient, setForwardRecipient] = useState("boss")
  const [forwardNotes, setForwardNotes] = useState("")
  const { toast } = useToast()

  // Edit state
  const [editedRecord, setEditedRecord] = useState<Record>({ ...record })
  const [isForwarding, setIsForwarding] = useState(false)

  const [departments, setDepartments] = useState<Array<{id: number, name: string}>>([])
  const [employees, setEmployees] = useState<Array<{id: string, name: string, position: string, departmentId: number}>>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  
  // Fetch departments and employees when the component mounts
  useEffect(() => {
    async function loadOptions() {
      setIsLoadingOptions(true)
      try {
        // Fetch departments
        const deptResult = await fetchDepartments()
        if (deptResult.success && deptResult.data) {
          setDepartments(deptResult.data)
        }
        
        // Fetch employees
        const empResult = await fetchEmployees()
        if (empResult.success && empResult.data) {
          setEmployees(empResult.data)
        }
      } catch (error) {
        console.error("Error loading forward options:", error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    loadOptions()
  }, [])
  
  // Filter employees by selected department
  const filteredEmployees = selectedDepartmentId 
    ? employees.filter(emp => emp.departmentId === selectedDepartmentId)
    : employees

  const handleDelete = async () => {
    // Call server component
    deleteRecord(fileId, record.id)
    selectRecord(null)

    toast({
      title: "Record Deleted",
      description: "The record has been permanently deleted.",
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedRecord({ ...record })
  }

  const handleSave = async () => {
    updateRecord(fileId, record.id, editedRecord)
    setIsEditing(false)

    toast({
      title: "Record Updated",
      description: "The record has been successfully updated.",
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleForward = () => {
    setIsForwardDialogOpen(true)
  }

  const handleForwardSubmit = async () => {
    if (!adminData?.admin_id) {
      toast({
        title: "Error",
        description: "Admin information not available. Please try again.",
        variant: "destructive"
      })
      return
    }
    
    setIsForwarding(true)
    
    try {
      // Determine recipient name and additional data based on selection
      let recipientName = forwardTo
      let departmentId = null
      let employeeId = null
      
      if (forwardRecipient === "department" && selectedDepartmentId) {
        const dept = departments.find(d => d.id === selectedDepartmentId)
        recipientName = dept?.name || "Unknown Department"
        departmentId = selectedDepartmentId
      } else if (forwardRecipient === "colleague" && selectedEmployeeId) {
        const emp = employees.find(e => e.id === selectedEmployeeId)
        recipientName = emp?.name || "Unknown Employee"
        employeeId = selectedEmployeeId
      } else if (forwardRecipient !== "other" && forwardRecipient !== "boss") {
        recipientName = forwardRecipient
      }
      
      // Call API to forward record with additional information
      const result = await handleForwardRecord(
        record.id,
        fileId,
        adminData.admin_id,
        forwardRecipient,
        recipientName,
        forwardNotes,
        departmentId ?? undefined,
        employeeId ?? undefined
      )
      
      if (result.success) {
        // Update local record status
        const updatedRecord = {
          ...record,
          status: "Forwarded"
        }
        
        // Update in context
        updateRecord(fileId, record.id, updatedRecord)
        
        toast({
          title: "Record Forwarded",
          description: `Record has been forwarded to ${recipientName}.`,
        })
        
        // Reset form
        setIsForwardDialogOpen(false)
        setForwardTo("")
        setForwardNotes("")
        setForwardRecipient("boss")
        setSelectedDepartmentId(null)
        setSelectedEmployeeId(null)
      } else {
        toast({
          title: "Forwarding Failed",
          description: result.error || "An error occurred while forwarding the record.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error forwarding record:", error)
      toast({
        title: "Forwarding Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsForwarding(false)
    }
  }

  return (
    <>
      <Card className="border-t-4" style={{ borderTopColor: getStatusColor(record.status) }}>
        <CardHeader className="relative pb-2">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => selectRecord(null)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          {!isEditing ? (
            <>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
                <Badge variant="outline">{record.type}</Badge>
              </div>
              <CardTitle className="text-xl mt-2">{record.subject}</CardTitle>
              <CardDescription className="flex items-center gap-3">
                <span className="font-medium">{record.trackingNumber}</span> •{" "}
                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(record.date).toLocaleDateString()}</span>
              </CardDescription>
            </>
          ) : (
            <CardTitle className="text-xl">Edit Record</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-b pb-4">
                <div>
                  <p className="text-muted-foreground flex items-center mb-1">
                    <User className="h-3 w-3 mr-1" /> From:
                  </p>
                  <p className="font-medium">{record.from}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center mb-1">
                    <User className="h-3 w-3 mr-1" /> To:
                  </p>
                  <p className="font-medium">{record.to}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-muted-foreground text-sm mb-2 flex items-center">
                  <FileText className="h-3 w-3 mr-1" /> Content:
                </p>
                <div className="p-4 bg-muted/20 rounded-md whitespace-pre-wrap border">
                  {record.content || "No content provided."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="text-muted-foreground flex items-center mb-1">
                    <Tag className="h-3 w-3 mr-1" /> Reference:
                  </p>
                  <p className="font-medium">{record.reference || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center mb-1">
                    <Tag className="h-3 w-3 mr-1" /> Tracking Number:
                  </p>
                  <p className="font-medium">{record.trackingNumber}</p>
                </div>
              </div>

              {record.attachmentUrl && (
                <div className="mt-4 p-4 border rounded-md bg-muted/10">
                  <p className="text-muted-foreground text-sm mb-2 flex items-center">
                    <Paperclip className="h-3 w-3 mr-1" /> Attachment:
                  </p>
                  
                  {record.attachmentType?.startsWith('image/') ? (
                    <div className="mt-2">
                      <img 
                        src={record.attachmentUrl} 
                        alt={record.attachmentName || 'Attachment'}
                        className="max-h-64 rounded-md border mx-auto"
                      />
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        {record.attachmentName} {record.attachmentSize && `(${formatFileSize(record.attachmentSize)})`}
                      </p>
                    </div>
                  ) : record.attachmentType?.includes('pdf') ? (
                    <div className="mt-2">
                      <embed 
                        src={record.attachmentUrl}
                        type="application/pdf"
                        className="w-full h-64 border"
                      />
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        {record.attachmentName} {record.attachmentSize && `(${formatFileSize(record.attachmentSize)})`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center p-2 bg-background border rounded">
                      <Paperclip className="h-4 w-4 mr-2" />
                      <span>
                        {record.attachmentName}
                        {record.attachmentSize && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({formatFileSize(record.attachmentSize)})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Record Type</Label>
                  <Select
                    value={editedRecord.type}
                    onValueChange={(value) => setEditedRecord({ ...editedRecord, type: value })}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Memo">Memo</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Report">Report</SelectItem>
                      <SelectItem value="Policy Document">Policy Document</SelectItem>
                      <SelectItem value="Minutes">Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editedRecord.status}
                    onValueChange={(value) => setEditedRecord({ ...editedRecord, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject</Label>
                <Input
                  id="edit-subject"
                  value={editedRecord.subject}
                  onChange={(e) => setEditedRecord({ ...editedRecord, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-from">From</Label>
                  <Input
                    id="edit-from"
                    value={editedRecord.from}
                    onChange={(e) => setEditedRecord({ ...editedRecord, from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-to">To</Label>
                  <Input
                    id="edit-to"
                    value={editedRecord.to}
                    onChange={(e) => setEditedRecord({ ...editedRecord, to: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editedRecord.content}
                  onChange={(e) => setEditedRecord({ ...editedRecord, content: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-reference">Reference</Label>
                  <Input
                    id="edit-reference"
                    value={editedRecord.reference}
                    onChange={(e) => setEditedRecord({ ...editedRecord, reference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tracking">Tracking Number</Label>
                  <Input
                    id="edit-tracking"
                    value={editedRecord.trackingNumber}
                    onChange={(e) => setEditedRecord({ ...editedRecord, trackingNumber: e.target.value })}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForward}
                disabled={record.status === "Forwarded"}
              >
                <Send className="mr-2 h-4 w-4" /> 
                {record.status === "Forwarded" ? "Forwarded" : "Forward"}
              </Button>
              <div>
                <Button variant="outline" size="sm" onClick={handleEdit} className="mr-2">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record and remove it from the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forward Record</DialogTitle>
            <DialogDescription>
              Forward this record to another person or department.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forward-recipient">Forward to</Label>
              <Select 
                value={forwardRecipient}
                onValueChange={(value) => {
                  setForwardRecipient(value)
                  // Reset selections when changing recipient type
                  setSelectedDepartmentId(null)
                  setSelectedEmployeeId(null)
                  setForwardTo("")
                }}
              >
                <SelectTrigger id="forward-recipient">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boss">Boss</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {forwardRecipient === "department" && (
              <div className="space-y-2">
                <Label htmlFor="department-select">Select Department</Label>
                <Select 
                  value={selectedDepartmentId?.toString() || ""}
                  onValueChange={(value) => setSelectedDepartmentId(Number(value))}
                  disabled={isLoadingOptions || departments.length === 0}
                >
                  <SelectTrigger id="department-select">
                    <SelectValue placeholder={isLoadingOptions ? "Loading departments..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {forwardRecipient === "colleague" && (
              <div className="space-y-2">
                <Label htmlFor="colleague-select">Select Colleague</Label>
                <Select 
                  value={selectedEmployeeId || ""}
                  onValueChange={setSelectedEmployeeId}
                  disabled={isLoadingOptions || employees.length === 0}
                >
                  <SelectTrigger id="colleague-select">
                    <SelectValue placeholder={isLoadingOptions ? "Loading colleagues..." : "Select colleague"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} {emp.position ? `(${emp.position})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {forwardRecipient === "other" && (
              <div className="space-y-2">
                <Label htmlFor="forward-to">Recipient name</Label>
                <Input 
                  id="forward-to" 
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  placeholder="Enter recipient name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="forward-notes">Notes (optional)</Label>
              <Textarea 
                id="forward-notes" 
                value={forwardNotes}
                onChange={(e) => setForwardNotes(e.target.value)}
                placeholder="Add any notes about this forwarded record"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForwardDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleForwardSubmit} 
              disabled={isForwarding || 
                (forwardRecipient === "other" && !forwardTo) ||
                (forwardRecipient === "department" && !selectedDepartmentId) ||
                (forwardRecipient === "colleague" && !selectedEmployeeId)
              }
            >
              {isForwarding ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Forward
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Active":
      return "default"
    case "Pending":
      return "secondary"
    case "Archived":
      return "outline"
    case "Urgent":
      return "destructive"
    default:
      return "default"
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Active":
      return "hsl(142.1 76.2% 36.3%)" // green
    case "Pending":
      return "hsl(221.2 83.2% 53.3%)" // blue
    case "Archived":
      return "hsl(215.4 16.3% 46.9%)" // gray
    case "Urgent":
      return "hsl(0 84.2% 60.2%)" // red
    default:
      return "hsl(142.1 76.2% 36.3%)" // green
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B"
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + " KB"
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
  }
}

