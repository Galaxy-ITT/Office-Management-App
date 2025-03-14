"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, Eye, Loader2, FileText } from "lucide-react"
import { fetchReviewedRecords, ReviewedRecord } from "./_queries"

export default function ReviewedRecords() {
  const [reviews, setReviews] = useState<ReviewedRecord[]>([])
  const [selectedReview, setSelectedReview] = useState<ReviewedRecord | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true)
        const result = await fetchReviewedRecords()
        if (result.success && result.data) {
          setReviews(result.data)
        } else {
          console.error("Failed to load reviewed records:", result.error)
        }
      } catch (error) {
        console.error("Error loading reviewed records:", error)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [])

  const handleViewReview = (review: ReviewedRecord) => {
    setSelectedReview(review)
    setShowDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approve':
        return "bg-green-100 text-green-800"
      case 'reject':
        return "bg-red-100 text-red-800"
      case 'minute':
        return "bg-blue-100 text-blue-800"
      case 'sendback':
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2" />
          Reviewed Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No reviewed records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{review.subject}</h4>
                      <Badge className={`${getActionColor(review.review_action)}`}>
                        {review.review_action}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{review.type}</span>
                      <span>•</span>
                      <span>From: {review.from}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>File: {review.fileName}</span>
                      <span>•</span>
                      <span>Ref: {review.reference}</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Reviewed by: {review.reviewed_by}</span>
                      <span>•</span>
                      <span>Date: {formatDate(review.review_date)}</span>
                    </div>
                    {review.department && (
                      <div className="text-xs text-muted-foreground">
                        <span>Minuted to: {review.department_person} ({review.department})</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleViewReview(review)}>
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
              <DialogTitle>Review Details</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedReview.subject}</h3>
                  <Badge className={`mt-2 ${getActionColor(selectedReview.review_action)}`}>
                    {selectedReview.review_action}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">File Name</p>
                    <p className="text-sm">{selectedReview.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">File Number</p>
                    <p className="text-sm">{selectedReview.fileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm">{selectedReview.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm">{formatDate(selectedReview.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">From</p>
                    <p className="text-sm">{selectedReview.from}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">To</p>
                    <p className="text-sm">{selectedReview.to}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reference</p>
                    <p className="text-sm">{selectedReview.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Unique Number</p>
                    <p className="text-sm">{selectedReview.uniqueNumber}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Content</p>
                  <p className="text-sm">{selectedReview.content}</p>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Reviewed By</p>
                      <p className="text-sm">{selectedReview.reviewed_by}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Review Date</p>
                      <p className="text-sm">{formatDate(selectedReview.review_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Action</p>
                      <p className="text-sm">{selectedReview.review_action}</p>
                    </div>
                    {selectedReview.department && (
                      <div>
                        <p className="text-sm font-medium">Minuted To</p>
                        <p className="text-sm">{selectedReview.department_person} ({selectedReview.department})</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium">Review Note</p>
                    <div className="p-3 border rounded-md bg-muted/10 mt-1">
                      <p className="text-sm whitespace-pre-wrap">{selectedReview.review_note}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 