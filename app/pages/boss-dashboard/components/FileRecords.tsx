"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, Loader2 } from "lucide-react"
import { fetchBossRecords, ForwardedBossRecord } from "./_queries"

const staffMembers = ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eva Garcia"]

export default function FileRecords() {
  const [records, setRecords] = useState<ForwardedBossRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<ForwardedBossRecord | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewAction, setReviewAction] = useState<string>("")
  const [reviewNote, setReviewNote] = useState("")
  const [minuteTo, setMinuteTo] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true)
        const result = await fetchBossRecords()
        if (result.success && result.data) {
          setRecords(result.data)
        } else {
          console.error("Failed to load records:", result.error)
        }
      } catch (error) {
        console.error("Error loading records:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [])

  const handleViewRecord = (record: ForwardedBossRecord) => {
    setSelectedRecord(record)
    setShowDialog(true)
    setIsReviewing(false)
    setReviewAction("")
    setReviewNote("")
    setMinuteTo("")
  }

  const handleSubmitReview = () => {
    // Here you would implement the actual review submission logic
    console.log("Submitting review:", {
      record: selectedRecord,
      action: reviewAction,
      note: reviewNote,
      minuteTo: minuteTo,
    })

    // Reset form and close dialog
    setShowDialog(false)
    setIsReviewing(false)
    setReviewAction("")
    setReviewNote("")
    setMinuteTo("")
    setSelectedRecord(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forwarded Records</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No forwarded records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{record.subject}</h4>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{record.type}</span>
                      <span>•</span>
                      <span>{formatDate(record.date)}</span>
                      <span>•</span>
                      <span>From: {record.from}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Forwarded by: {record.adminName}</span>
                      <span>•</span>
                      <span>Date: {formatDate(record.forward_date)}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>File: {record.fileName}</span>
                      <span>•</span>
                      <span>Ref: {record.reference}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleViewRecord(record)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedRecord?.subject}</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm">{selectedRecord.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm">{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">From</p>
                    <p className="text-sm">{selectedRecord.from}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">To</p>
                    <p className="text-sm">{selectedRecord.to}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reference</p>
                    <p className="text-sm">{selectedRecord.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm">{selectedRecord.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm">{selectedRecord.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Unique Number</p>
                    <p className="text-sm">{selectedRecord.uniqueNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Forwarded By</p>
                    <p className="text-sm">{selectedRecord.adminName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Forwarded On</p>
                    <p className="text-sm">{formatDate(selectedRecord.forward_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Content</p>
                  <p className="text-sm">{selectedRecord.content}</p>
                </div>
                {selectedRecord.notes && (
                  <div>
                    <p className="text-sm font-medium">Forwarding Notes</p>
                    <p className="text-sm">{selectedRecord.notes}</p>
                  </div>
                )}
                {selectedRecord.attachmentName && (
                  <div>
                    <p className="text-sm font-medium">Attachment</p>
                    <p className="text-sm">
                      {selectedRecord.attachmentName} 
                      {selectedRecord.attachmentSize && ` (${Math.round(selectedRecord.attachmentSize / 1024)} KB)`}
                    </p>
                  </div>
                )}
              </div>
            )}
            {selectedRecord && isReviewing && (
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
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => setIsReviewing(true)}>Review</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

