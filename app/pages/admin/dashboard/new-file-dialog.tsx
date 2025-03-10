"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFileSystem, FileType } from "./file-system-context"
import { useToast } from "@/hooks/use-toast"

interface NewFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onFileCreated?: () => void
}

export default function NewFileDialog({ isOpen, onClose, onFileCreated }: NewFileDialogProps) {
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<FileType>("Open File")
  const [isLoading, setIsLoading] = useState(false)
  const { addFile, adminData } = useFileSystem()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adminData) {
      toast({
        title: "Error",
        description: "Authentication required. Please log in.",
        variant: "destructive",
      })
      return
    }

    if (!fileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await addFile(fileName.trim(), fileType)
      //@ts-ignore
      if (result.success) {
        toast({
          title: "Success",
          description: "File created successfully",
        })
        setFileName("")
        onClose()
        onFileCreated?.()
      } else {
        toast({
          title: "Error",
          //@ts-ignore
          description: result.error || "Failed to create file",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Select
              value={fileType}
              onValueChange={(value: FileType) => setFileType(value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open File">Open File</SelectItem>
                <SelectItem value="Secret File">Secret File</SelectItem>
                <SelectItem value="Subject Matter">Subject Matter</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !adminData}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
