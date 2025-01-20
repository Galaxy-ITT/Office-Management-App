import dynamic from "next/dynamic"
import EmployeeHeader from "@/components/employee-header"

const EmployeeDetails = dynamic(() => import("@/components/employee-details"))
const LeaveManagement = dynamic(() => import("@/components/leave-management"))
const EmployeePerformance = dynamic(() => import("@/components/employee-performance"))
const ProfessionalDevelopment = dynamic(() => import("@/components/professional-development"))

export default function EmployeeProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeHeader />
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <EmployeeDetails />
            <EmployeePerformance />
            <ProfessionalDevelopment />
          </div>
          <div className="space-y-8">
            <LeaveManagement />
          </div>
        </div>
      </main>
    </div>
  )
}

