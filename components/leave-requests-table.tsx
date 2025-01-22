import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const leaveRequests = [
  {
    id: 1,
    employee: "John Doe",
    startDate: "2023-07-01",
    endDate: "2023-07-05",
    type: "Vacation",
    status: "Pending",
  },
  {
    id: 2,
    employee: "Jane Smith",
    startDate: "2023-07-10",
    endDate: "2023-07-12",
    type: "Sick Leave",
    status: "Approved",
  },
  {
    id: 3,
    employee: "Bob Johnson",
    startDate: "2023-07-15",
    endDate: "2023-07-16",
    type: "Personal",
    status: "Pending",
  },
  {
    id: 4,
    employee: "Alice Brown",
    startDate: "2023-07-20",
    endDate: "2023-07-25",
    type: "Vacation",
    status: "Pending",
  },
]

export function LeaveRequestsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employee}</TableCell>
                <TableCell>{request.startDate}</TableCell>
                <TableCell>{request.endDate}</TableCell>
                <TableCell>{request.type}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {request.status === "Pending" && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

