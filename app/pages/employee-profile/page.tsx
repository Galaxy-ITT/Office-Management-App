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

// Dynamic imports for better performance
const EmployeeDetails = dynamic(() => import("@/app/pages/employee-profile/_components/employee-details"))
const LeaveManagement = dynamic(() => import("@/app/pages/hr/_components/leave-management"))
const EmployeePerformance = dynamic(() => import("@/app/pages/employee-profile/_components/employee-performance"))
const ProfessionalDevelopment = dynamic(() => import("@/app/pages/employee-profile/_components/professional-development"))

// Define the type for performance data
type PerformanceData = {
  metric: string;
  value: number;
};

// Define the type for leaves data
type LeaveData = {
  leaveType: string;
  startDate: string;
  endDate: string;
};

// Define type for employee details
type EmployeeDetailsData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  dateOfEmployment: string;
  reportsTo: string;
  teamSize: number;
  projects: Array<{name: string, role: string}>;
  skills: string[];
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
  const [skills, setSkills] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!userData?.employee_id) {
        toast({
          title: "Error",
          description: "Employee ID not found",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      try {
        const [performanceResult, leavesResult, detailsResult, skillsResult, coursesResult] = await Promise.all([
          fetchEmployeePerformance(userData.employee_id),
          fetchEmployeeLeaves(userData.employee_id),
          fetchEmployeeDetails(userData.employee_id),
          fetchEmployeeSkills(userData.employee_id),
          fetchEmployeeCourses(userData.employee_id)
        ]);

        if (performanceResult.success) {
          setPerformance(performanceResult.data);
        }

        if (leavesResult.success) {
          setLeaves(leavesResult.data);
        }

        if (detailsResult.success) {
          setDetails(detailsResult.data);
        }

        if (skillsResult.success) {
          setSkills(skillsResult.data);
        }

        if (coursesResult.success) {
          setCourses(coursesResult.data);
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

    loadData();
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

