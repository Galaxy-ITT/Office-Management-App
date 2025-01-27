export interface AttendanceData {
  total: number
  daily: number
  weekly: number
  monthly: number
}

export interface EmployeeAttendanceProps {
  employeeName: string
  attendanceData: AttendanceData
}

