'use client'

import React, { useState, useEffect } from 'react'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchEmployees, Employee } from './_queries'

// Attendance record type
interface AttendanceRecord {
  id: number
  employee_id: string
  date: string
  checkIn: string
  checkOut: string
  status: string
}

export default function AttendanceManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch employees from database
  useEffect(() => {
    const getEmployees = async () => {
      setLoading(true)
      try {
        const result = await fetchEmployees()
        if (result.success && result.data) {
          setEmployees(result.data)
        } else {
          console.error("Failed to fetch employees:", result.error)
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getEmployees()
  }, [])

  // Generate mock attendance for selected employee
  // In a real app, this would fetch from an attendance table
  useEffect(() => {
    if (!selectedEmployeeId) {
      setAttendanceRecords([])
      return
    }
    
    // Create mock attendance records for the selected employee
    const records: AttendanceRecord[] = [
      {
        id: 1,
        employee_id: selectedEmployeeId,
        date: '2024-12-12',
        checkIn: '09:00 AM',
        checkOut: '05:00 PM',
        status: 'Present',
      },
      {
        id: 2,
        employee_id: selectedEmployeeId,
        date: '2024-12-11',
        checkIn: '09:15 AM',
        checkOut: '05:30 PM',
        status: 'Late',
      }
    ]
    
    setAttendanceRecords(records)
  }, [selectedEmployeeId])

  // Get selected employee name
  const getSelectedEmployeeName = () => {
    const employee = employees.find(emp => emp.employee_id === selectedEmployeeId)
    return employee ? employee.name : ''
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0/0</div>
            <p className="text-xs text-muted-foreground">0 employees absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Departures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Approved leaves today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>View and manage attendance by date</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Employee Attendance</CardTitle>
            <CardDescription>View attendance records by employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading employees...</div>
              ) : (
                <>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employee_id} value={employee.employee_id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedEmployeeId ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => {
                          const employee = employees.find(emp => emp.employee_id === selectedEmployeeId);
                          return (
                            <TableRow key={record.id}>
                              <TableCell>{employee?.name}</TableCell>
                              <TableCell>{employee?.department}</TableCell>
                              <TableCell>{record.date}</TableCell>
                              <TableCell>{record.checkIn}</TableCell>
                              <TableCell>{record.checkOut}</TableCell>
                              <TableCell>{record.status}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                      Select an employee to view attendance records
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
