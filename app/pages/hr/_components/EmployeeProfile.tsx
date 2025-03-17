'use client'

import React, { useState, useEffect } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, Spin, message } from 'antd'
import { 
  fetchEmployees, 
  fetchDepartments,
  Employee,
  Department
} from './_queries'

export default function EmployeeProfile() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch employees and departments data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesResult = await fetchEmployees();
        if (employeesResult.success && employeesResult.data) {
          setEmployees(employeesResult.data);
          // Set the first employee as selected by default if available
          if (employeesResult.data.length > 0) {
            setSelectedEmployee(employeesResult.data[0]);
          }
        } else {
          message.error('Failed to load employees');
        }

        // Fetch departments
        const departmentsResult = await fetchDepartments();
        if (departmentsResult.success && departmentsResult.data) {
          setDepartments(departmentsResult.data);
        } else {
          message.error('Failed to load departments');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        message.error('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find department name by department_id
  const getDepartmentName = (departmentId: number | undefined | null): string => {
    if (!departmentId) return 'Not Assigned';
    const department = departments.find(dept => dept.department_id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  // Handle employee selection change
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(emp => emp.employee_id === employeeId);
    setSelectedEmployee(employee || null);
  };

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Employee selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Employee</label>
        <Select
          style={{ width: '100%' }}
          placeholder="Select an employee"
          value={selectedEmployee?.employee_id}
          onChange={handleEmployeeChange}
          options={employees.map(emp => ({ 
            value: emp.employee_id, 
            label: emp.name 
          }))}
        />
      </div>

      {selectedEmployee ? (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                    <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{getDepartmentName(selectedEmployee.department_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-sm font-medium capitalize">{selectedEmployee.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hire Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedEmployee.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium">{formatDate(selectedEmployee.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="performance">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="leave">Leave History</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Reviews</CardTitle>
                  <CardDescription>View and manage employee performance reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Performance review content for {selectedEmployee.name}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="leave">
              <Card>
                <CardHeader>
                  <CardTitle>Leave History</CardTitle>
                  <CardDescription>Track employee leave requests and history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Leave history for {selectedEmployee.name}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payroll">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Information</CardTitle>
                  <CardDescription>View employee payroll details and history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Payroll information for {selectedEmployee.name}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Access employee documents and records</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Documents related to {selectedEmployee.name}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No employee selected or no employees available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
