"use client"

import { useState } from "react"
import { useFileSystem, type File } from "./file-system-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, FileType, Paperclip, Eye } from "lucide-react"
import { handleFileOperation } from "./file-system-server"
import NewRecordDialog from "./new-record-dialog"
import RecordDetails from "./record-details"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface FileDetailsProps {
  file: File
}

export default function FileDetails({ file }: FileDetailsProps) {
  const { selectRecord, selectedRecord } = useFileSystem()
  const [isNewRecordDialogOpen, setIsNewRecordDialogOpen] = useState(false)
  const { toast } = useToast()
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleAddRecord = async () => {
    setIsNewRecordDialogOpen(true)
  }

  const handleRecordCreated = () => {
    toast({
      title: "Record Added",
      description: "The new record has been added to the file.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{file.name}</CardTitle>
              <CardDescription>File Number: {file.fileNumber}</CardDescription>
            </div>
            <Badge variant={getBadgeVariant(file.type)}>{file.type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Reference: {file.referenceNumber}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Created: {new Date(file.dateCreated).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <FileType className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Records: {file.records.length}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Records</h3>
            <Button onClick={handleAddRecord}>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </div>

          {file.records.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attachment</TableHead>
                    <TableHead style={{ width: 50 }}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.records.map((record) => (
                    <TableRow
                      key={record.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{record.trackingNumber}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.from}</TableCell>
                      <TableCell>{record.to}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {record.attachmentUrl && (
                          <div className="max-w-xs">
                            {record.attachmentType?.startsWith('image/') ? (
                              <img 
                                src={record.attachmentUrl} 
                                alt={record.attachmentName || 'Attachment'}
                                className="max-h-20 object-contain rounded-md border border-border"
                              />
                            ) : record.attachmentType?.includes('pdf') ? (
                              <embed 
                                src={record.attachmentUrl}
                                type="application/pdf"
                                className="w-full h-20 border border-border rounded-md"
                              />
                            ) : (
                              <div className="flex items-center">
                                <Paperclip className="h-4 w-4 mr-1" />
                                <span className="text-sm truncate">
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
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0" 
                          onClick={() => selectRecord(record)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md bg-muted/10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No records found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Click "Add Record" to create a new record in this file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecord && <RecordDetails record={selectedRecord} fileId={file.id} />}

      <NewRecordDialog
        isOpen={isNewRecordDialogOpen}
        onClose={() => setIsNewRecordDialogOpen(false)}
        fileId={file.id}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  )
}

function getBadgeVariant(fileType: string): "default" | "secondary" | "destructive" | "outline" {
  switch (fileType) {
    case "Secret File":
      return "destructive"
    case "Subject Matter":
      return "secondary"
    case "Temporary":
      return "outline"
    default:
      return "default"
  }
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

function formatFileSize(size: number): string {
  if (size < 1024) {
    return size + " B"
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + " KB"
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + " MB"
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
  }
}

