import type { File } from "@/types/file"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileIcon, FileTextIcon, FileSpreadsheetIcon } from "lucide-react"

interface FileListProps {
  files: File[]
  onFileSelect: (file: File) => void
  selectedFileId: string | undefined
}

export function FileList({ files, onFileSelect, selectedFileId }: FileListProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileIcon className="mr-2" />
      case "docx":
        return <FileTextIcon className="mr-2" />
      case "xlsx":
        return <FileSpreadsheetIcon className="mr-2" />
      default:
        return <FileIcon className="mr-2" />
    }
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border">
      <div className="p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-4">Forwarded Files</h2>
        {files.map((file) => (
          <Button
            key={file.id}
            variant={file.id === selectedFileId ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFileSelect(file)}
          >
            {getFileIcon(file.type)}
            {file.name}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

