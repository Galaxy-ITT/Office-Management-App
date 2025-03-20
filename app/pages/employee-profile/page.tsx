"use client"

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/userContext/userContext";
import EmployeeSidebar from "./Sidebar";
import { fetchEmployeePerformance, fetchEmployeeLeaves, fetchEmployeeDetails, fetchEmployeeSkills, fetchEmployeeCourses } from "./_queries";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic"
import EmployeeHeader from "@/components/employee-header"
import { EmployeeAttendance } from "@/app/pages/employee-profile/_components/EmployeeAttendance"
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamic imports for better performance
const EmployeeDetails = dynamic(() => import("@/app/pages/employee-profile/_components/employee-details"))
const LeaveManagement = dynamic(() => import("@/app/pages/hr/_components/leave-management"))
const EmployeePerformance = dynamic(() => import("@/app/pages/employee-profile/_components/employee-performance"))
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {details && <EmployeeDetails employeeDetails={details} />}
        {performance.length > 0 && <EmployeePerformance performanceData={performance} />}
        <EmployeeAttendance 
          employeeName={userData?.name || "Overview"} 
          attendanceData={attendanceData} 
        />
        <ProfessionalDevelopment />
      </div>
      <div className="space-y-8">
        {leaves.length > 0 && <LeaveManagement leaveData={leaves} />}
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
      <LeaveManagement leaveData={leaves} />
    </div>
  );

  // Render personal details component
  const renderPersonalDetails = () => (
    <div className="space-y-8">
      {details && <EmployeeDetails employeeDetails={details} />}
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
               activePage === 'Personal Details' ? renderPersonalDetails() : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

