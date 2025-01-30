"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AdminForm } from "./admin-form"

type Admin = {
  id: string
  name: string
  email: string
  role: string
}

const initialAdmins: Admin[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Super Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Content Manager" },
]

export function AdminTable() {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)

  const handleDelete = (id: string) => {
    setAdmins(admins.filter((admin) => admin.id !== id))
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
  }

  const handleSave = (updatedAdmin: Admin) => {
    // If the admin is already in the list (editing), update it
    if (admins.find((admin) => admin.id === updatedAdmin.id)) {
      setAdmins(admins.map((admin) => (admin.id === updatedAdmin.id ? updatedAdmin : admin)))
    } else {
      // If new, add it to the list
      setAdmins([...admins, updatedAdmin])
    }
    setEditingAdmin(null)
    setIsAddingAdmin(false) // Exit the form after saving
  }

  const handleCancel = () => {
    setEditingAdmin(null)
    setIsAddingAdmin(false) // Cancel the form
  }

  if (editingAdmin || isAddingAdmin) {
    return <AdminForm admin={editingAdmin} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <div>
      <Button onClick={() => setIsAddingAdmin(true)}>Add Admin</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.name}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.role}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(admin)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(admin.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
