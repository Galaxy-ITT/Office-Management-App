import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const leaveData = {
  approved: [
    { type: "Holiday", startDate: "2023-07-01", endDate: "2023-07-07" },
    { type: "Sick Leave", startDate: "2023-05-15", endDate: "2023-05-16" },
  ],
  rejected: [{ type: "Casual Leave", startDate: "2023-06-01", endDate: "2023-06-02", reason: "High workload" }],
  taken: [
    { type: "Holiday", startDate: "2023-01-01", endDate: "2023-01-05" },
    { type: "Sick Leave", startDate: "2023-03-10", endDate: "2023-03-11" },
  ],
  remainingHolidays: 15,
}

export default function LeaveStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Approved Leaves</h3>
          <ul className="space-y-2">
            {leaveData.approved.map((leave, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {leave.type}: {leave.startDate} to {leave.endDate}
                </span>
                <Badge variant="success">Approved</Badge>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Rejected Leaves</h3>
          <ul className="space-y-2">
            {leaveData.rejected.map((leave, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {leave.type}: {leave.startDate} to {leave.endDate}
                </span>
                <Badge variant="destructive">Rejected</Badge>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Leaves Taken</h3>
          <ul className="space-y-2">
            {leaveData.taken.map((leave, index) => (
              <li key={index}>
                {leave.type}: {leave.startDate} to {leave.endDate}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Remaining Holidays</h3>
          <p>{leaveData.remainingHolidays} days</p>
        </div>
      </CardContent>
    </Card>
  )
}

