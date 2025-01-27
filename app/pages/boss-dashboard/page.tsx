import { SearchBar } from "./components/SearchBar"
import BossHeader from "./components/BossHeader"
import StaffList from "./components/StaffList"
import LeaveRequests from "./components/LeaveRequests"
import FileRecords from "./components/FileRecords"
import PerformanceOverview from "./components/PerformanceOverview"

export default function BossDashboard() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <BossHeader />
      <SearchBar />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StaffList />
        <LeaveRequests />
        <FileRecords />
        <PerformanceOverview />
      </div>
    </div>
  )
}

