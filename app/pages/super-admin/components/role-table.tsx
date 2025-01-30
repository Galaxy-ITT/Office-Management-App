"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RoleForm } from "./role-form"

type Role = {
  id: string
  name: string
  permissions: string[]
}

const initialRoles: Role[] = [
  { id: "1", name: "Super Admin", permissions: ["All"] },
  { id: "2", name: "Content Manager", permissions: ["Create Content", "Edit Content", "Delete Content"] },
  { id: "3", name: "Moderator", permissions: ["Moderate Comments", "Ban Users"] },
]

export function RoleTable() {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const handleDelete = (id: string) => {
    setRoles(roles.filter((role) => role.id !== id))
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
  }

  const handleSave = (updatedRole: Role) => {
    setRoles(roles.map((role) => (role.id === updatedRole.id ? updatedRole : role)))
    setEditingRole(null)
  }

  if (editingRole) {
    return <RoleForm role={editingRole} onSave={handleSave} onCancel={() => setEditingRole(null)} />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell>{role.name}</TableCell>
            <TableCell>{role.permissions.join(", ")}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(role)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(role.id)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

