'use client'

import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '@/userContext/userContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Search,
  FileText,
  Calendar,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { fetchProposals, reviewProposal } from './_queries'

// Define interface for proposal data
interface Proposal {
  id: string;
  proposal_id: string;
  employee_id: string;
  employee_name: string;
  subject: string;
  content: string;
  submission_date: string;
  status: string;
  reviewed_by: number | null;
  reviewer_name: string | null;
  review_date: string | null;
  review_note: string | null;
}

// Define interface for review data
interface ReviewData {
  record_id: string;
  reviewed_by: number;
  review_action: string;
  review_note: string;
  department: string;
}

export default function EmployeeProposals() {
  const { userData } = useContext(UserContext)
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [reviewNote, setReviewNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch proposals
  useEffect(() => {
    const loadProposals = async () => {
      setLoading(true)
      try {
        if (!userData?.department_id) {
          toast({
            title: "Error",
            description: "Department ID not found",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
        
        const result = await fetchProposals(userData.department_id)
        if (result.success && result.data) {
          setProposals(result.data as Proposal[])
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load proposals",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error loading proposals:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (userData?.department_id) {
      loadProposals()
    }
  }, [userData, toast])

  // Handle search
  const filteredProposals = proposals.filter((proposal) =>
    Object.values(proposal).some((val) =>
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  // Handle view proposal
  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setViewDialogOpen(true)
  }

  // Handle review proposal
  const handleReviewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setReviewStatus('approved')
    setReviewNote('')
    setReviewDialogOpen(true)
  }

  // Submit review
  const handleSubmitReview = async () => {
    if (!selectedProposal || !userData?.department_id || !userData?.department_name) return

    setSubmitting(true)
    try {
      const reviewData: ReviewData = {
        record_id: selectedProposal.proposal_id,
        reviewed_by: userData.department_id,
        review_action: reviewStatus,
        review_note: reviewNote,
        department: userData.department_name,
      }
      
      const result = await reviewProposal(selectedProposal.proposal_id, reviewData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Proposal ${reviewStatus} successfully`,
        })
        
        // Update proposal in the list
        setProposals(proposals.map(prop => 
          prop.proposal_id === selectedProposal.proposal_id 
            ? { ...prop, status: reviewStatus, review_note: reviewNote } 
            : prop
        ))
        
        setReviewDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit review",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while submitting the review",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Employee Proposals</CardTitle>
              <CardDescription>
                Review and approve proposals from your department staff
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  className="pl-8 w-[250px]"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setLoading(true)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No proposals found</h3>
              <p className="text-muted-foreground">
                There are no proposals submitted by your department employees.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No proposals found matching your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-medium">{proposal.subject}</TableCell>
                        <TableCell>{proposal.employee_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(proposal.submission_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              proposal.status === 'pending' ? 'outline' : 
                              proposal.status === 'approved' ? 'default' : 'destructive'
                            }
                          >
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProposal(proposal)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {proposal.status === 'pending' && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleReviewProposal(proposal)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Proposal Dialog */}
      {selectedProposal && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Proposal Details</DialogTitle>
              <DialogDescription>
                Submitted on {formatDate(selectedProposal.submission_date)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-semibold">Subject</h3>
                <p>{selectedProposal.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold">From</h3>
                <p>{selectedProposal.employee_name}</p>
              </div>
              <div>
                <h3 className="font-semibold">To</h3>
                <p>{selectedProposal.reviewer_name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Content</h3>
                <div className="mt-2 rounded-md border p-4 text-sm">
                  {selectedProposal.content || "No content provided"}
                </div>
              </div>
              {selectedProposal.status !== 'pending' && (
                <div>
                  <h3 className="font-semibold">Review Notes</h3>
                  <div className="mt-2 rounded-md border p-4 text-sm">
                    {selectedProposal.review_note || "No review notes provided"}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
              {selectedProposal.status === 'pending' && (
                <Button onClick={() => {
                  setViewDialogOpen(false)
                  handleReviewProposal(selectedProposal)
                }}>
                  Review
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Proposal Dialog */}
      {selectedProposal && (
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Proposal</DialogTitle>
              <DialogDescription>
                Review and provide feedback on the proposal
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Subject: {selectedProposal.subject}</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <label className="text-sm font-medium mb-2 block">
                    Review Status
                  </label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <label className="text-sm font-medium mb-2 block">
                    Review Notes
                  </label>
                  <Textarea
                    placeholder="Provide feedback or notes about your decision"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview} 
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 