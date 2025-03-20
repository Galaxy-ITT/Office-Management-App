"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, FileIcon, Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  addEmployeeSkill, 
  addProfessionalDevelopment, 
  addEmployeeDocument,
  fetchEmployeeSkills,
  fetchEmployeeCourses,
  fetchEmployeeDocuments
} from "../_queries";

// API response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface Skill {
  skill_id: number;
  skill_name: string;
  proficiency_level: string;
  years_experience: number;
}

interface Course {
  course_id: number;
  course_name: string;
  provider: string;
  certification_obtained: boolean;
  start_date: string;
  completion_date: string;
  status: string;
  notes: string;
}

interface Document {
  document_id: number;
  document_name: string;
  document_type: string;
  file_url: string;
  upload_date: string;
  description: string;
}

interface EmployeeDetails {
  employee_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department_id?: number;
  department_name?: string;
  hire_date?: string;
  status?: string;
}

interface EmployeeDetailsProps {
  employeeDetails: EmployeeDetails;
}

export default function EmployeeDetails({ employeeDetails }: EmployeeDetailsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  
  // Check if we have employee details
  if (!employeeDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No employee details available.</p>
        </CardContent>
      </Card>
    );
  }

  const {
    employee_id,
    name,
    email,
    phone,
    position,
    department_name,
    hire_date,
    status
  } = employeeDetails;

  // Load skills, courses, and documents when tab changes
  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (!employee_id) return;
    
    if (value === "skills" && skills.length === 0) {
      try {
        const result = await fetchEmployeeSkills(employee_id);
        if (result.success && Array.isArray(result.data)) {
          setSkills(result.data as Skill[]);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    } 
    else if (value === "courses" && courses.length === 0) {
      try {
        const result = await fetchEmployeeCourses(employee_id);
        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data as Course[]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
    else if (value === "documents" && documents.length === 0) {
      try {
        const result = await fetchEmployeeDocuments(employee_id);
        if (result.success && Array.isArray(result.data)) {
          setDocuments(result.data as Document[]);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    }
  };

  // Schema for adding a skill
  const skillSchema = z.object({
    skill_name: z.string().min(1, "Skill name is required"),
    proficiency_level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
    years_experience: z.coerce.number().min(0),
  });

  // Schema for adding a course
  const courseSchema = z.object({
    course_name: z.string().min(1, "Course name is required"),
    provider: z.string().optional(),
    certification_obtained: z.boolean().default(false),
    start_date: z.date().optional(),
    completion_date: z.date().optional(),
    status: z.enum(["In Progress", "Completed", "Planned"]),
    notes: z.string().optional(),
  });

  // Schema for adding a document
  const documentSchema = z.object({
    document_name: z.string().min(1, "Document name is required"),
    document_type: z.string().min(1, "Document type is required"),
    file_url: z.string().min(1, "File URL is required"),
    description: z.string().optional(),
  });

  // Forms
  const skillForm = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill_name: "",
      proficiency_level: "Beginner",
      years_experience: 0,
    },
  });

  const courseForm = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_name: "",
      provider: "",
      certification_obtained: false,
      status: "In Progress",
      notes: "",
    },
  });

  const documentForm = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      document_name: "",
      document_type: "",
      file_url: "",
      description: "",
    },
  });

  // Handle form submissions
  const onSkillSubmit = async (values: z.infer<typeof skillSchema>) => {
    if (!employee_id) return;
    
    try {
      const result = await addEmployeeSkill(employee_id, values);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Skill added successfully",
        });
        
        // Refresh skills
        const skillsResult = await fetchEmployeeSkills(employee_id);
        if (skillsResult.success && Array.isArray(skillsResult.data)) {
          setSkills(skillsResult.data as Skill[]);
        }
        
        setIsSkillDialogOpen(false);
        skillForm.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add skill",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const onCourseSubmit = async (values: z.infer<typeof courseSchema>) => {
    if (!employee_id) return;
    
    const courseData = {
      ...values,
      start_date: values.start_date ? format(values.start_date, "yyyy-MM-dd") : undefined,
      completion_date: values.completion_date ? format(values.completion_date, "yyyy-MM-dd") : undefined,
    };
    
    try {
      const result = await addProfessionalDevelopment(employee_id, courseData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Course added successfully",
        });
        
        // Refresh courses
        const coursesResult = await fetchEmployeeCourses(employee_id);
        if (coursesResult.success && Array.isArray(coursesResult.data)) {
          setCourses(coursesResult.data as Course[]);
        }
        
        setIsCourseDialogOpen(false);
        courseForm.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const onDocumentSubmit = async (values: z.infer<typeof documentSchema>) => {
    if (!employee_id) return;
    
    try {
      const result = await addEmployeeDocument(employee_id, values);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Document added successfully",
        });
        
        // Refresh documents
        const documentsResult = await fetchEmployeeDocuments(employee_id);
        if (documentsResult.success && Array.isArray(documentsResult.data)) {
          setDocuments(documentsResult.data as Document[]);
        }
        
        setIsDocumentDialogOpen(false);
        documentForm.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="courses">Professional Development</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="font-semibold">Name:</strong> {name || 'N/A'}
              </div>
              <div>
                <strong className="font-semibold">Position:</strong> {position || 'N/A'}
              </div>
              <div>
                <strong className="font-semibold">Department:</strong> {department_name || 'N/A'}
              </div>
              <div>
                <strong className="font-semibold">Email:</strong> {email || 'N/A'}
              </div>
              <div>
                <strong className="font-semibold">Phone:</strong> {phone || 'N/A'}
              </div>
              <div>
                <strong className="font-semibold">Date of Employment:</strong> {hire_date || 'N/A'}
              </div>
              <div>
                <strong className="font-semibold">Status:</strong> 
                <Badge variant={status === 'active' ? 'success' : 'secondary'}>
                  {status || 'N/A'}
                </Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="skills">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Your Skills</h3>
              <Button size="sm" onClick={() => setIsSkillDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
            
            {skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <Card key={skill.skill_id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{skill.skill_name}</h4>
                        <Badge>{skill.proficiency_level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {skill.years_experience} years experience
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills added yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="courses">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Professional Development</h3>
              <Button size="sm" onClick={() => setIsCourseDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
            
            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.course_id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{course.course_name}</h4>
                        <Badge variant={
                          course.status === 'Completed' ? 'success' : 
                          course.status === 'In Progress' ? 'default' : 'secondary'
                        }>
                          {course.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.provider || "No provider specified"}
                      </p>
                      {course.start_date && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Period:</span>{" "}
                          {new Date(course.start_date).toLocaleDateString()} - 
                          {course.completion_date ? new Date(course.completion_date).toLocaleDateString() : "Present"}
                        </p>
                      )}
                      {course.certification_obtained && (
                        <Badge variant="outline" className="mt-2">Certification Obtained</Badge>
                      )}
                      {course.notes && (
                        <p className="text-sm mt-2">{course.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No courses or certifications have been added yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Documents</h3>
              <Button size="sm" onClick={() => setIsDocumentDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
            
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((document) => (
                  <Card key={document.document_id}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <FileIcon className="h-8 w-8 mr-3 text-primary" />
                        <div>
                          <h4 className="font-medium">{document.document_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {document.document_type}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Added: {new Date(document.upload_date).toLocaleDateString()}
                          </p>
                          {document.description && (
                            <p className="text-sm mt-2">{document.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 pt-0">
                      <a 
                        href={document.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No documents have been added yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Skill Dialog */}
      <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>
          <Form {...skillForm}>
            <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-4">
              <FormField
                control={skillForm.control}
                name="skill_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. JavaScript, Project Management" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={skillForm.control}
                name="proficiency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={skillForm.control}
                name="years_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Skill</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Professional Development</DialogTitle>
          </DialogHeader>
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(onCourseSubmit)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="course_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Advanced JavaScript" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Udemy, Company Training" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={courseForm.control}
                  name="completion_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Completion Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={courseForm.control}
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
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="certification_obtained"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Certification Obtained</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about this course"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Course</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Document Dialog */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-4">
              <FormField
                control={documentForm.control}
                name="document_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Resume, Certificate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={documentForm.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Resume">Resume</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="ID Document">ID Document</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={documentForm.control}
                name="file_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/document.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={documentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this document"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Document</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

