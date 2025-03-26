"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { fetchEmployees, Employee } from "./_queries"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function StaffList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const result = await fetchEmployees()
      if (result.success && result.data) {
        setEmployees(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load employees",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading employees:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'active') {
      return <Badge variant="default">Active</Badge>
    } else if (statusLower.includes('leave')) {
      return <Badge variant="secondary">On Leave</Badge>
    } else if (statusLower === 'inactive') {
      return <Badge variant="outline">Inactive</Badge>
    } else {
      return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff List</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No employees found</p>
        ) : (
          <ul className="space-y-4">
            {employees.map((employee) => (
              <li key={employee.employee_id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`/staff-placeholder.jpg`} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.position}, {employee.department_name || 'No Department'}
                  </p>
                </div>
                {getStatusBadge(employee.status)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

