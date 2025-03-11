"use client"

import { useState } from "react"
import { useFileSystem, type File } from "./file-system-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, FileType } from "lucide-react"
import { handleFileOperation } from "./file-system-server"
import NewRecordDialog from "./new-record-dialog"
import RecordDetails from "./record-details"

interface FileDetailsProps {
  file: File
}

export default function FileDetails({ file }: FileDetailsProps) {
  const { selectRecord, selectedRecord } = useFileSystem()
  const [isNewRecordDialogOpen, setIsNewRecordDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleAddRecord = async () => {
    setIsNewRecordDialogOpen(true)
  }

  const handleRecordCreated = () => {
    toast({
      title: "Record Added",
      description: "The new record has been added to the file.",
    })
  }

  console.log(file)

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
                    <TableHead>Unique Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.records.map((record) => (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => selectRecord(record)}
                    >
                      <TableCell className="font-medium">{record.uniqueNumber}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.from}</TableCell>
                      <TableCell>{record.to}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
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

