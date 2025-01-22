import type { Metadata } from "next"
import AdminDashboard from "@/components/admin-dashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Head of Admin Dashboard for staff management and performance review",
}

export default function DashboardPage() {
  return <AdminDashboard />
}

