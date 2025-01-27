import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AttendanceMetric } from "./AttendanceMetric"
import type { EmployeeAttendanceProps } from "../types/attendance"
import { formatAttendance } from "../utils/formatAttendance"

export function EmployeeAttendance({ employeeName, attendanceData }: EmployeeAttendanceProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">{employeeName}'s Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AttendanceMetric title="Total Attendance" value={attendanceData.total} unit="Days" />
          <AttendanceMetric title="Daily Average" value={attendanceData.daily} unit="Hours/Day" />
          <AttendanceMetric title="Weekly Average" value={attendanceData.weekly} unit="Hours/Week" />
          <AttendanceMetric title="Monthly Average" value={attendanceData.monthly} unit="Days/Month" />
        </div>
      </CardContent>
    </Card>
  )
}

