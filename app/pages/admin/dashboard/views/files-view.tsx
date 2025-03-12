"use client"

import { useState } from "react"
import { useFileSystem } from "../file-system-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { handleFileOperation } from "../file-system-server"
import FileList from "../file-list"
import FileDetails from "../file-details"
import NewFileDialog from "../new-file-dialog"

export default function FilesView() {
  const { files, selectedFile, selectFile } = useFileSystem()
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleNewFile = async () => {
    setIsNewFileDialogOpen(true)
    
  }

  const handleFileCreated = () => {
    toast({
      title: "File Created",
      description: "The new file has been created successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
        <Button onClick={handleNewFile}>
          <Plus className="mr-2 h-4 w-4" /> New File
        </Button>
      </div>

      {selectedFile ? (
        <>
          <Button variant="outline" onClick={() => selectFile(null)} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Files
          </Button>
          <FileDetails file={selectedFile} />
        </>
      ) : (
        <FileList files={files} onSelectFile={selectFile} />
      )}

      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        onFileCreated={handleFileCreated}
      />
    </div>
  )
}

