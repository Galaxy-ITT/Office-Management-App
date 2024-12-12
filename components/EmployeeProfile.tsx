'use client'

import React from 'react'
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

interface EmployeeProfileProps {
  employee?: {
    id: string
    name: string
    position: string
    department: string
    email: string
    phone: string
    status: 'active' | 'inactive'
    hireDate: string
    salary: number
    manager: string
  }
}

export default function EmployeeProfile({ employee }: EmployeeProfileProps) {
  // Mock data - replace with actual data fetching
  const mockEmployee = employee || {
    id: '1',
    name: 'John Doe',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    status: 'active',
    hireDate: '2020-01-15',
    salary: 95000,
    manager: 'Jane Smith'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>{mockEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{mockEmployee.name}</h2>
                <p className="text-muted-foreground">{mockEmployee.position}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{mockEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">{mockEmployee.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{mockEmployee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{mockEmployee.phone}</p>
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
              <p>Performance review content goes here</p>
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
              <p>Leave history content goes here</p>
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
              <p>Payroll information content goes here</p>
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
              <p>Documents content goes here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
