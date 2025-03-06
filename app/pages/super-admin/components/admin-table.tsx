"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getAdmins } from "@/server-side/queries"
import { Badge } from "@/components/ui/badge"

type Admin = {
  id: string
  name: string
  email: string
  role: string
  username: string
  password: string
}

type AdminTableProps = {
  onAddAdmin: () => void
  onEditAdmin: (admin: Admin) => void
}

export function AdminTable({ onAddAdmin, onEditAdmin }: AdminTableProps) {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [hoveredAdmin, setHoveredAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    async function fetchAdmins() {
      const admins = await getAdmins()
      //@ts-ignore
      setAdmins(admins)
    }

    fetchAdmins()
  }, [])

  const handleMouseEnter = (admin: Admin) => {
    setHoveredAdmin(admin)
  }

  const handleMouseLeave = () => {
    setHoveredAdmin(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Admin List</h2>
          <p className="text-sm text-muted-foreground">Manage your administrators</p>
        </div>
        <Button onClick={onAddAdmin}>Add Admin</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  {admin.role === "Super Admin" ? (
                    <Badge variant="destructive">{admin.role}</Badge>
                  ) : (
                    <Badge variant="outline">{admin.role}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEditAdmin(admin)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hoveredAdmin && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-semibold text-lg">Admin Details</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{hoveredAdmin.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{hoveredAdmin.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{hoveredAdmin.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{hoveredAdmin.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

