"use client"

import { Toaster } from "@/components/ui/toaster"
import { FileSystemProvider } from "@/app/pages/admin/dashboard/file-system-context"
import DashboardLayout from "@/app/pages/admin/dashboard/dashboard-layout"
import { useContext } from "react"
import { UserContext } from "@/userContext/userContext"

export default function DashboardPage() {
  const { userData } = useContext(UserContext)
  console.log(userData)
  return (
    <FileSystemProvider>
      <DashboardLayout />
      <Toaster />
    </FileSystemProvider>
  )
}

