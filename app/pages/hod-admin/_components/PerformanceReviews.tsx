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
import { fetchPerformanceReviews, addReview, updateReview } from './_queries'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Form validation schema
const reviewSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee is required" }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  review_date: z.string().min(1, { message: "Date is required" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  rating: z.string().min(1, { message: "Rating is required" }),
  status: z.string().default("pending")
})

type ReviewFormValues = z.infer<typeof reviewSchema>

export default function PerformanceReviews() {
  const { userData } = useContext(UserContext)
  const { toast } = useToast()
  const [performanceReviews, setPerformanceReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [employees, setEmployees] = useState([])
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      employee_id: "",
      subject: "",
      review_date: new Date().toISOString().split('T')[0],
      content: "",
      rating: "3",
      status: "pending"
    }
  })

  // Fetch performance reviews
  useEffect(() => {
    const loadPerformanceReviews = async () => {
      setLoading(true)
      try {
        const result = await fetchPerformanceReviews(userData?.admin_id)
        if (result.success && result.data) {
          setPerformanceReviews(result.data)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load performance reviews",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error loading performance reviews:", error)
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
        const result = await fetchDepartmentEmployees(userData?.admin_id)
        if (result.success && result.data) {
          setEmployees(result.data)
        }
      } catch (error) {
        console.error("Error loading employees:", error)
      }
    }

    if (userData?.admin_id) {
      loadPerformanceReviews()
      loadEmployees()
    }
  }, [userData, toast])

  // Handle search
  const filteredPerformanceReviews = performanceReviews.filter((review) =>
    Object.values(review).some((val) =>
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  )

  // View review details
  const handleViewReview = (review) => {
    setSelectedReview(review)
    setViewDialogOpen(true)
  }

  // Edit review
  const handleEditReview = (review) => {
    setSelectedReview(review)
    form.reset({
      employee_id: review.employee_id,
      subject: review.subject,
      review_date: review.date,
      content: review.content,
      rating: review.rating.toString(),
      status: review.status
    })
    setEditDialogOpen(true)
  }

  // Add new review
  const handleAddReview = () => {
    form.reset({
      employee_id: "",
      subject: "",
      review_date: new Date().toISOString().split('T')[0],
      content: "",
      rating: "3",
      status: "pending"
    })
    setAddDialogOpen(true)
  }

  // Submit form
  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true)
    try {
      let result
      
      if (editDialogOpen && selectedReview) {
        result = await updateReview(selectedReview.id, {
          ...data,
          department_id: userData?.department_id,
          reviewed_by: userData?.admin_id
        })
      } else {
        result = await addReview({
          ...data,
          department_id: userData?.department_id,
          reviewed_by: userData?.admin_id
        })
      }

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Review ${editDialogOpen ? "updated" : "created"} successfully`,
        })
        
        // Refresh data
        const refreshResult = await fetchPerformanceReviews(userData?.admin_id)
        if (refreshResult.success && refreshResult.data) {
          setPerformanceReviews(refreshResult.data)
        }
        
        // Close dialogs
        setAddDialogOpen(false)
        setEditDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${editDialogOpen ? "update" : "create"} review`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${editDialogOpen ? "updating" : "creating"} review:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${editDialogOpen ? "updating" : "creating"} the review`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>
              Manage and view performance reviews
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
            <Button variant="outline" size="icon" onClick={() => {
              setLoading(true)
              fetchPerformanceReviews(userData?.admin_id)
                .then(result => {
                  if (result.success && result.data) {
                    setPerformanceReviews(result.data)
                  }
                  setLoading(false)
                })
                .catch(() => setLoading(false))
            }}>
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
              There are no performance reviews available.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformanceReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No reviews found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPerformanceReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.subject}</TableCell>
                      <TableCell>{review.employee}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {review.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.status === 'completed' ? 'default' : 'secondary'}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewReview(review)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
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

      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Performance Review Details</DialogTitle>
            <DialogDescription>
              Viewing review details
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <h3 className="font-semibold">Subject</h3>
                <p>{selectedReview.subject}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <h3 className="font-semibold">Employee</h3>
                  <p>{selectedReview.employee}</p>
                </div>
                <div className="grid gap-2">
                  <h3 className="font-semibold">Review Date</h3>
                  <p>{selectedReview.date}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <h3 className="font-semibold">Rating</h3>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <h3 className="font-semibold">Status</h3>
                  <Badge variant={selectedReview.status === 'completed' ? 'default' : 'secondary'}>
                    {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid gap-2">
                <h3 className="font-semibold">Review Content</h3>
                <div className="rounded-md border p-4 text-sm">
                  {selectedReview.content || "No content provided"}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedReview && (
              <Button onClick={() => {
                setViewDialogOpen(false)
                handleEditReview(selectedReview)
              }}>
                Edit Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Review Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setAddDialogOpen(false)
          setEditDialogOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editDialogOpen ? "Edit Performance Review" : "Create New Performance Review"}
            </DialogTitle>
            <DialogDescription>
              {editDialogOpen 
                ? "Update the performance review details" 
                : "Create a new performance review for an employee"}
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Review subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="review_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
              </div>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter detailed review feedback..." 
                        rows={6}
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
    </Card>
  )
} 