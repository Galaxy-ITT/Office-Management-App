"use client"

import type React from "react"
import { useState } from "react"
import { useFileSystem, type FileType } from "./file-system-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { handleFileOperation } from "./file-system-server"

interface NewFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onFileCreated?: () => void
}

export default function NewFileDialog({ isOpen, onClose, onFileCreated }: NewFileDialogProps) {
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<FileType>("Open File")
  const { addFile } = useFileSystem()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (fileName.trim()) {
      addFile(fileName.trim(), fileType)

      // Call server component
      const result = await handleFileOperation("admin123", "admin", true)
      console.log("Server response:", result)

      setFileName("")
      onClose()
      onFileCreated?.()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fileType">File Type</Label>
            <Select value={fileType} onValueChange={(value) => setFileType(value as FileType)}>
              <SelectTrigger id="fileType">
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open File">Open Files</SelectItem>
                <SelectItem value="Secret File">Secret Files - Govt Copy</SelectItem>
                <SelectItem value="Subject Matter">Subject Matter - AOB</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create File</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

