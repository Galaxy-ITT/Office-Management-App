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
  CheckSquare,
  PlusCircle,
  UserCircle,
  Calendar,
  RefreshCw,
  Edit,
  Eye,
  Clock
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { fetchAssignedTasks, addTask, updateTask, fetchDepartmentEmployees } from './_queries'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Define interfaces
interface Task {
  task_id: string;
  id: string; // Aliased task_id used in UI
  title: string;
  description: string;
  employee_id: string;
  employee_name: string;
  assigned_by: number;
  assigner_name: string;
  due_date: string;
  priority: string;
  status: string;
  department_id: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
  employee_id: string;
  name: string;
  email: string;
  position: string;
  department_id: number;
}

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  employee_id: z.string().min(1, { message: "Employee is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  due_date: z.string().min(1, { message: "Due date is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
  status: z.string().default("pending")
})

type TaskFormValues = z.infer<typeof taskSchema>

export default function AssignedTasks() {
  const { userData } = useContext(UserContext)
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      employee_id: "",
      description: "",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to one week from now
      priority: "medium",
      status: "pending"
    }
  })

  // Fetch tasks and employees
  useEffect(() => {
    
    const loadTasks = async () => {
      setLoading(true)
      try {
        if (!userData?.employee_id || !userData?.admin_id) {
          toast({
            title: "Error",
            description: "Employee ID or Admin ID not found",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
        
        const result = await fetchAssignedTasks(userData.admin_id)
        if (result.success && result.data) {
          setTasks(result.data as Task[])
          console.log(tasks)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load assigned tasks",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    const loadEmployees = async () => {
      try {
        // Add null check for admin_id
        if (!userData?.admin_id) {
          throw new Error("Admin ID is required")
        }
        
        if (!userData.department_id) {
          throw new Error("Department ID is required")
        }
        
        const result = await fetchDepartmentEmployees(userData.department_id)
        if (result.success && result.data) {
          setEmployees(result.data as Employee[])
          console.log(employees)
        }
      } catch (error) {
        console.error("Error loading employees:", error)
      }
    }

    if (userData?.employee_id) {
      loadTasks()
      loadEmployees()
    }
  }, [userData, toast])

  // Handle search
  const filteredTasks = tasks.filter((task) =>
    Object.values(task).some((val) =>
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // View task details
  const handleViewTask = (task: Task): void => {
    setSelectedTask(task)
    setViewDialogOpen(true)
  }

  // Edit task
  const handleEditTask = (task: Task): void => {
    setSelectedTask(task)
    form.reset({
      title: task.title,
      employee_id: task.employee_id,
      description: task.description,
      due_date: task.due_date.split('T')[0],
      priority: task.priority,
      status: task.status
    })
    setEditDialogOpen(true)
  }

  // Add new task
  const handleAddTask = (): void => {
    form.reset({
      title: "",
      employee_id: "",
      description: "",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "medium",
      status: "pending"
    })
    setAddDialogOpen(true)
  }

  // Submit form
  const onSubmit = async (data: TaskFormValues): Promise<void> => {
    setIsSubmitting(true)
    try {
      // Ensure admin_id and department_id are available
      if (!userData?.admin_id || !userData?.department_id) {
        throw new Error("Admin ID and Department ID are required")
      }
      
      let result
      
      if (editDialogOpen && selectedTask) {
        result = await updateTask(selectedTask.task_id, {
          ...data,
          department_id: userData.department_id,
          assigned_by: userData.admin_id
        })
      } else {
        result = await addTask({
          ...data,
          department_id: userData.department_id,
          assigned_by: userData.admin_id
        })
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Task ${editDialogOpen ? "updated" : "created"} successfully`,
        })
        
        // Refresh data
        if (userData?.admin_id && userData.employee_id) {
          const refreshResult = await fetchAssignedTasks(userData.admin_id)
          if (refreshResult.success && refreshResult.data) {
            setTasks(refreshResult.data as Task[])
          }
        }
        
        // Close dialogs
        setAddDialogOpen(false)
        setEditDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${editDialogOpen ? "update" : "create"} task`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${editDialogOpen ? "updating" : "creating"} task:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${editDialogOpen ? "updating" : "creating"} the task`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get priority badge variant
  const getPriorityBadge = (priority: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (priority) {
      case 'high':
        return "destructive"
      case 'medium':
        return "default"
      case 'low':
        return "secondary"
      default:
        return "outline"
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: string): "success" | "default" | "outline" | "destructive" => {
    switch (status) {
      case 'completed':
        return "success"
      case 'in_progress':
        return "default"
      case 'pending':
        return "outline"
      case 'canceled':
        return "destructive"
      default:
        return "outline"
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    if (!userData || !userData.employee_id || !userData.admin_id) {
      toast({
        title: "Error",
        description: "Required user data not found",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const refreshResult = await fetchAssignedTasks(userData.admin_id)
      if (refreshResult.success && refreshResult.data) {
        setTasks(refreshResult.data as Task[])
        toast({
          title: "Success",
          description: "Tasks refreshed successfully"
        })
      } else {
        toast({
          title: "Error",
          description: refreshResult.error || "Failed to refresh tasks",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error)
      toast({
        title: "Error",
        description: "An error occurred while refreshing data",
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
            <CardTitle>Assigned Tasks</CardTitle>
            <CardDescription>
              Manage and track tasks assigned to your team
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8 w-[250px]"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleAddTask}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
            <p className="text-muted-foreground">
              There are no assigned tasks available.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No tasks found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.task_id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.employee_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(task.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadge(task.priority)}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(task.status)}>
                          {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewTask(task)}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
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
      </CardContent>

      {/* View Task Dialog */}
      {selectedTask && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>
                Task details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Assigned To:</div>
                <div className="col-span-3">{selectedTask.employee_name}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Due Date:</div>
                <div className="col-span-3">{formatDate(selectedTask.due_date)}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Priority:</div>
                <div className="col-span-3">
                  <Badge variant={getPriorityBadge(selectedTask.priority)}>
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Status:</div>
                <div className="col-span-3">
                  <Badge variant={getStatusBadge(selectedTask.status)}>
                    {selectedTask.status.replace('_', ' ').charAt(0).toUpperCase() + selectedTask.status.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Description:</div>
                <div className="col-span-3">{selectedTask.description}</div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button variant="outline" onClick={() => {
                setViewDialogOpen(false)
                handleEditTask(selectedTask)
              }}>Edit Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setAddDialogOpen(false)
          setEditDialogOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editDialogOpen ? "Edit Task" : "Assign New Task"}</DialogTitle>
            <DialogDescription>
              {editDialogOpen 
                ? "Update the task details below" 
                : "Assign a new task to a team member"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem 
                            key={employee.employee_id} 
                            value={employee.employee_id}
                          >
                            {employee.name} ({employee.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="Enter task description" 
                        className="resize-none h-20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {editDialogOpen && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false)
                    setEditDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editDialogOpen ? "Update Task" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 