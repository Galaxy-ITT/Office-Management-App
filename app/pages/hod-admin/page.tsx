"use client"

import React, { useContext, useEffect, useState } from "react"
import { UserContext } from "@/userContext/userContext"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Users,
  UserCircle,
  ClipboardCheck,
  CalendarDays,
  Star,
  FileText,
  CheckSquare,
  LineChart,
  Bell,
  ChevronRight,
  LogOut,
  Search,
  Briefcase,
  Building,
  ListChecks,
  Loader2,
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DepartmentEmployees from "./_components/DepartmentEmployees"
import EmployeeProposals from "./_components/EmployeeProposals"
import PerformanceReviews from "./_components/PerformanceReviews"
import AssignedTasks from "./_components/AssignedTasks"
import { fetchDashboardStats } from "./_components/_queries"

const pages = [
  { name: 'Dashboard', icon: BarChart3 },
  { name: 'Department Employees', icon: Users },
  { name: 'Employee Proposals', icon: FileText },
  { name: 'Performance Reviews', icon: Star },
  { name: 'Assigned Tasks', icon: CheckSquare },
  { name: 'Department Analytics', icon: LineChart },
]

const quickActions = [
  { name: 'Review Proposal', icon: FileText },
  { name: 'Schedule Performance Review', icon: Star },
  { name: 'Assign New Task', icon: CheckSquare },
]

// Define the interface for dashboard stats
interface DashboardStats {
  totalEmployees: number;
  pendingProposals: number;
  upcomingReviews: number;
  pendingTasks: number;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('Dashboard')
  const { userData } = useContext(UserContext)
  console.log('User Data:', userData);
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingProposals: 0,
    upcomingReviews: 0,
    pendingTasks: 0
  })

  // Get user name and format current date
  const userName = userData?.name || "Department Head"
  const departmentName = userData?.department_name || "Department"
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Fetch dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true)
        if (!userData?.department_id || !userData?.employee_id) {
          setLoading(false)
          return
        }
        
        const result = await fetchDashboardStats(userData.department_id, userData.employee_id);
        if (result.success && result.data) {
          setDashboardStats(result.data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false)
      }
    }

    if (userData?.department_id && userData?.employee_id) {
      loadDashboardStats();
    }
  }, [userData]);

  // Authentication check
  useEffect(() => {
    // Check if user is authenticated and is an HOD
    if (!userData || userData.role !== "HOD") {
      router.push("/pages/admins-login")
    }
  }, [userData, router])

  // Handle logout
  const handleLogout = () => {
    sessionStorage.clear()
    router.push("/")
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">Active employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingProposals}</div>
                <p className="text-xs text-muted-foreground">Require review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.upcomingReviews}</div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingTasks}</div>
                <p className="text-xs text-muted-foreground">Assignments to complete</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
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
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>Key metrics for {departmentName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Employee Productivity</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Proposals Completion</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Task Assignments</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest activities in your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {String.fromCharCode(65 + index % 26)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {["John Doe", "Mary Smith", "Robert Johnson", "Alice Brown", "James Wilson"][index]} 
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[
                            "Submitted a new proposal",
                            "Completed assigned task",
                            "Updated project status",
                            "Requested performance review",
                            "Added new task update"
                          ][index]}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {["1h ago", "3h ago", "Yesterday", "2 days ago", "3 days ago"][index]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
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
            <div>
              <h2 className="text-3xl font-bold">{activePage}</h2>
              {activePage === 'Dashboard' && (
                <p className="text-muted-foreground">
                  Welcome to {departmentName} Department dashboard
                </p>
              )}
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
          {activePage === 'Dashboard' ? renderDashboard() : 
           activePage === 'Department Employees' ? <DepartmentEmployees /> : 
           activePage === 'Employee Proposals' ? <EmployeeProposals /> :
           activePage === 'Performance Reviews' ? <PerformanceReviews /> :
           activePage === 'Assigned Tasks' ? <AssignedTasks /> :
           activePage === 'Department Analytics' ? (
            <div className="text-center py-10">
              <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Department Analytics</h3>
              <p className="text-muted-foreground">
                Detailed analytics and reporting features coming soon.
              </p>
            </div>
           ) : ""
          }
        </main>
      </div>
    </SidebarProvider>
  )
}

