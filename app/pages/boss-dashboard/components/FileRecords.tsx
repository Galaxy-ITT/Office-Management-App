"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, Loader2 } from "lucide-react"
import { fetchBossRecords, ForwardedBossRecord, submitReview } from "./_queries"
import { v4 as uuidv4 } from 'uuid';

const departments = [
  {
    name: "Administration",
    staff: ["Alice Johnson (Director)", "Bob Smith (Deputy Director)", "Carol Williams (Admin Officer)"]
  },
  {
    name: "Finance",
    staff: ["David Brown (CFO)", "Eva Garcia (Accountant)", "Frank Miller (Finance Officer)"]
  },
  {
    name: "Operations",
    staff: ["Grace Lee (Operations Manager)", "Henry Wilson (Team Lead)", "Irene Martinez (Supervisor)"]
  },
  {
    name: "Legal",
    staff: ["James Taylor (Legal Counsel)", "Karen White (Legal Officer)", "Leo Thompson (Paralegal)"]
  }
];

export default function FileRecords() {
  const [records, setRecords] = useState<ForwardedBossRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<ForwardedBossRecord | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewAction, setReviewAction] = useState<string>("")
  const [reviewNote, setReviewNote] = useState("")
  const [minuteTo, setMinuteTo] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false)
  const [viewingAttachment, setViewingAttachment] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [departmentPerson, setDepartmentPerson] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [departmentStaff, setDepartmentStaff] = useState<string[]>([])
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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

  useEffect(() => {
    if (selectedDepartment) {
      const dept = departments.find(d => d.name === selectedDepartment);
      setDepartmentStaff(dept?.staff || []);
      setDepartmentPerson(""); // Reset person when department changes
    } else {
      setDepartmentStaff([]);
    }
  }, [selectedDepartment]);

  const handleViewRecord = (record: ForwardedBossRecord) => {
    setSelectedRecord(record)
    setShowDialog(true)
    setIsReviewing(false)
    setReviewAction("")
    setReviewNote("")
    setMinuteTo("")
  }

  const handleSubmitReview = async () => {
    if (!selectedRecord) return;
    
    if (!reviewAction) {
      setReviewMessage({ type: 'error', text: 'Please select an action' });
      return;
    }
    
    if (reviewAction === "minute" && (!selectedDepartment || !departmentPerson)) {
      setReviewMessage({ type: 'error', text: 'Please select both department and person' });
      return;
    }
    
    if (!reviewNote) {
      setReviewMessage({ type: 'error', text: 'Please provide a review note' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await submitReview({
        record_id: selectedRecord.id,
        forward_id: selectedRecord.forward_id,
        reviewed_by: "Boss", // You might want to replace this with actual boss name
        review_action: reviewAction,
        review_note: reviewNote,
        department: reviewAction === "minute" ? selectedDepartment : undefined,
        department_person: reviewAction === "minute" ? departmentPerson : undefined
      });
      
      if (result.success) {
        setReviewMessage({ type: 'success', text: 'Review submitted successfully' });
        
        // Refresh the records list
        const updatedRecords = await fetchBossRecords();
        if (updatedRecords.success && updatedRecords.data) {
          setRecords(updatedRecords.data);
        }
        
        // Reset form and close dialog
        setTimeout(() => {
          setShowDialog(false);
          setIsReviewing(false);
          setReviewAction("");
          setReviewNote("");
          setSelectedDepartment("");
          setDepartmentPerson("");
          setSelectedRecord(null);
          setReviewMessage(null);
        }, 1500);
      } else {
        setReviewMessage({ type: 'error', text: result.error || 'Failed to submit review' });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const openAttachmentViewer = (url: string, name: string, type: string) => {
    setViewingAttachment({ url, name, type })
    setShowAttachmentViewer(true)
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
                    <div className="p-3 border rounded-md bg-muted/10">
                      {selectedRecord.attachmentUrl ? (
                        <>
                          {selectedRecord.attachmentType?.startsWith('image/') ? (
                            <div className="mt-2 cursor-pointer" 
                                 onClick={() => openAttachmentViewer(
                                   selectedRecord.attachmentUrl!, 
                                   selectedRecord.attachmentName || 'Attachment',
                                   selectedRecord.attachmentType || 'image/*'
                                 )}>
                              <img 
                                src={selectedRecord.attachmentUrl}
                                alt={selectedRecord.attachmentName || 'Attachment'}
                                className="max-h-64 rounded-md border mx-auto hover:opacity-90 transition-opacity"
                              />
                              <p className="text-xs text-center mt-2 text-muted-foreground">
                                {selectedRecord.attachmentName} 
                                {selectedRecord.attachmentSize && 
                                  ` (${Math.round(selectedRecord.attachmentSize / 1024)} KB)`}
                                <span className="ml-2 text-blue-500">(Click to enlarge)</span>
                              </p>
                            </div>
                          ) : selectedRecord.attachmentType?.includes('pdf') ? (
                            <div className="mt-2">
                              <div className="relative">
                                <embed 
                                  src={selectedRecord.attachmentUrl}
                                  type="application/pdf"
                                  className="w-full h-64 border"
                                />
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                  onClick={() => openAttachmentViewer(
                                    selectedRecord.attachmentUrl!, 
                                    selectedRecord.attachmentName || 'Document.pdf',
                                    'application/pdf'
                                  )}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Full Screen
                                </Button>
                              </div>
                              <p className="text-xs text-center mt-2 text-muted-foreground">
                                {selectedRecord.attachmentName} 
                                {selectedRecord.attachmentSize && 
                                  ` (${Math.round(selectedRecord.attachmentSize / 1024)} KB)`}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center p-2">
                                <FileText className="h-4 w-4 mr-2" />
                                <span>
                                  {selectedRecord.attachmentName}
                                  {selectedRecord.attachmentSize && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      ({Math.round(selectedRecord.attachmentSize / 1024)} KB)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openAttachmentViewer(
                                  selectedRecord.attachmentUrl!, 
                                  selectedRecord.attachmentName || 'Document',
                                  selectedRecord.attachmentType || 'application/octet-stream'
                                )}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View File
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center p-2">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>
                            {selectedRecord.attachmentName}
                            {selectedRecord.attachmentSize && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({Math.round(selectedRecord.attachmentSize / 1024)} KB)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedRecord && isReviewing && (
              <div className="space-y-4">
                {reviewMessage && (
                  <div className={`p-3 rounded-md ${reviewMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {reviewMessage.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select onValueChange={setReviewAction} value={reviewAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="minute">Minute to Department</SelectItem>
                      <SelectItem value="sendback">Send Back</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {reviewAction === "minute" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.name} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departmentPerson">Department Person</Label>
                      <Select 
                        onValueChange={setDepartmentPerson} 
                        value={departmentPerson}
                        disabled={!selectedDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedDepartment ? "Select a person" : "Select a department first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentStaff.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
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
                  <Button variant="outline" onClick={() => setIsReviewing(false)} disabled={submitting}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
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

        {/* Full Screen Attachment Viewer */}
        <Dialog open={showAttachmentViewer} onOpenChange={setShowAttachmentViewer}>
          <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {viewingAttachment?.name || 'Attachment'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="relative w-full h-[calc(90vh-8rem)] overflow-auto">
              {viewingAttachment?.type.startsWith('image/') ? (
                <div className="flex items-center justify-center h-full bg-black/5 p-4">
                  <img
                    src={viewingAttachment.url}
                    alt={viewingAttachment.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : viewingAttachment?.type.includes('pdf') ? (
                <embed
                  src={viewingAttachment.url}
                  type="application/pdf"
                  className="w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <FileText className="h-16 w-16 mb-4 text-muted-foreground" />
                  <p className="text-center mb-4">
                    This file type can't be previewed directly in the browser.
                  </p>
                  <Button 
                    onClick={() => window.open(viewingAttachment?.url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowAttachmentViewer(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => window.open(viewingAttachment?.url, '_blank')}
              >
                Open in New Tab
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

