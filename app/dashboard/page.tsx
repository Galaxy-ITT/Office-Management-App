"use client"

import { Toaster } from "@/components/ui/toaster"
import { FileSystemProvider } from "@/components/dashboard/file-system-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default function DashboardPage() {
  return (
    <FileSystemProvider>
      <DashboardLayout />
      <Toaster />
    </FileSystemProvider>
  )
}

