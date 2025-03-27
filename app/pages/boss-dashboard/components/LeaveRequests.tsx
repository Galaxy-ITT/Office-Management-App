"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchLeaveApplications, updateLeaveStatus, LeaveApplication } from "./_queries"
import { useContext } from "react"
import { UserContext } from "@/userContext/userContext"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function LeaveRequests() {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { userData } = useContext(UserContext) // Using the same UserContext as in page.tsx

  useEffect(() => {
    loadLeaveApplications()
  }, [])

  const loadLeaveApplications = async () => {
    setLoading(true)
    try {
      // Only fetch pending leave applications
      const result = await fetchLeaveApplications('pending')
      if (result.success && result.data) {
        setLeaveApplications(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load leave applications",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading leave applications:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedApplication || !userData?.admin_id) return
    
    setProcessing(true)
    try {
      const result = await updateLeaveStatus(
        selectedApplication.leave_id,
        status,
        userData.admin_id, // Using userData from the UserContext
        comment
      )
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Leave application ${status} successfully`,
        })
        
        // Refresh the list
        await loadLeaveApplications()
        
        // Close the dialog
        setSelectedApplication(null)
        setComment("")
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${status} leave application`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${status} leave application:`, error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : leaveApplications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No leave applications found</p>
        ) : (
          <>
            {/* List view for mobile */}
            <div className="md:hidden space-y-4">
              {leaveApplications.map((application) => (
                <div key={application.leave_id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{application.employee_name}</p>
                      <p className="text-sm text-muted-foreground">{application.employee_position}</p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Department:</span> {application.department_name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Leave Type:</span> {application.leave_type}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Period:</span> {formatDate(application.start_date)} to {formatDate(application.end_date)}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setSelectedApplication(application)}
                    disabled={application.status !== 'pending'}
                  >
                    {application.status === 'pending' ? 'Review' : 'View Details'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Table view for larger screens */}
            <div className="hidden md:block">
              <Table>
                <TableCaption>List of employee leave applications</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApplications.map((application) => (
                    <TableRow key={application.leave_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{application.employee_position}</p>
                        </div>
                      </TableCell>
                      <TableCell>{application.department_name || 'N/A'}</TableCell>
                      <TableCell>{application.leave_type}</TableCell>
                      <TableCell>{formatDate(application.start_date)}</TableCell>
                      <TableCell>{formatDate(application.end_date)}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                          disabled={application.status !== 'pending'}
                        >
                          {application.status === 'pending' ? 'Review' : 'View Details'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedApplication?.status === 'pending' 
                ? 'Review Leave Request' 
                : 'Leave Request Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <p>
                <strong>Employee:</strong> {selectedApplication.employee_name}
              </p>
              <p>
                <strong>Position:</strong> {selectedApplication.employee_position}
              </p>
              <p>
                <strong>Department:</strong> {selectedApplication.department_name || 'N/A'}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedApplication.leave_type}
              </p>
              <p>
                <strong>Period:</strong> {formatDate(selectedApplication.start_date)} to {formatDate(selectedApplication.end_date)}
              </p>
              <p>
                <strong>Reason:</strong> {selectedApplication.reason || 'No reason provided'}
              </p>
              {selectedApplication.evidence_url && (
                <p>
                  <strong>Supporting Document:</strong>{' '}
                  <a 
                    href={selectedApplication.evidence_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedApplication.evidence_name || 'View Document'}
                  </a>
                </p>
              )}
              
              {/* Add boss comment if it exists and status is not pending */}
              {selectedApplication.status !== 'pending' && selectedApplication.boss_comment && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="font-medium">Manager's Comment:</p>
                  <p className="text-sm mt-1">{selectedApplication.boss_comment}</p>
                </div>
              )}
              
              {selectedApplication.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Add any notes or comments about this leave request"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedApplication?.status === 'pending' ? (
              <div className="flex gap-2 w-full sm:justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedApplication(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleAction('rejected')}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button 
                  onClick={() => handleAction('approved')}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Approve'
                  )}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


