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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface NewRecordDialogProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  onRecordCreated?: () => void
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

export default function NewRecordDialog({ isOpen, onClose, fileId, onRecordCreated }: NewRecordDialogProps) {
  const [recordType, setRecordType] = useState("incoming")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("pending")
  const [reference, setReference] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addRecord } = useFileSystem()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 1MB")
        setAttachment(null)
        e.target.value = '' // Reset input
        return
      }

      // Validate file type if needed
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload PDF, JPEG, PNG, or DOC files")
        setAttachment(null)
        e.target.value = ''
        return
      }

      setAttachment(file)
    }
  }

  const resetForm = () => {
    setRecordType("incoming")
    setFrom("")
    setTo("")
    setSubject("")
    setContent("")
    setStatus("pending")
    setReference("")
    setAttachment(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!from.trim() || !to.trim() || !subject.trim()) {
        throw new Error("Please fill in all required fields")
      }

      let attachmentData = null
      if (attachment) {
        try {
          // Convert file to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(attachment)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
          })
          
          attachmentData = {
            url: base64,
            name: attachment.name,
            size: attachment.size,
            type: attachment.type
          }
        } catch (err) {
          console.error("Error processing attachment:", err)
          throw new Error("Failed to process attachment")
        }
      }

      const result = await addRecord(fileId, {
        type: recordType,
        date: new Date().toISOString(),
        from: from.trim(),
        to: to.trim(),
        subject: subject.trim(),
        content: content.trim(),
        status,
        reference: reference.trim() || `REF-${new Date().getTime()}`,
        attachmentUrl: attachmentData?.url || null,
        attachmentName: attachmentData?.name || null,
        attachmentSize: attachmentData?.size || null,
        attachmentType: attachmentData?.type || null,
        trackingNumber: ""  // This will be set in the addRecord function
      })

      console.log(result)

      if (result?.success) {
        resetForm()
        onClose()
        onRecordCreated?.()
      } else {
        setError(result?.error || "Failed to create record")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the record")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="from">From *</Label>
            <Input
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient" required />
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
            <Label htmlFor="attachment">Attachment (Max 1MB)</Label>
            <Input
              id="attachment"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {attachment && (
              <p className="text-sm text-muted-foreground">
                Selected: {attachment.name} ({Math.round(attachment.size / 1024)}KB)
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Record"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

