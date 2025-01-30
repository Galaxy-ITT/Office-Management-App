"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminTable } from "./components/admin-table"
import { AdminForm } from "./components/admin-form"

export default function AdminsPage() {
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Admins</h1>
        <Button onClick={() => setIsAddingAdmin(true)}>Add Admin</Button>
      </div>
      {isAddingAdmin ? <AdminForm onSave={() => setIsAddingAdmin(false)} onCancel={() => setIsAddingAdmin(false)} /> : <AdminTable />}
    </div>
  )
}
