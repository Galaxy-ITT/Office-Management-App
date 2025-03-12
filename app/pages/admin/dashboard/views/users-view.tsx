"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { handleFileOperation } from "../file-system-server"

// User type definition
type User = {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  status: "active" | "inactive"
  lastLogin: string
}

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([])

  // Load mock users
  useEffect(() => {
    const loadUsers = async () => {
      // Mock users data
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          role: "admin",
          status: "active",
          lastLogin: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          role: "editor",
          status: "active",
          lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: "3",
          name: "Robert Johnson",
          email: "robert.johnson@example.com",
          role: "editor",
          status: "active",
          lastLogin: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
          id: "4",
          name: "Emily Davis",
          email: "emily.davis@example.com",
          role: "viewer",
          status: "inactive",
          lastLogin: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
        },
        {
          id: "5",
          name: "Michael Wilson",
          email: "michael.wilson@example.com",
          role: "viewer",
          status: "active",
          lastLogin: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
      ]

      setUsers(mockUsers)
    }

    loadUsers()
  }, [])

  const getRoleBadgeVariant = (role: User["role"]): "default" | "secondary" | "outline" => {
    switch (role) {
      case "admin":
        return "default"
      case "editor":
        return "secondary"
      case "viewer":
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusBadgeVariant = (status: User["status"]): "default" | "outline" => {
    return status === "active" ? "default" : "outline"
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${user.name.charAt(0)}`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

