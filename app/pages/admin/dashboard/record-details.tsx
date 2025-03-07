"use client"

import { useState } from "react"
import { useFileSystem, type Record } from "./file-system-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, X, Save } from "lucide-react"
import { handleFileOperation } from "./file-system-server"
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

interface RecordDetailsProps {
  record: Record
  fileId: string
}

export default function RecordDetails({ record, fileId }: RecordDetailsProps) {
  const { selectRecord, deleteRecord, updateRecord } = useFileSystem()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  // Edit state
  const [editedRecord, setEditedRecord] = useState<Record>({ ...record })

  const handleDelete = async () => {
    // Call server component
    const result = await handleFileOperation("admin123", "admin", false, false, true)
    console.log("Server response:", result)

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
    // Call server component
    const result = await handleFileOperation("admin123", "admin", false, true)
    console.log("Server response:", result)

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

  return (
    <>
      <Card>
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
              <CardDescription>
                <span className="font-medium">{record.uniqueNumber}</span> •{" "}
                {new Date(record.date).toLocaleDateString()}
              </CardDescription>
            </>
          ) : (
            <CardTitle className="text-xl">Edit Record</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">From:</p>
                  <p className="font-medium">{record.from}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">To:</p>
                  <p className="font-medium">{record.to}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-muted-foreground text-sm mb-1">Content:</p>
                <div className="p-4 bg-muted/30 rounded-md whitespace-pre-wrap">
                  {record.content || "No content provided."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Reference:</p>
                  <p className="font-medium">{record.reference}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tracking Number:</p>
                  <p className="font-medium">{record.trackingNumber}</p>
                </div>
              </div>

              {record.attachmentUrl && (
                <div className="mt-4 p-3 border rounded-md">
                  <p className="text-muted-foreground text-sm mb-1">Attachment:</p>
                  <p className="text-sm font-medium">{record.attachmentUrl}</p>
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
        <CardFooter className="flex justify-end gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
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

