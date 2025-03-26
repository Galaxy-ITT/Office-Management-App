"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { fetchRejectedLeaves } from "./_queries"

// Define interface for rejected leave data
interface RejectedLeave {
  leave_id: string;
  employee_id: string;
  employee_name: string;
  employee_position: string;
  department_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  rejected_by_name: string;
  rejection_date: string;
  rejection_reason: string | null;
  evidence_url: string | null;
  evidence_name: string | null;
}

export default function RejectedLeaves() {
  const [rejectedLeaves, setRejectedLeaves] = useState<RejectedLeave[]>([])
  const [selectedLeave, setSelectedLeave] = useState<RejectedLeave | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRejectedLeaves()
  }, [])

  const loadRejectedLeaves = async (): Promise<void> => {
    setLoading(true)
    try {
      const result = await fetchRejectedLeaves()
      if (result.success && result.data) {
        setRejectedLeaves(result.data as RejectedLeave[])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load rejected leaves",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading rejected leaves:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date helper
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (e) {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejected Leaves</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : rejectedLeaves.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No rejected leaves found</p>
        ) : (
          <>
            {/* List view for mobile */}
            <div className="md:hidden space-y-4">
              {rejectedLeaves.map((leave) => (
                <div key={leave.leave_id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{leave.employee_name}</p>
                      <p className="text-sm text-muted-foreground">{leave.employee_position}</p>
                    </div>
                    <Badge className="bg-red-500">Rejected</Badge>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">Department:</span> {leave.department_name || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Leave Type:</span> {leave.leave_type}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Period:</span> {formatDate(leave.start_date)} to {formatDate(leave.end_date)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Rejected by:</span> {leave.rejected_by_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Rejected on:</span> {formatDate(leave.rejection_date)}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setSelectedLeave(leave)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {/* Table view for larger screens */}
            <div className="hidden md:block">
              <Table>
                <TableCaption>List of rejected leave applications</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Rejected By</TableHead>
                    <TableHead>Rejected On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedLeaves.map((leave) => (
                    <TableRow key={leave.leave_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{leave.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{leave.employee_position}</p>
                        </div>
                      </TableCell>
                      <TableCell>{leave.department_name || 'N/A'}</TableCell>
                      <TableCell>{leave.leave_type}</TableCell>
                      <TableCell>{formatDate(leave.start_date)}</TableCell>
                      <TableCell>{formatDate(leave.end_date)}</TableCell>
                      <TableCell>{leave.rejected_by_name}</TableCell>
                      <TableCell>{formatDate(leave.rejection_date)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          View Details
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

      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <p>
                <strong>Employee:</strong> {selectedLeave.employee_name}
              </p>
              <p>
                <strong>Position:</strong> {selectedLeave.employee_position}
              </p>
              <p>
                <strong>Department:</strong> {selectedLeave.department_name || 'N/A'}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedLeave.leave_type}
              </p>
              <p>
                <strong>Period:</strong> {formatDate(selectedLeave.start_date)} to {formatDate(selectedLeave.end_date)}
              </p>
              <p>
                <strong>Reason:</strong> {selectedLeave.reason || 'No reason provided'}
              </p>
              <p>
                <strong>Rejected By:</strong> {selectedLeave.rejected_by_name}
              </p>
              <p>
                <strong>Rejected On:</strong> {formatDate(selectedLeave.rejection_date)}
              </p>
              <p>
                <strong>Rejection Reason:</strong> {selectedLeave.rejection_reason || 'No reason provided'}
              </p>
              {selectedLeave.evidence_url && (
                <p>
                  <strong>Supporting Document:</strong>{' '}
                  <a 
                    href={selectedLeave.evidence_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedLeave.evidence_name || 'View Document'}
                  </a>
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLeave(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 