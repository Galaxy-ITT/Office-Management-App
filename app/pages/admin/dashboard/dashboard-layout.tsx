"use client"

import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import { handleFileOperation } from "./file-system-server"
import DashboardView from "./views/dashboard-view"
import FilesView from "./views/files-view"
import SearchRecordsView from "./views/search-records-view"
import OpenFilesView from "./views/open-files-view"
import RecentActivitiesView from "./views/recent-activities-view"
import UsersView from "./views/users-view"
import NewFileDialog from "./new-file-dialog"

export default function DashboardLayout({ adminData }: { adminData: any }) {
  const [activeView, setActiveView] = useState("Files")
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleMenuSelect = async (menu: string) => {
    setActiveView(menu)

    // Call server component with appropriate parameters
    let result
    switch (menu) {
      case "Create New File":
      //  result = await handleFileOperation("admin123", "admin", true)
        setIsNewFileDialogOpen(true)
        break
      case "Open Files":
      //  result = await handleFileOperation("admin123", "admin", false, false, false)
        break
      case "Recent Activities":
        // result = await handleFileOperation("admin123", "admin", false, true, false)
        break
      default:
       // result = await handleFileOperation("admin123", "admin", false, false, false)
    }

    console.log("Server response for menu:", menu, result)

    toast({
      title: `${menu}`,
      description: `Navigated to ${menu} view`,
    })
  }

  const handleFileCreated = () => {
    toast({
      title: "File Created",
      description: "The new file has been created successfully.",
    })
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "Dashboard":
        return <DashboardView />
      case "Files":
        return <FilesView />
      case "Search Records":
        return <SearchRecordsView />
      case "Open Files":
        return <OpenFilesView />
      case "Recent Activities":
        return <RecentActivitiesView />
      case "Users":
        return <UsersView />
      default:
        return <FilesView />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar onMenuSelect={handleMenuSelect} />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-6">{renderActiveView()}</main>
        </SidebarInset>
      </div>

      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        onFileCreated={handleFileCreated}
        adminData={adminData}
      />
    </SidebarProvider>
  )
}

