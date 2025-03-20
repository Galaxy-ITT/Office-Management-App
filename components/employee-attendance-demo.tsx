import { EmployeeAttendance } from "../app/pages/employee-profile/_components/EmployeeAttendance"

const mockAttendanceData = {
  total: 230,
  daily: 7.5,
  weekly: 37.5,
  monthly: 21,
}

export default function EmployeeAttendanceDemo() {
  return (
    <div className="p-4 bg-background min-h-screen flex items-center justify-center">
      <EmployeeAttendance employeeName="John Doe" attendanceData={mockAttendanceData} />
    </div>
  )
}

