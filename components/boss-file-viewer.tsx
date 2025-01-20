"use client"

import { useState } from "react"
import { FileList } from "./file-list"
import { FileViewer } from "./file-viewer"
import { NoteEditor } from "./note-editor"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import type { File } from "@/types/file"

export function BossFileViewer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([
    { id: "1", name: "Q4 Report.pdf", type: "pdf", notes: "" },
    { id: "2", name: "Budget Proposal.xlsx", type: "xlsx", notes: "" },
    { id: "3", name: "Team Performance.docx", type: "docx", notes: "" },
  ])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleNoteSave = (notes: string) => {
    if (selectedFile) {
      const updatedFiles = files.map((file) => (file.id === selectedFile.id ? { ...file, notes } : file))
      setFiles(updatedFiles)
      setSelectedFile({ ...selectedFile, notes })
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      })
    }
  }

  const handleSendBack = () => {
    if (selectedFile) {
      // Here you would typically make an API call to send the file back
      toast({
        title: "File sent back",
        description: `${selectedFile.name} has been sent back with your notes.`,
      })
      // Remove the file from the list
      setFiles(files.filter((file) => file.id !== selectedFile.id))
      setSelectedFile(null)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">File Review Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <FileList files={files} onFileSelect={handleFileSelect} selectedFileId={selectedFile?.id} />
        </div>
        <div className="md:col-span-2 space-y-4">
          {selectedFile ? (
            <>
              <FileViewer file={selectedFile} />
              <NoteEditor initialNotes={selectedFile.notes} onSave={handleNoteSave} />
              <Button onClick={handleSendBack} className="w-full">
                Send Back
              </Button>
            </>
          ) : (
            <div className="text-center text-gray-500">Select a file to review</div>
          )}
        </div>
      </div>
    </div>
  )
}

