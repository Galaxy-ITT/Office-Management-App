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
import { Calendar, Star, User } from "lucide-react"
import { format } from "date-fns"

// Define the type for performance data
type PerformanceData = {
  review_id: string
  rating: number
  review_date: string
  review_period: string
  status: string
  reviewer_id: number
  reviewer_comments: string
  reviewer_name: string
}

interface EmployeePerformanceProps {
  performanceData: PerformanceData[]
}

export function EmployeePerformance({ performanceData }: EmployeePerformanceProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success"
      case "in_progress":
        return "default"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Sort reviews by date (most recent first)
  const sortedPerformanceData = [...performanceData].sort((a, b) => 
    new Date(b.review_date).getTime() - new Date(a.review_date).getTime()
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Performance Reviews</CardTitle>
        <CardDescription>
          Your performance evaluation history and feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[450px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPerformanceData.map((review) => (
                <TableRow key={review.review_id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(review.review_date)}
                    </div>
                  </TableCell>
                  <TableCell>{review.review_period || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {review.reviewer_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(review.status)}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default EmployeePerformance

