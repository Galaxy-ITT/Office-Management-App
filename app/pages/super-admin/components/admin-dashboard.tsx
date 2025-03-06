"use client"

import { useState } from "react"
import { AdminTable } from "./admin-table"
import { AdminForm } from "./admin-form"
import { AdminSidebar } from "./admin-sidebar"
import { AdminAnalytics } from "./admin-analytics"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "./ui/toaster"

type View = "admins" | "analytics" | "logs"

export function AdminDashboard() {
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [currentView, setCurrentView] = useState<View>("admins")
  const [editingAdmin, setEditingAdmin] = useState<any>(null)

  const handleAddAdmin = () => {
    setIsAddingAdmin(true)
    setEditingAdmin(null)
  }

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin)
    setIsAddingAdmin(false)
  }

  const handleSaveAdmin = () => {
    setIsAddingAdmin(false)
    setEditingAdmin(null)
  }

  const handleCancelAdmin = () => {
    setIsAddingAdmin(false)
    setEditingAdmin(null)
  }

  const renderContent = () => {
    if (isAddingAdmin) {
      return <AdminForm onSave={handleSaveAdmin} onCancel={handleCancelAdmin} />
    }

    if (editingAdmin) {
      return <AdminForm admin={editingAdmin} onSave={handleSaveAdmin} onCancel={handleCancelAdmin} />
    }

    switch (currentView) {
      case "admins":
        return <AdminTable onAddAdmin={handleAddAdmin} onEditAdmin={handleEditAdmin} />
      case "analytics":
        return <AdminAnalytics />
      case "logs":
        return <AdminLogs />
      default:
        return <AdminTable onAddAdmin={handleAddAdmin} onEditAdmin={handleEditAdmin} />
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar currentView={currentView} onChangeView={setCurrentView} onAddAdmin={handleAddAdmin} />
      <SidebarInset>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">
            {currentView === "admins" && "Manage Admins"}
            {currentView === "analytics" && "Admin Analytics"}
            {currentView === "logs" && "Admin Logs"}
          </h1>
          {renderContent()}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

function AdminLogs() {
  const logs = [
    { id: 1, admin: "John Doe", action: "Logged in", timestamp: "2023-06-01 09:30:45" },
    { id: 2, admin: "Jane Smith", action: "Created new admin", timestamp: "2023-06-01 10:15:22" },
    { id: 3, admin: "Mike Johnson", action: "Updated admin role", timestamp: "2023-06-01 11:05:17" },
    { id: 4, admin: "Sarah Williams", action: "Deleted admin", timestamp: "2023-06-01 13:45:33" },
    { id: 5, admin: "John Doe", action: "Logged out", timestamp: "2023-06-01 17:30:01" },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.admin}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

