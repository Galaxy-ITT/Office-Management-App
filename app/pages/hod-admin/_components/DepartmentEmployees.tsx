'use client'

import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '@/userContext/userContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Search,
  Mail,
  Phone,
  User,
  RefreshCw,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchDepartmentEmployees } from './_queries'

// Define Employee interface
interface Employee {
  employee_id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  department_id: number;
  department_name?: string;
}

export default function DepartmentEmployees() {
  const { userData } = useContext(UserContext)
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  // Fetch department employees
  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true)
      try {
        if (!userData?.admin_id || !userData?.department_id) {
          toast({
            title: "Error",
            description: "User ID or Department ID not found",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
        
        const result = await fetchDepartmentEmployees(userData.department_id)
        if (result.success && result.data) {
          setEmployees(result.data as Employee[])
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
          description: "An error occurred while loading data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (userData?.admin_id) {
      loadEmployees()
    }
  }, [userData, toast])

  // Handle search
  const filteredEmployees = employees.filter((employee) =>
    Object.values(employee).some((val) =>
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  // Refresh employee list
  const handleRefresh = async () => {
    if (!userData?.admin_id || !userData?.department_id) {
      toast({
        title: "Error",
        description: "User ID or Department ID not found",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    try {
      const result = await fetchDepartmentEmployees(userData.department_id)
      if (result.success && result.data) {
        setEmployees(result.data as Employee[])
        toast({
          title: "Refreshed",
          description: "Employee list has been updated",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh employee list",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Department Employees</CardTitle>
            <CardDescription>
              Manage and view employees in your department
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8 w-[250px]"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-10">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No employees found</h3>
            <p className="text-muted-foreground">
              There are no employees assigned to your department.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No employees found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {employee.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'active' ? 'default' : 'destructive'}>
                          {employee.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Profile</Button>
                          <Button variant="outline" size="sm">Review</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 