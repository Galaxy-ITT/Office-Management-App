'use client'

import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
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
import { Form } from 'antd'
import { Modal } from 'antd'
import { Select } from 'antd'

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
import RolesManagement from './RolesManagement'
import { 
  fetchDashboardStats,
  addEmployee,
  Department,
  fetchDepartments
} from './_queries'

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
  { name: 'Roles Management', icon: UserCheck },
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
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    openPositions: 0,
    upcomingReviews: 0,
    pendingLeaves: 0
  })
  const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [departments, setDepartments] = useState<Department[]>([])
  
  // Get user name and format current date
  const userName = userData?.name || "User"
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
        const result = await fetchDashboardStats();
        if (result.success && result.data) {
          setDashboardStats(result.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    if (activePage === 'Dashboard') {
      loadDashboardStats();
    }
  }, [activePage]);

  // Fetch departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const result = await fetchDepartments();
        if (result.success && result.data) {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    
    loadDepartments();
  }, []);

  // Handle quick action - Add New Employee
  const handleAddNewEmployee = () => {
    form.resetFields();
    form.setFieldsValue({
      position: 'Staff',
      status: 'active'
    });
    setIsAddEmployeeModalVisible(true);
  };

  // Handle employee form submission
  const handleEmployeeFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Add current admin ID for the created_by field
      const adminId = userData?.admin_id || 1;
      
      const result = await addEmployee({
        ...values,
        created_by: adminId
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
        setIsAddEmployeeModalVisible(false);
        
        // Refresh dashboard stats if we're on the dashboard
        if (activePage === 'Dashboard') {
          const updatedStats = await fetchDashboardStats();
          if (updatedStats.success && updatedStats.data) {
            setDashboardStats(updatedStats.data);
          }
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add employee",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

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
    if (!userData || !userData) {
      router.push("/pages/admins-login")
    }
    console.log(userData)
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
            <div className="text-2xl font-bold">{dashboardStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.openPositions}</div>
            <p className="text-xs text-muted-foreground">in final interview stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.upcomingReviews}</div>
            <p className="text-xs text-muted-foreground">Next week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingLeaves}</div>
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
            <Button variant="outline" className="justify-start" onClick={handleAddNewEmployee}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
            {quickActions.slice(1).map((action) => (
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
      
      {/* Add Employee Modal */}
      <Modal
        title="Add New Employee"
        open={isAddEmployeeModalVisible}
        onOk={handleEmployeeFormSubmit}
        onCancel={() => setIsAddEmployeeModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter employee name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="Position"
            initialValue="Staff"
            rules={[{ required: true, message: 'Please enter position' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department_id"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select>
              {departments.map(dept => (
                <Select.Option key={dept.department_id} value={dept.department_id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
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
            activePage === 'Department Management' ? <DepartmentManagement /> :
            activePage === 'Roles Management' ? <RolesManagement /> : ""
          }
        </main>
      </div>
    </SidebarProvider>
  )
}