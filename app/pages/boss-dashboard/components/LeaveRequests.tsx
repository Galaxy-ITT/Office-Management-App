"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const leaveRequests = [
  {
    id: 1,
    name: "Bob Smith",
    type: "Vacation",
    from: "2023-07-01",
    to: "2023-07-07",
    status: "Pending",
    hodComment: "Workload is manageable during this period.",
    hodApproval: "Yes",
  },
  {
    id: 2,
    name: "Alice Johnson",
    type: "Sick Leave",
    from: "2023-06-30",
    to: "2023-07-01",
    status: "Pending",
    hodComment: "Emergency situation, requires immediate approval.",
    hodApproval: "Yes",
  },
]

export default function LeaveRequests() {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [comment, setComment] = useState("")

  const handleApprove = () => {
    // Here you would typically update the backend
    console.log("Approved", selectedRequest.id, comment)
    setSelectedRequest(null)
    setComment("")
  }

  const handleReject = () => {
    // Here you would typically update the backend
    console.log("Rejected", selectedRequest.id, comment)
    setSelectedRequest(null)
    setComment("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {leaveRequests.map((request) => (
            <li key={request.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{request.name}</p>
                <p className="text-sm text-muted-foreground">
                  {request.type}: {request.from} to {request.to}
                </p>
                <p className="text-sm text-muted-foreground">HOD Approval: {request.hodApproval}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                Review
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <p>
                <strong>Employee:</strong> {selectedRequest.name}
              </p>
              <p>
                <strong>Type:</strong> {selectedRequest.type}
              </p>
              <p>
                <strong>Period:</strong> {selectedRequest.from} to {selectedRequest.to}
              </p>
              <p>
                <strong>HOD Comment:</strong> {selectedRequest.hodComment}
              </p>
              <p>
                <strong>HOD Approval:</strong> {selectedRequest.hodApproval}
              </p>
              <div className="space-y-2">
                <Label htmlFor="comment">Your Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your comment here..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
            <Button onClick={handleApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

