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
  Star,
  PlusCircle,
  UserCircle,
  Calendar,
  RefreshCw,
  Edit,
  Eye
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { fetchPerformanceReviews, addReview, updateReview, fetchDepartmentEmployees } from './_queries'

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

// Define PerformanceReview interface
interface PerformanceReview {
  review_id: string;
  employee_id: string;
  employee_name: string;
  reviewer_id: number;
  reviewer_name: string;
  review_date: string;
  rating: number;
  feedback: string;
  goals: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

// Form schema
const reviewFormSchema = z.object({
  employee_id: z.string().min(1, "Please select an employee"),
  rating: z.string().min(1, "Please provide a rating"),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  goals: z.string().min(10, "Goals must be at least 10 characters"),
  status: z.string().min(1, "Please select a status")
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function PerformanceReviews() {
  const { userData } = useContext(UserContext)
  const { toast } = useToast()
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)

  // Form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      employee_id: '',
      rating: '3',
      feedback: '',
      goals: '',
      status: 'pending'
    }
  });

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (!userData?.department_id || !userData?.admin_id) {
          toast({
            title: "Error",
            description: "Department ID or Admin ID not found",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
        
        // Fetch performance reviews
        const reviewsResult = await fetchPerformanceReviews(userData.department_id)
        if (reviewsResult.success && reviewsResult.data) {
          setPerformanceReviews(reviewsResult.data as PerformanceReview[])
        } else {
          toast({
            title: "Error",
            description: reviewsResult.error || "Failed to load performance reviews",
            variant: "destructive"
          })
        }

        // Fetch employees for the form
        const employeesResult = await fetchDepartmentEmployees(userData.department_id)
        if (employeesResult.success && employeesResult.data) {
          setEmployees(employeesResult.data as Employee[])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (userData?.department_id) {
      loadData()
    }
  }, [userData, toast])

  // Handle search
  const filteredReviews = performanceReviews.filter((review) =>
    Object.values(review).some((val) =>
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  // Refresh data function
  const refreshData = async () => {
    if (!userData?.department_id) {
      toast({
        title: "Error",
        description: "Department ID not found",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await fetchPerformanceReviews(userData.department_id)
      if (result.success && result.data) {
        setPerformanceReviews(result.data as PerformanceReview[])
        toast({
          title: "Success",
          description: "Performance reviews refreshed"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to refresh data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "An error occurred while refreshing data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle view review
  const handleViewReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    setViewDialogOpen(true)
  }

  // Handle edit review
  const handleEditReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    form.reset({
      employee_id: review.employee_id,
      rating: review.rating.toString(),
      feedback: review.feedback,
      goals: review.goals,
      status: review.status
    })
    setEditDialogOpen(true)
  }

  // Handle add new review
  const handleAddReview = () => {
    form.reset({
      employee_id: '',
      rating: '3',
      feedback: '',
      goals: '',
      status: 'pending'
    })
    setAddDialogOpen(true)
  }

  // Form submission
  const onSubmit = async (data: ReviewFormValues) => {
    if (!userData?.department_id) {
      toast({
        title: "Error",
        description: "Department ID is required",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Convert rating to number
      const submitData = {
        ...data,
        rating: parseInt(data.rating, 10),
        reviewer_id: userData.admin_id
      }

      let result;
      if (editDialogOpen && selectedReview) {
        // Update existing review
        result = await updateReview(selectedReview.review_id, submitData)
      } else {
        // Add new review
        result = await addReview(submitData)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Review ${editDialogOpen ? 'updated' : 'created'} successfully`
        })
        
        // Refresh data
        refreshData()
        
        // Close dialog
        setAddDialogOpen(false)
        setEditDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${editDialogOpen ? 'update' : 'create'} review`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "An error occurred while processing your request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get status badge
  const getStatusBadge = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" => {
    switch (status) {
      case 'completed':
        return "success"
      case 'in_progress':
        return "default"
      case 'pending':
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>
              Manage and conduct employee performance evaluations
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                className="pl-8 w-[250px]"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleAddReview}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Review
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : performanceReviews.length === 0 ? (
          <div className="text-center py-10">
            <Star className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No reviews found</h3>
            <p className="text-muted-foreground">
              Start by creating a new performance review.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No reviews found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.review_id}>
                      <TableCell className="font-medium">{review.employee_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(review.review_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(review.status)}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReview(review)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
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

      {/* Add/Edit Review Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setAddDialogOpen(false)
          setEditDialogOpen(false)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editDialogOpen ? 'Edit Performance Review' : 'New Performance Review'}</DialogTitle>
            <DialogDescription>
              {editDialogOpen 
                ? 'Update the details of this performance review.' 
                : 'Create a new performance review for an employee.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select 
                      disabled={editDialogOpen || isSubmitting}
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.employee_id} value={employee.employee_id}>
                            {employee.name}
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} {rating === 1 ? 'Star' : 'Stars'}
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
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed feedback about the employee's performance..." 
                        className="min-h-[100px]"
                        disabled={isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals & Objectives</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Set goals and objectives for the upcoming period..." 
                        className="min-h-[100px]"
                        disabled={isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  {editDialogOpen ? "Update Review" : "Create Review"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Review Dialog */}
      {selectedReview && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Performance Review Details</DialogTitle>
              <DialogDescription>
                Review for {selectedReview.employee_name} on {formatDate(selectedReview.review_date)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <h3 className="font-semibold">Employee</h3>
                <p>{selectedReview.employee_name}</p>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Reviewer</h3>
                <p>{selectedReview.reviewer_name}</p>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Rating</h3>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < selectedReview.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Status</h3>
                <Badge variant={getStatusBadge(selectedReview.status)}>
                  {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1).replace('_', ' ')}
                </Badge>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Feedback</h3>
                <div className="rounded-md border p-4 text-sm">
                  {selectedReview.feedback || "No feedback provided"}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Goals & Objectives</h3>
                <div className="rounded-md border p-4 text-sm">
                  {selectedReview.goals || "No goals provided"}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button variant="outline" onClick={() => {
                setViewDialogOpen(false)
                handleEditReview(selectedReview)
              }}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}