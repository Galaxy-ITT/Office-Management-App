'use client'

import * as React from 'react'
import {
  BarChart3,
  Users,
  UserCircle,
  ClipboardCheck,
  CalendarDays,
  DollarSign,
  Star,
  UserPlus,
  Gift,
  GraduationCap,
  LineChart,
  Menu,
  Search,
  Bell,
  Briefcase,
  UserCheck,
  ChevronRight,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import EmployeeDirectory from './EmployeeDirectory'

const pages = [
  { name: 'Dashboard', icon: BarChart3 },
  { name: 'Employee Directory', icon: Users },
  { name: 'Employee Profile', icon: UserCircle },
  { name: 'Attendance Management', icon: ClipboardCheck },
  { name: 'Leave Management', icon: CalendarDays },
  { name: 'Payroll Management', icon: DollarSign },
  { name: 'Performance Reviews', icon: Star },
  { name: 'Recruitment', icon: UserPlus },
  { name: 'Benefits and Compensation', icon: Gift },
  { name: 'Training and Development', icon: GraduationCap },
  { name: 'Reports and Analytics', icon: LineChart },
]

const quickActions = [
  { name: 'Add New Employee', icon: UserPlus },
  { name: 'Approve Leave Requests', icon: CalendarDays },
  { name: 'Review Timesheets', icon: ClipboardCheck },
  { name: 'Schedule Performance Review', icon: Star },
]

const recentActivities = [
  { action: 'New employee onboarded', name: 'John Doe', department: 'Marketing' },
  { action: 'Leave request approved', name: 'Jane Smith', department: 'Engineering' },
  { action: 'Performance review completed', name: 'Mike Johnson', department: 'Sales' },
  { action: 'Salary adjustment', name: 'Emily Brown', department: 'Finance' },
]

export function HrModule() {
  const [activePage, setActivePage] = React.useState('Dashboard')

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">4 in final interview stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Next week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <Button key={action.name} variant="outline" className="justify-start">
                <action.icon className="mr-2 h-4 w-4" />
                {action.name}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest HR activities across the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="ml-2 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.name} - {activity.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold truncate">HR Module</h1>
              <SidebarTrigger>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SidebarTrigger>
            </div>
            <div className="relative group-data-[collapsible=icon]:hidden">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" className="pl-8" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {pages.map((page) => (
                <SidebarMenuItem key={page.name}>
                  <SidebarMenuButton
                    onClick={() => setActivePage(page.name)}
                    isActive={activePage === page.name}
                    tooltip={page.name}
                  >
                    <page.icon className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden ml-2">{page.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">© 2024 Your Company</p>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">{activePage}</h2>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
          {activePage === 'Dashboard' ? renderDashboard() : 
            activePage === 'Employee Directory' ? <EmployeeDirectory /> : 
            <p>Content for {activePage} goes here.</p>
          }
        </main>
      </div>
    </SidebarProvider>
  )
}