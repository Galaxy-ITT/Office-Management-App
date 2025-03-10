"use client"

import { Toaster } from "@/components/ui/toaster"
import { FileSystemProvider } from "@/app/pages/admin/dashboard/file-system-context"
import DashboardLayout from "@/app/pages/admin/dashboard/dashboard-layout"
import { useContext, useEffect } from "react"
import { UserContext } from "@/userContext/userContext"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { userData } = useContext(UserContext)
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is authenticated
    if (!userData || !userData.data) {
      router.push("/pages/admins-login")
    }
  }, [userData, router])

  return (
    <FileSystemProvider adminData={userData?.data}>
      <DashboardLayout 
        adminData={userData?.data}
      />
      <Toaster />
    </FileSystemProvider>
  )
}

