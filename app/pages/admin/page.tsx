"use client"

import { Toaster } from "@/components/ui/toaster"
import { FileSystemProvider } from "@/app/pages/admin/dashboard/file-system-context"
import DashboardLayout from "@/app/pages/admin/dashboard/dashboard-layout"

export default function DashboardPage() {
  return (
    <FileSystemProvider>
      <DashboardLayout />
      <Toaster />
    </FileSystemProvider>
  )
}

