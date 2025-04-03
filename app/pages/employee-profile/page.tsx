"use client"

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/userContext/userContext";
import EmployeeSidebar from "./Sidebar";
import { fetchEmployeePerformance, fetchEmployeeLeaves, fetchEmployeeDetails, fetchEmployeeSkills, fetchEmployeeCourses, fetchEmployeeTasks, fetchForwardedRecords } from "./_queries";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic"
import EmployeeHeader from "@/components/employee-header"
import { EmployeeAttendance } from "@/app/pages/employee-profile/_components/EmployeeAttendance"
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmployeeLeaves } from "@/app/pages/employee-profile/_components/Employee-leaves"
import EmployeePerformance from "@/app/pages/employee-profile/_components/employee-performance"
import EmployeeTasks from "@/app/pages/employee-profile/_components/employee-tasks"
import ForwardedRecords from "./ForwardedRecords";

// Dynamic imports for better performance
const EmployeeDetails = dynamic(() => import("@/app/pages/employee-profile/_components/employee-details"))
const ProfessionalDevelopment = dynamic(() => import("@/app/pages/employee-profile/_components/professional-development"))

// Define the type for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Define the type for performance data
type PerformanceData = {
  review_id: string;
  rating: number;
  review_date: string;
  review_period: string;
  status: string;
  reviewer_id: number;
  reviewer_comments: string;
  reviewer_name: string;
};

// Define the type for leaves data
type LeaveData = {
  leave_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  application_date: string;
};

// Define type for employee details
type EmployeeDetailsData = {
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department_id: number;
  department_name: string;
  hire_date: string;
  status: string;
};

// Define type for skills data
type SkillData = {
  skill_id: number;
  skill_name: string;
  proficiency_level: string;
  years_experience: number;
};

// Define type for course data
type CourseData = {
  course_id: number;
  course_name: string;
  provider: string;
  certification_obtained: boolean;
  start_date: string;
  completion_date: string;
  status: string;
  notes: string;
};

// Attendance data type
type AttendanceData = {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
};

// Define type for task data
type TaskData = {
  task_id: string;
  title: string;
  description: string;
  employee_id: string;
  assigned_by: number;
  due_date: string;
  priority: string;
  status: string;
  completion_date: string | null;
  completion_note: string | null;
  created_at: string;
  updated_at: string;
};

// Define type for forwarded record data
type ForwardedRecordData = {
  forward_id: string;
  record_id: string;
  file_id: string;
  forwarded_by: number;
  forwarded_to: string;
  notes: string;
  forward_date: string;
  status: string;
  forwarder_name: string;
  uniqueNumber: string;
  type: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  reference: string;
  trackingNumber: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  fileNumber: string;
  fileName: string;
  fileType: string;
};

export default function EmployeeProfilePage() {
  const { userData } = useContext(UserContext);
  const { toast } = useToast();
  const router = useRouter();
  const [activePage, setActivePage] = useState('Dashboard');
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [leaves, setLeaves] = useState<LeaveData[]>([]);
  const [details, setDetails] = useState<EmployeeDetailsData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    total: 230,
    daily: 7.5,
    weekly: 37.5,
    monthly: 21,
  });
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [forwardedRecords, setForwardedRecords] = useState<ForwardedRecordData[]>([]);

  // Authentication check
  useEffect(() => {
    if (!userData || !userData.employee_id) {
      router.push("/pages/admins-login");
    }
  }, [userData, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!userData?.employee_id) {
        // Don't show error toast here since we're redirecting anyway
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Fetch employee details first
        const detailsResult = await fetchEmployeeDetails(userData.employee_id);
        if (detailsResult.success && detailsResult.data) {
          console.log("Server: Employee details retrieved:", detailsResult.data);
          setDetails(detailsResult.data as EmployeeDetailsData);
        }
        
        // Fetch performance data
        const performanceResult = await fetchEmployeePerformance(userData.employee_id);
        if (performanceResult.success && Array.isArray(performanceResult.data)) {
          setPerformance(performanceResult.data as PerformanceData[]);
        }
        
        // Fetch leave data
        const leavesResult = await fetchEmployeeLeaves(userData.employee_id);
        if (leavesResult.success && Array.isArray(leavesResult.data)) {
          setLeaves(leavesResult.data as LeaveData[]);
        }
        
        // Fetch skills data
        const skillsResult = await fetchEmployeeSkills(userData.employee_id);
        if (skillsResult.success && Array.isArray(skillsResult.data)) {
          setSkills(skillsResult.data as SkillData[]);
        }
        
        // Fetch courses data
        const coursesResult = await fetchEmployeeCourses(userData.employee_id);
        if (coursesResult.success && Array.isArray(coursesResult.data)) {
          setCourses(coursesResult.data as CourseData[]);
        }
        
        // Fetch tasks data
        const tasksResult = await fetchEmployeeTasks(userData.employee_id);
        if (tasksResult.success && Array.isArray(tasksResult.data)) {
          setTasks(tasksResult.data as TaskData[]);
        }
        
        // Fetch forwarded records data
        const forwardedRecordsResult = await fetchForwardedRecords(userData.employee_id);
        if (forwardedRecordsResult.success && Array.isArray(forwardedRecordsResult.data)) {
          setForwardedRecords(forwardedRecordsResult.data as ForwardedRecordData[]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "An error occurred while loading data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Only load data if userData exists
    if (userData?.employee_id) {
      loadData();
    }
  }, [userData, toast]);

  // Render dashboard component 
  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
      <div className="space-y-8">
        {details && <EmployeeDetails employeeDetails={details} />}
        {performance.length > 0 && <EmployeePerformance performanceData={performance} />}
        {leaves.length > 0 && <EmployeeLeaves leaveData={leaves} compact={true} hideApplyButton={true} />}
        {tasks.length > 0 && <EmployeeTasks taskData={tasks} />}
        <EmployeeAttendance 
          employeeName={userData?.name || "Overview"} 
          attendanceData={attendanceData} 
        />
        <ProfessionalDevelopment skills={skills} courses={courses} hideAddButtons={true} />
      </div>
    </div>
  );

  // Render performance component
  const renderPerformance = () => (
    <div className="space-y-8">
      <EmployeePerformance performanceData={performance} />
    </div>
  );

  // Render leave applications component
  const renderLeaveApplications = () => (
    <div className="space-y-8">
      <EmployeeLeaves leaveData={leaves} />
    </div>
  );

  // Render personal details component
  const renderPersonalDetails = () => (
    <div className="space-y-8">
      {details && <EmployeeDetails employeeDetails={details} />}
    </div>
  );

  // Add new render function for tasks
  const renderTasks = () => (
    <div className="space-y-8">
      <EmployeeTasks taskData={tasks} />
    </div>
  );

  // Render forwarded records component
  const renderForwardedRecords = () => (
    <div className="space-y-8">
      <ForwardedRecords />
    </div>
  );

  return (
    <div className="flex h-screen">
      <EmployeeSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{activePage}</h1>
            <p className="text-muted-foreground">
              Welcome, {userData?.name || 'Employee'}
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {activePage === 'Dashboard' ? renderDashboard() :
               activePage === 'Performance' ? renderPerformance() :
               activePage === 'Leave Applications' ? renderLeaveApplications() :
               activePage === 'Personal Details' ? renderPersonalDetails() :
               activePage === 'Tasks' ? renderTasks() :
               activePage === 'Forwarded Records' ? renderForwardedRecords() : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

