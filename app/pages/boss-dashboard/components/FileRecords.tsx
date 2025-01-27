"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye } from "lucide-react"

const fileRecords = [
  {
    id: 1,
    name: "Q2 Report.pdf",
    uploadedBy: "Alice Johnson",
    date: "2023-06-30",
    uniqueNumber: "FR-2023-001",
    type: "Quarterly Report",
    from: "Finance Department",
    to: "Executive Board",
    subject: "Q2 Financial Summary",
    content: "Detailed financial analysis for Q2 2023",
    status: "Submitted",
    reference: "FIN-Q2-2023",
    trackingNumber: "TRK-001-2023",
  },
  {
    id: 2,
    name: "Project Proposal.docx",
    uploadedBy: "Bob Smith",
    date: "2023-06-28",
    uniqueNumber: "FR-2023-002",
    type: "Proposal",
    from: "IT Department",
    to: "Management",
    subject: "New Software Implementation",
    content: "Proposal for implementing new project management software",
    status: "Under Review",
    reference: "IT-PROP-2023",
    trackingNumber: "TRK-002-2023",
  },
  {
    id: 3,
    name: "Marketing Plan.pptx",
    uploadedBy: "Carol Williams",
    date: "2023-06-25",
    uniqueNumber: "FR-2023-003",
    type: "Presentation",
    from: "Marketing Department",
    to: "Executive Team",
    subject: "Q3 Marketing Strategy",
    content: "Comprehensive marketing plan for Q3 2023",
    status: "Approved",
    reference: "MKT-Q3-2023",
    trackingNumber: "TRK-003-2023",
  },
]

const staffMembers = ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eva Garcia"]

export default function FileRecords() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewNote, setReviewNote] = useState("")
  const [reviewAction, setReviewAction] = useState("")
  const [minuteTo, setMinuteTo] = useState("")

  const handleReview = (file) => {
    setSelectedFile(file)
    setIsReviewing(true)
    setReviewNote("")
    setReviewAction("")
    setMinuteTo("")
  }

  const handleSubmitReview = () => {
    // Here you would typically update the backend
    console.log("Review submitted", {
      fileId: selectedFile.id,
      action: reviewAction,
      note: reviewNote,
      minuteTo: minuteTo,
    })

    // Update the file status based on the action
    const newStatus =
      reviewAction === "approve"
        ? "Approved"
        : reviewAction === "reject"
          ? "Rejected"
          : reviewAction === "minute"
            ? "Minuted"
            : "Sent Back"

    // Update the file in the list
    const updatedFiles = fileRecords.map((file) =>
      file.id === selectedFile.id ? { ...file, status: newStatus } : file,
    )

    // In a real application, you would update the state here
    // For this example, we're just logging the updated files
    console.log("Updated files:", updatedFiles)

    setIsReviewing(false)
    setSelectedFile(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent File Records</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {fileRecords.map((file) => (
            <li key={file.id} className="flex items-center gap-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {file.uploadedBy} on {file.date}
                </p>
                <p className="text-sm text-muted-foreground">Status: {file.status}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFile(file)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleReview(file)}>
                Review
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isReviewing ? "Review File" : "File Details"}</DialogTitle>
          </DialogHeader>
          {selectedFile && !isReviewing && (
            <div className="space-y-2">
              <p>
                <strong>Unique Number:</strong> {selectedFile.uniqueNumber}
              </p>
              <p>
                <strong>Type:</strong> {selectedFile.type}
              </p>
              <p>
                <strong>Date:</strong> {new Date(selectedFile.date).toLocaleDateString()}
              </p>
              <p>
                <strong>From:</strong> {selectedFile.from}
              </p>
              <p>
                <strong>To:</strong> {selectedFile.to}
              </p>
              <p>
                <strong>Subject:</strong> {selectedFile.subject}
              </p>
              <p>
                <strong>Content:</strong> {selectedFile.content}
              </p>
              <p>
                <strong>Status:</strong> {selectedFile.status}
              </p>
              <p>
                <strong>Reference:</strong> {selectedFile.reference}
              </p>
              <p>
                <strong>Tracking Number:</strong> {selectedFile.trackingNumber}
              </p>
            </div>
          )}
          {selectedFile && isReviewing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select onValueChange={setReviewAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="minute">Minute to Someone</SelectItem>
                    <SelectItem value="sendback">Send Back</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reviewAction === "minute" && (
                <div className="space-y-2">
                  <Label htmlFor="minuteTo">Minute To</Label>
                  <Select onValueChange={setMinuteTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff} value={staff}>
                          {staff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="note">Review Note</Label>
                <Textarea
                  id="note"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Enter your review note here..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isReviewing ? (
              <>
                <Button variant="outline" onClick={() => setIsReviewing(false)}>
                  Back
                </Button>
                <Button onClick={handleSubmitReview}>Submit Review</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Close
                </Button>
                <Button onClick={() => setIsReviewing(true)}>Review</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

