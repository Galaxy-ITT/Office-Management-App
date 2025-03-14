'use client'

import * as React from 'react'
import { useContext, useEffect } from 'react'
import { UserContext } from "@/userContext/userContext"
import { useRouter } from "next/navigation"
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
  LogOut,
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
import { useToast } from "@/hooks/use-toast"

import EmployeeDirectory from './EmployeeDirectory'
import BenefitsCompensation from './BenefitsCompensation'
import EmployeeProfile from './EmployeeProfile'
import LeaveManagement from './LeaveManagement'
import PayrollManagement from './PayrollManagement'
import PerformanceReviews from './PerformanceReviews'
import Recruitment from './Recruitment'
import ReportsAnalytics from './ReportsAnalytics'
import TrainingDevelopment from './TrainingDevelopment'
import AttendanceManagement from './AttendanceManagement'
import DepartmentManagement from './DepartmentManagement'

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
  { name: 'Department Management', icon: Briefcase },
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
  const { userData } = useContext(UserContext)
  const router = useRouter()
  const { toast } = useToast()
  
  // Get user name and format current date
  const userName = userData?.data?.name || "User"
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear()
    router.push("/")
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  // Authentication check
  useEffect(() => {
    // Check if user is authenticated
    if (!userData || !userData.data) {
      router.push("/pages/admins-login")
    }
  }, [userData, router])

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
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Welcome, {userName}</p>
                <p className="text-xs text-muted-foreground">{currentDate}</p>
              </div>
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
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
            activePage === 'Employee Profile' ? <EmployeeProfile /> :
            activePage === 'Attendance Management' ? <AttendanceManagement /> :
            activePage === 'Benefits and Compensation' ? <BenefitsCompensation /> :
            activePage === 'Leave Management' ? <LeaveManagement /> :
            activePage === 'Payroll Management' ? <PayrollManagement /> :
            activePage === 'Performance Reviews' ? <PerformanceReviews /> :
            activePage === 'Recruitment' ? <Recruitment /> :
            activePage === 'Reports and Analytics' ? <ReportsAnalytics /> :
            activePage === 'Training and Development' ? <TrainingDevelopment /> : 
            activePage === 'Department Management' ? <DepartmentManagement /> : ""
          }
        </main>
      </div>
    </SidebarProvider>
  )
}