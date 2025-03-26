"use client"

import { useState, useContext, useEffect } from "react"
import { UserContext } from "@/userContext/userContext"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"
import { BossSidebar } from "./components/BossSidebar"
import StaffList from "./components/StaffList"
import LeaveRequests from "./components/LeaveRequests"
import FileRecords from "./components/FileRecords"
import PerformanceOverview from "./components/PerformanceOverview"
import { FileSystemProvider } from "../admin/dashboard/file-system-context"
import ReviewedRecords from "./components/ReviewedRecords"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChart3, Clock, FileText, Users, LayoutGrid } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import ApprovedLeaves from "./components/ApprovedLeaves"
import RejectedLeaves from "./components/RejectedLeaves"

export default function BossDashboard() {
  const { userData } = useContext(UserContext)
  const router = useRouter()
  const [activeView, setActiveView] = useState("Dashboard")
  const [dashboardStats, setDashboardStats] = useState({
    staffCount: { value: "0", trend: "+0 this month", trendUp: true },
    pendingLeaves: { value: "0", trend: "+0 from last week", trendUp: true },
    documents: { value: "0", trend: "+12 this month", trendUp: true },
    activity: { value: "0%", trend: "+0% from last month", trendUp: true }
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if user is authenticated
    if (!userData) {
      router.push("/pages/admins-login")
    } else {
      // Fetch dashboard statistics
      loadDashboardData()
    }
  }, [userData, router])
  
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Import the query function from HR components
      const { fetchDashboardStats, fetchEmployees } = await import('../hr/_components/_queries')
      
      // Get dashboard stats
      const statsResult = await fetchDashboardStats()
      
      if (statsResult.success && statsResult.data) {
        // Get staff count from employees table
        const employeesResult = await fetchEmployees()
        const employeeCount = employeesResult.success ? employeesResult.data?.length || 0 : 0
        
        setDashboardStats({
          staffCount: {
            value: employeeCount.toString(),
            trend: `+${Math.floor(employeeCount * 0.1)} this month`, // Example trend calculation
            trendUp: true
          },
          pendingLeaves: {
            value: statsResult.data.pendingLeaves.toString(),
            trend: "+3 from last week",
            trendUp: true
          },
          documents: {
            value: "156", // This could come from a file count query
            trend: "+12 this month",
            trendUp: true
          },
          activity: {
            value: "85%", // This would come from a performance metric
            trend: "+4% from last month",
            trendUp: true
          }
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuSelect = (menu: string) => {
    setActiveView(menu)
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "Dashboard":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <CalendarDateRangePicker />
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard 
                title="Total Staff" 
                value={dashboardStats.staffCount.value} 
                description="Active employees" 
                icon={<Users className="h-5 w-5 text-blue-500" />} 
                trend={dashboardStats.staffCount.trend}
                trendUp={dashboardStats.staffCount.trendUp}
              />
              <StatsCard 
                title="Pending Leaves" 
                value={dashboardStats.pendingLeaves.value} 
                description="Awaiting approval" 
                icon={<Clock className="h-5 w-5 text-amber-500" />} 
                trend={dashboardStats.pendingLeaves.trend}
                trendUp={dashboardStats.pendingLeaves.trendUp}
              />
              <StatsCard 
                title="Documents" 
                value={dashboardStats.documents.value} 
                description="Total files in system" 
                icon={<FileText className="h-5 w-5 text-emerald-500" />} 
                trend={dashboardStats.documents.trend}
                trendUp={dashboardStats.documents.trendUp}
              />
              <StatsCard 
                title="Activity" 
                value={dashboardStats.activity.value} 
                description="Staff performance" 
                icon={<Activity className="h-5 w-5 text-purple-500" />} 
                trend={dashboardStats.activity.trend}
                trendUp={dashboardStats.activity.trendUp}
              />
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LeaveRequests />
                  <PerformanceOverview />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileRecords />
                  <LimitedStaffList 
                    limit={5} 
                    onViewAll={() => setActiveView("Staff List")} 
                  />
                </div>
              </TabsContent>
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                      View detailed performance metrics and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Analytics module will be available soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Reports</CardTitle>
                    <CardDescription>
                      Generate and download various department reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Reports module will be available soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )
      case "Files":
        return <FileRecords />
      case "Staff List":
        return <StaffList />
      case "Leave Requests":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Leave Management</h2>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending Leaves</TabsTrigger>
                <TabsTrigger value="approved">Approved Leaves</TabsTrigger>
                <TabsTrigger value="rejected">Rejected Leaves</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <LeaveRequests />
              </TabsContent>
              <TabsContent value="approved">
                <ApprovedLeaves />
              </TabsContent>
              <TabsContent value="rejected">
                <RejectedLeaves />
              </TabsContent>
            </Tabs>
          </div>
        )
      case "File Records":
        return <FileRecords />
      case "Performance":
        return <PerformanceOverview />
      case "Reviewed Records":
        return <ReviewedRecords />
      default:
        return <div>Select an option from the sidebar</div>
    }
  }

  return (
    <FileSystemProvider adminData={userData}>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <BossSidebar onMenuSelect={handleMenuSelect} />
          <div className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border h-14 flex items-center px-6">
              <div className="flex-1">
                <h1 className="text-lg font-medium">Office Management System</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-2">
                  <p className="text-sm font-medium">{userData?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{userData?.role || 'Role'}</p>
                </div>
                <Avatar>
                  <AvatarImage src="/avatar-placeholder.jpg" alt={userData?.name || "User"} />
                  <AvatarFallback>
                    {userData?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>
            <main className="p-6">
              {renderActiveView()}
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </FileSystemProvider>
  )
}

function StatsCard({ title, value, description, icon, trend, trendUp = true }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-muted p-2.5">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          <p className={`text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Function to display limited staff list
function LimitedStaffList({ limit = 5, onViewAll }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const { fetchEmployees } = await import('../hr/_components/_queries')
        const result = await fetchEmployees()
        
        if (result.success && result.data) {
          // Only take the first 'limit' employees
          setStaff(result.data.slice(0, limit))
        }
      } catch (error) {
        console.error("Error loading staff:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStaff()
  }, [limit])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Staff</CardTitle>
        <CardDescription>
          View your most recently added staff members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading staff data...</p>
        ) : staff.length > 0 ? (
          <div className="space-y-4">
            {staff.map((employee) => (
              <div key={employee.employee_id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{employee.name?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.position}</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {employee.department}
                </div>
              </div>
            ))}
            <div className="mt-2">
              <Button variant="outline" onClick={onViewAll} size="sm">
                View All Staff
              </Button>
            </div>
          </div>
        ) : (
          <p>No staff members found.</p>
        )}
      </CardContent>
    </Card>
  )
}

