"use client"
import type { File } from "./file-system-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, FileType } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FileListProps {
  files: File[]
  onSelectFile: (file: File) => void
}

export default function FileList({ files, onSelectFile }: FileListProps) {
  console.log(files)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Card
          key={file.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectFile(file)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge variant={getBadgeVariant(file.type)}>{file.type}</Badge>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">{file.name}</CardTitle>
            <CardDescription>File Number: {file.fileNumber}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileType className="mr-1 h-4 w-4" />
              <span>Reference: {file.referenceNumber}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="flex items-left">
              <Clock className="mr-1 h-4 w-4" />
              <span>{new Date(file.dateCreated).toLocaleDateString()}</span>
            </div>
            <div className="flex items-left">
              <span>{file.records.length} Records</span>
            </div>
          </CardFooter>
        </Card>
      ))}

      {files.length === 0 && (
        <div className="col-span-full text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-medium">No files found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create a new file to get started.</p>
        </div>
      )}
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

