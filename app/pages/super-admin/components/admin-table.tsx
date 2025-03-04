"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AdminForm } from "./admin-form"
import { getAdmins } from "@/server-side/queries"


type Admin = {
  id: string
  name: string
  email: string
  role: string
  username: string
  password: string
}

const initialAdmins: Admin[] = []

export function AdminTable() {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [hoveredAdmin, setHoveredAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    async function fetchAdmins() { // Define the async function
      const admins = await getAdmins()
      console.log(admins) 
      setAdmins(admins)
    }

    fetchAdmins()
  },[])

  const handleDelete = (id: string) => {
    setAdmins(admins.filter((admin) => admin.id !== id))
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
  }

  const handleSave = (updatedAdmin: Admin) => {
    if (admins.find((admin) => admin.id === updatedAdmin.id)) {
      setAdmins(admins.map((admin) => (admin.id === updatedAdmin.id ? updatedAdmin : admin)))
    } else {
      setAdmins([...admins, updatedAdmin])
    }
    setEditingAdmin(null)
    setIsAddingAdmin(false)
  }

  const handleCancel = () => {
    setEditingAdmin(null)
    setIsAddingAdmin(false)
  }

  const handleMouseEnter = (admin: Admin) => {
    setHoveredAdmin(admin)
  }

  const handleMouseLeave = () => {
    setHoveredAdmin(null)
  }

  if (editingAdmin || isAddingAdmin) {
    return <AdminForm admin={editingAdmin} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <div>
      <Button onClick={() => setIsAddingAdmin(true)} className="mb-4">Add Admin</Button>
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
            <TableRow 
              key={admin.id} 
              onMouseEnter={() => handleMouseEnter(admin)} 
              onMouseLeave={handleMouseLeave}
              className={`cursor-pointer ${hoveredAdmin?.id === admin.id ? "bg-gray-100" : ""}`}
            >
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

      {hoveredAdmin && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-semibold text-lg">Admin Details</h3>
          <p><strong>Name:</strong> {hoveredAdmin.name}</p>
          <p><strong>Email:</strong> {hoveredAdmin.email}</p>
          <p><strong>Role:</strong> {hoveredAdmin.role}</p>
          <p><strong>Username:</strong> {hoveredAdmin.username}</p>
          <p><strong>Password:</strong> {hoveredAdmin.password}</p>
        </div>
      )}
    </div>
  )
}
