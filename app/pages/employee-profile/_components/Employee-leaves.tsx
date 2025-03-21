"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"

// Define the type for leaves data
type LeaveData = {
  leave_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: string
  application_date: string
}

interface EmployeeLeavesProps {
  leaveData: LeaveData[]
  compact?: boolean
}

export function EmployeeLeaves({ leaveData, compact = false }: EmployeeLeavesProps) {
  // Calculate leave duration in days
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end days
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success"
      case "rejected":
        return "destructive"
      case "pending":
        return "warning"
      default:
        return "secondary"
    }
  }

  // Sort leave applications by date (most recent first)
  const sortedLeaves = [...leaveData].sort((a, b) => 
    new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
  )

  // For compact view, show only the most recent 3 applications
  const displayLeaves = compact ? sortedLeaves.slice(0, 3) : sortedLeaves

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Leave Applications</CardTitle>
        <CardDescription>
          View your leave history and application status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leaveData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">No leave applications found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You haven't submitted any leave applications yet.
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[320px]" : "max-h-[450px]"}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLeaves.map((leave) => (
                  <TableRow key={leave.leave_id}>
                    <TableCell className="font-medium">{leave.leave_type}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(leave.start_date)}
                        </span>
                        <span className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(leave.end_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                        <span>{calculateDuration(leave.start_date, leave.end_date)} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(leave.status)}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        {compact && leaveData.length > 3 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing 3 of {leaveData.length} leave applications
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EmployeeLeaves 