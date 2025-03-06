"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "lucide-react"
import { useEffect, useState } from "react"

// Generated data for admin analytics
const generateAnalyticsData = () => {
  // Generate login data for the past 4 weeks
  const loginData = Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    count: Math.floor(Math.random() * 20) + 10, // Random between 10-30
  }))

  // Generate role distribution data
  const roleData = [
    { role: "Super Admin", count: Math.floor(Math.random() * 3) + 1 }, // 1-3
    { role: "Boss", count: Math.floor(Math.random() * 4) + 2 }, // 2-5
    { role: "Human Resource", count: Math.floor(Math.random() * 5) + 3 }, // 3-7
    { role: "Registry", count: Math.floor(Math.random() * 3) + 1 }, // 1-3
    { role: "HOD", count: Math.floor(Math.random() * 4) + 2 }, // 2-5
    { role: "Employee", count: Math.floor(Math.random() * 6) + 4 }, // 4-9
  ]

  // Calculate totals and changes
  const totalAdmins = roleData.reduce((sum, item) => sum + item.count, 0)
  const activeSessions = Math.floor(Math.random() * totalAdmins * 0.7) + 1 // Random active sessions
  const superAdmins = roleData.find((item) => item.role === "Super Admin")?.count || 0

  // Previous period changes (for comparison)
  const prevMonthAdmins = totalAdmins - (Math.random() > 0.5 ? 2 : -2)
  const prevDayActiveSessions = activeSessions + (Math.random() > 0.5 ? 1 : -1)

  return {
    totalAdmins,
    activeSessions,
    superAdmins,
    loginData,
    roleData,
    changes: {
      admins: totalAdmins - prevMonthAdmins,
      sessions: activeSessions - prevDayActiveSessions,
      superAdmins: 0, // No change in super admins
    },
  }
}

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(() => generateAnalyticsData())

  useEffect(() => {
    // Load external CSS for charts
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "/admin-analytics.css"
    document.head.appendChild(link)

    // Initialize charts when component mounts
    initCharts(analyticsData)

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(link)
    }
  }, [analyticsData])

  // Refresh data function
  const refreshData = () => {
    setAnalyticsData(generateAnalyticsData())
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-medium">Admin Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of administrator activity</p>
        </div>
        <button
          onClick={refreshData}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <CardDescription>All registered administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.changes.admins > 0 ? "+" : ""}
              {analyticsData.changes.admins} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <CardDescription>Currently logged in admins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.changes.sessions > 0 ? "+" : ""}
              {analyticsData.changes.sessions} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <CardDescription>Administrators with full access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.superAdmins}</div>
            <p className="text-xs text-muted-foreground">No change</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logins">
        <TabsList>
          <TabsTrigger value="logins">
            <LineChart className="h-4 w-4 mr-2" />
            Login Activity
          </TabsTrigger>
          <TabsTrigger value="roles">
            <BarChart className="h-4 w-4 mr-2" />
            Role Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
              <CardDescription>Admin login trends over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="login-chart" className="h-80 w-full"></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>Breakdown of admin roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="role-chart" className="h-80 w-full"></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Function to initialize charts with generated data
function initCharts(data) {
  setTimeout(() => {
    const loginChart = document.getElementById("login-chart")
    const roleChart = document.getElementById("role-chart")

    if (loginChart) {
      // Find the maximum login count for scaling
      const maxLoginCount = Math.max(...data.loginData.map((item) => item.count))

      let loginBars = ""
      let loginXAxis = ""

      data.loginData.forEach((week) => {
        const heightPercentage = (week.count / maxLoginCount) * 100
        loginBars += `<div class="login-chart-bar" style="height: ${heightPercentage}%;" title="${week.week}: ${week.count} logins"></div>`
        loginXAxis += `<span>${week.week}</span>`
      })

      loginChart.innerHTML = `
        <div class="login-chart-container">
          <div class="login-chart-y-axis">
            <span>${maxLoginCount}</span>
            <span>${Math.floor(maxLoginCount * 0.75)}</span>
            <span>${Math.floor(maxLoginCount * 0.5)}</span>
            <span>${Math.floor(maxLoginCount * 0.25)}</span>
            <span>0</span>
          </div>
          <div class="login-chart-content">
            <div class="login-chart-bars">
              ${loginBars}
            </div>
            <div class="login-chart-x-axis">
              ${loginXAxis}
            </div>
          </div>
        </div>
      `
    }

    if (roleChart) {
      // Find the maximum role count for scaling
      const maxRoleCount = Math.max(...data.roleData.map((item) => item.count))

      let roleBars = ""

      data.roleData.forEach((role) => {
        const widthPercentage = (role.count / maxRoleCount) * 100
        roleBars += `
          <div class="role-chart-bar-group">
            <div class="role-chart-label">${role.role}</div>
            <div class="role-chart-bar" style="width: ${widthPercentage}%;">${role.count}</div>
          </div>
        `
      })

      roleChart.innerHTML = `
        <div class="role-chart-container">
          <div class="role-chart-bars">
            ${roleBars}
          </div>
        </div>
      `
    }
  }, 100)
}

