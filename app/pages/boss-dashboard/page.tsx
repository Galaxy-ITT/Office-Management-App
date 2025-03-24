"use client"

import { useState, useContext, useEffect } from "react"
import { UserContext } from "@/userContext/userContext"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { BossSidebar } from "./components/BossSidebar"
import StaffList from "./components/StaffList"
import LeaveRequests from "./components/LeaveRequests"
import FileRecords from "./components/FileRecords"
import PerformanceOverview from "./components/PerformanceOverview"
import { FileSystemProvider } from "../admin/dashboard/file-system-context"
import ReviewedRecords from "./components/ReviewedRecords"

export default function BossDashboard() {
  const { userData } = useContext(UserContext)
  const router = useRouter()
  const [activeView, setActiveView] = useState("Dashboard")
  
  useEffect(() => {
    // Check if user is authenticated
    if (!userData) {
      router.push("/pages/admins-login")
    }
  }, [userData, router])

  const handleMenuSelect = (menu: string) => {
    setActiveView(menu)
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "Dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StaffList />
              <LeaveRequests />
              <FileRecords />
              <PerformanceOverview />
            </div>
          </div>
        )
      case "Files":
        return <FileRecords />
      case "Staff List":
        return <StaffList />
      case "Leave Requests":
        return <LeaveRequests />
      case "File Records":
        return <FileRecords />
      case "Performance":
        return <PerformanceOverview />
      case "Reviewed Records":
        return <ReviewedRecords />
      // Add more views as needed
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StaffList />
              <LeaveRequests />
              <FileRecords />
              <PerformanceOverview />
            </div>
          </div>
        )
    }
  }

  return (
    <FileSystemProvider adminData={userData}>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <BossSidebar onMenuSelect={handleMenuSelect} />
          <SidebarInset className="flex-1">
            <main className="flex-1 p-6">{renderActiveView()}</main>
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    </FileSystemProvider>
  )
}

