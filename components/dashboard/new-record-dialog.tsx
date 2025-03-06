"use client"

import type React from "react"
import { useState } from "react"
import { useFileSystem } from "./file-system-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { handleFileOperation } from "./file-system-server"

interface NewRecordDialogProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  onRecordCreated?: () => void
}

export default function NewRecordDialog({ isOpen, onClose, fileId, onRecordCreated }: NewRecordDialogProps) {
  const [recordType, setRecordType] = useState("Memo")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("Active")
  const [reference, setReference] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)

  const { addRecord } = useFileSystem()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (from.trim() && to.trim() && subject.trim()) {
      // In a real app, you would upload the attachment to a server here
      // For now, we'll just log it
      if (attachment) {
        console.log("Attachment to upload:", attachment.name, attachment.type, attachment.size)
      }

      addRecord(fileId, {
        type: recordType,
        date: new Date().toISOString(),
        from: from.trim(),
        to: to.trim(),
        subject: subject.trim(),
        content: content.trim(),
        status,
        reference: reference.trim() || `REF-${new Date().getTime()}`,
        trackingNumber: `TRK-${new Date().getTime()}`,
        attachmentUrl: attachment ? attachment.name : undefined,
      })

      // Call server component
      const result = await handleFileOperation("admin123", "admin", true)
      console.log("Server response:", result)

      resetForm()
      onClose()
      onRecordCreated?.()
    }
  }

  const resetForm = () => {
    setRecordType("Memo")
    setFrom("")
    setTo("")
    setSubject("")
    setContent("")
    setStatus("Active")
    setReference("")
    setAttachment(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type</Label>
              <Select value={recordType} onValueChange={setRecordType}>
                <SelectTrigger id="recordType">
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
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Sender" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Record subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record content"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Reference number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachmentUpload">Upload Attachment (Optional)</Label>
            <Input
              id="attachmentUpload"
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {attachment && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {attachment.name} ({(attachment.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

