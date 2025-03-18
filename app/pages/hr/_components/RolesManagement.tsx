'use client'

import React, { useState, useEffect, useContext } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { UserContext } from '@/userContext/userContext'
import {
  fetchRoles,
  addRole,
  updateRole,
  deleteRole,
  fetchEmployees,
  fetchDepartments,
  Employee,
  Department,
  Role,
  RoleInput
} from './_queries'

export default function RolesManagement() {
  const { toast } = useToast()
  const { userData } = useContext(UserContext)
  const [roles, setRoles] = useState<Role[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [filterRole, setFilterRole] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')

  // Form states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<RoleInput>({
    role_name: '',
    employee_id: '',
    department_id: null,
    description: '',
    assigned_by: userData?.admin_id || 0,
    status: 'active'
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch roles
        const rolesResult = await fetchRoles()
        if (rolesResult.success && rolesResult.data) {
          setRoles(rolesResult.data)
        } else {
          toast({
            title: 'Error',
            description: rolesResult.error || 'Failed to load roles',
            variant: 'destructive'
          })
        }

        // Fetch employees
        const employeesResult = await fetchEmployees()
        if (employeesResult.success && employeesResult.data) {
          setEmployees(employeesResult.data)
        } else {
          toast({
            title: 'Error',
            description: employeesResult.error || 'Failed to load employees',
            variant: 'destructive'
          })
        }

        // Fetch departments
        const departmentsResult = await fetchDepartments()
        if (departmentsResult.success && departmentsResult.data) {
          setDepartments(departmentsResult.data)
        } else {
          toast({
            title: 'Error',
            description: departmentsResult.error || 'Failed to load departments',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'An error occurred while loading data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast, userData])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'department_id') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === 'none' ? null : value ? parseInt(value, 10) : null 
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handle add role
  const handleAddRole = async () => {
    try {
      const result = await addRole({
        ...formData,
        assigned_by: userData?.admin_id || 0
      })

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Role assigned successfully'
        })
        setAddDialogOpen(false)
        refreshRoles()
        resetForm()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to assign role',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error adding role:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while assigning role',
        variant: 'destructive'
      })
    }
  }

  // Handle edit role
  const handleEditRole = async () => {
    if (!selectedRole) return

    try {
      const result = await updateRole(selectedRole.role_id, formData)

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Role updated successfully'
        })
        setEditDialogOpen(false)
        refreshRoles()
        resetForm()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update role',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while updating role',
        variant: 'destructive'
      })
    }
  }

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!selectedRole) return

    try {
      const result = await deleteRole(selectedRole.role_id)

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Role deleted successfully'
        })
        setDeleteDialogOpen(false)
        refreshRoles()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete role',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while deleting role',
        variant: 'destructive'
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      role_name: '',
      employee_id: '',
      department_id: null,
      description: '',
      assigned_by: userData?.admin_id || 0,
      status: 'active'
    })
    setSelectedRole(null)
  }

  // Refresh roles data
  const refreshRoles = async () => {
    try {
      const result = await fetchRoles()
      if (result.success && result.data) {
        setRoles(result.data)
      }
    } catch (error) {
      console.error('Error refreshing roles:', error)
    }
  }

  // Set up edit form
  const setupEditForm = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      role_name: role.role_name,
      employee_id: role.employee_id,
      department_id: role.department_id,
      description: role.description || '',
      assigned_by: userData?.admin_id || 0,
      status: role.status
    })
    setEditDialogOpen(true)
  }

  // Set up delete confirmation
  const setupDeleteConfirmation = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter roles
  const filteredRoles = roles.filter(role => {
    // Role name filter
    const roleMatch = filterRole === '' || 
      role.role_name.toLowerCase().includes(filterRole.toLowerCase());
    
    // Department filter
    const departmentMatch = filterDepartment === 'all' || 
      filterDepartment === '' || 
      role.department_id?.toString() === filterDepartment;
    
    return roleMatch && departmentMatch;
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Organizational Roles</CardTitle>
              <CardDescription>Manage roles and responsibilities within the organization</CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetForm()
                  setAddDialogOpen(true)
                }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign New Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Assign New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role assignment for an employee
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="role_name" className="text-right">
                      Role Title
                    </label>
                    <Input
                      id="role_name"
                      name="role_name"
                      value={formData.role_name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="e.g. Head of Department, Team Lead"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="employee_id" className="text-right">
                      Employee
                    </label>
                    <Select
                      value={formData.employee_id}
                      onValueChange={(value) => handleSelectChange('employee_id', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.employee_id} value={employee.employee_id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="department_id" className="text-right">
                      Department
                    </label>
                    <Select
                      value={formData.department_id?.toString() || ''}
                      onValueChange={(value) => handleSelectChange('department_id', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department.department_id} value={department.department_id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Role description and responsibilities"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="status" className="text-right">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value as 'active' | 'inactive')}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>
                    Assign Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Filter by role name..."
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                />
              </div>
              <div className="w-64">
                <Select
                  value={filterDepartment}
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.department_id} value={department.department_id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading roles...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date Assigned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No roles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role) => (
                        <TableRow key={role.role_id}>
                          <TableCell className="font-medium">{role.role_name}</TableCell>
                          <TableCell>{role.employee_name}</TableCell>
                          <TableCell>{role.department_name || 'N/A'}</TableCell>
                          <TableCell>{formatDate(role.date_assigned)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {role.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setupEditForm(role)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setupDeleteConfirmation(role)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details for {selectedRole?.employee_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role_name" className="text-right">
                Role Title
              </label>
              <Input
                id="role_name"
                name="role_name"
                value={formData.role_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="employee_id" className="text-right">
                Employee
              </label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => handleSelectChange('employee_id', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="department_id" className="text-right">
                Department
              </label>
              <Select
                value={formData.department_id?.toString() || ''}
                onValueChange={(value) => handleSelectChange('department_id', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.department_id} value={department.department_id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value as 'active' | 'inactive')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedRole?.role_name} role from {selectedRole?.employee_name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 