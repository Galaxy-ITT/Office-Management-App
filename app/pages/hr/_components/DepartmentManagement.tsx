 'use client'

import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from "@/userContext/userContext"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Building2, 
  LayoutGrid, 
  RefreshCw, 
  Loader2 
} from 'lucide-react'

import { 
  fetchDepartments, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment, 
  Department 
} from './_queries'

// Form validation schema
const departmentSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters" }),
  description: z.string().optional(),
  head_of_department: z.string().optional(),
  location: z.string().optional(),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { userData } = useContext(UserContext)
  const { toast } = useToast()

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      description: '',
      head_of_department: '',
      location: '',
    },
  })

  // Load departments on component mount
  useEffect(() => {
    loadDepartments()
  }, [])

  async function loadDepartments() {
    setIsLoading(true)
    try {
      const result = await fetchDepartments()
      if (result.success && result.data) {
        setDepartments(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load departments",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleAddNew() {
    setIsEditMode(false)
    setCurrentDepartment(null)
    form.reset({
      name: '',
      description: '',
      head_of_department: '',
      location: '',
    })
    setShowDialog(true)
  }

  function handleEdit(department: Department) {
    setIsEditMode(true)
    setCurrentDepartment(department)
    form.reset({
      name: department.name,
      description: department.description || '',
      head_of_department: department.head_of_department || '',
      location: department.location || '',
    })
    setShowDialog(true)
  }

  function handleDeleteClick(departmentId: number) {
    setDeleteId(departmentId)
  }

  async function handleDelete() {
    if (!deleteId) return
    
    try {
      const result = await deleteDepartment(deleteId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        loadDepartments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete department",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  async function onSubmit(data: DepartmentFormValues) {
    if (!userData?.data?.admin_id) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && currentDepartment) {
        // Update existing department
        const result = await updateDepartment(currentDepartment.department_id, data)
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          })
          loadDepartments()
          setShowDialog(false)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update department",
            variant: "destructive",
          })
        }
      } else {
        // Add new department
        const result = await addDepartment({
          ...data,
          created_by: userData.data.admin_id,
        })
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          })
          loadDepartments()
          setShowDialog(false)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add department",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Department Management</CardTitle>
            <CardDescription>
              Create and manage organizational departments
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadDepartments} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-10">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No departments found</h3>
              <p className="text-muted-foreground">
                Create your first department to get started.
              </p>
              <Button onClick={handleAddNew} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Head of Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.department_id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.head_of_department || '-'}</TableCell>
                    <TableCell>{dept.location || '-'}</TableCell>
                    <TableCell>{dept.admin_name}</TableCell>
                    <TableCell>{formatDate(dept.date_created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(dept)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(dept.department_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Department</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the "{dept.name}" department? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={handleDelete}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Department Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Department" : "Add New Department"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter department description" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="head_of_department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head of Department</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Department leader" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Office location" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}