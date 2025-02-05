"use client"

import { useState } from "react"
import { Search, Bell, Menu, UserPlus, Users, Calendar, FileText, BarChart } from "lucide-react"

function Sidebar({ activeView, setActiveView }) {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <nav>
        <ul>
          {[
            { name: "Dashboard", icon: BarChart },
            { name: "Staff", icon: Users },
            { name: "Leave Requests", icon: Calendar },
            { name: "Performance", icon: FileText },
          ].map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => setActiveView(item.name.toLowerCase())}
                className={`flex items-center w-full p-2 rounded ${
                  activeView === item.name.toLowerCase() ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
              >
                <item.icon className="mr-2" size={18} />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Menu className="mr-4" />
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <Search />
        <Bell />
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  )
}

function Dashboard() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Staff" value="150" icon={Users} />
        <KPICard title="Leave Requests" value="12" icon={Calendar} />
        <KPICard title="Performance Reviews" value="45" icon={FileText} />
        <KPICard title="Departments" value="8" icon={BarChart} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <ul>
          {[
            "John Doe submitted a leave request",
            "Performance review for Jane Smith completed",
            "New employee onboarding: Mike Johnson",
            "Department budget update: Marketing",
          ].map((activity, index) => (
            <li key={index} className="mb-2 pb-2 border-b last:border-b-0">
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Icon className="text-blue-500" size={24} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function StaffList({ staffMembers, onSelectStaff, onAddNewStaff }) {
  const [newStaffName, setNewStaffName] = useState("")
  const [newStaffPosition, setNewStaffPosition] = useState("")

  const handleAddNewStaff = () => {
    if (newStaffName && newStaffPosition) {
      onAddNewStaff({ name: newStaffName, position: newStaffPosition })
      setNewStaffName("")
      setNewStaffPosition("")
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Staff List</h2>
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Name"
          value={newStaffName}
          onChange={(e) => setNewStaffName(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Position"
          value={newStaffPosition}
          onChange={(e) => setNewStaffPosition(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button onClick={handleAddNewStaff} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          <UserPlus className="mr-2" size={18} />
          Add New Staff
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectStaff(staff)}
          >
            <h3 className="font-semibold">{staff.name}</h3>
            <p className="text-gray-600">{staff.position}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StaffDetails({ staff, onClose }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Staff Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">{staff.name}</h3>
        <p className="mb-2">
          <strong>Position:</strong> {staff.position}
        </p>
        <p className="mb-2">
          <strong>Email:</strong> {staff.name.toLowerCase().replace(" ", ".")}@company.com
        </p>
        <p className="mb-2">
          <strong>Department:</strong> {staff.department}
        </p>
        <p className="mb-4">
          <strong>Start Date:</strong> January 1, 2023
        </p>
        <h4 className="text-lg font-semibold mb-2">Performance Overview</h4>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </p>
      </div>
    </div>
  )
}

function LeaveRequests({ leaveRequests, onUpdateLeaveRequest }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [note, setNote] = useState("")

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setNote(request.note || "")
  }

  const handleUpdateStatus = (status) => {
    onUpdateLeaveRequest({
      ...selectedRequest,
      status,
      note,
    })
    setSelectedRequest(null)
    setNote("")
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Leave Requests</h2>
      <div className="bg-white rounded-lg shadow-md">
        {leaveRequests.map((request) => (
          <div key={request.id} className="p-4 border-b last:border-b-0">
            <p>
              <strong>Employee:</strong> {request.employeeName}
            </p>
            <p>
              <strong>Department:</strong> {request.department}
            </p>
            <p>
              <strong>Type:</strong> {request.leaveType}
            </p>
            <p>
              <strong>Dates:</strong> {request.startDate} to {request.endDate}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  request.status === "Approved"
                    ? "text-green-500"
                    : request.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                {request.status}
              </span>
            </p>
            <button
              onClick={() => handleViewDetails(request)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {selectedRequest.employeeName}'s Leave Request
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">Department: {selectedRequest.department}</p>
                <p className="text-sm text-gray-500">Type: {selectedRequest.leaveType}</p>
                <p className="text-sm text-gray-500">
                  Dates: {selectedRequest.startDate} to {selectedRequest.endDate}
                </p>
                <textarea
                  className="mt-2 p-2 w-full border rounded"
                  rows="3"
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 mb-2"
                  onClick={() => handleUpdateStatus("Approved")}
                >
                  Approve
                </button>
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 mb-2"
                  onClick={() => handleUpdateStatus("Rejected")}
                >
                  Reject
                </button>
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PerformanceReview({ staff }) {
  const [ratings, setRatings] = useState({
    jobKnowledge: 0,
    workQuality: 0,
    attendance: 0,
    communication: 0,
    teamwork: 0,
  })
  const [comment, setComment] = useState("")

  const handleRatingChange = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ staff, ratings, comment })
    alert("Performance review submitted successfully!")
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Performance Review: {staff.name}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {Object.entries(ratings).map(([category, rating]) => (
          <div key={category} className="mb-4">
            <label className="block mb-2 capitalize">{category.replace(/([A-Z])/g, " $1").trim()} (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => handleRatingChange(category, Number.parseInt(e.target.value))}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
        ))}
        <div className="mb-4">
          <label className="block mb-2">Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded px-2 py-1"
            rows="4"
            required
          ></textarea>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit Review
        </button>
      </form>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [staffMembers, setStaffMembers] = useState([
    { id: 1, name: "John Doe", position: "Software Developer", department: "Engineering" },
    { id: 2, name: "Jane Smith", position: "Project Manager", department: "Project Management" },
    { id: 3, name: "Mike Johnson", position: "Designer", department: "Design" },
  ])
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employeeName: "John Doe",
      department: "Engineering",
      leaveType: "Vacation",
      startDate: "2023-07-01",
      endDate: "2023-07-05",
      status: "Pending",
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      department: "Project Management",
      leaveType: "Sick",
      startDate: "2023-07-10",
      endDate: "2023-07-12",
      status: "Pending",
    },
  ])

  const handleAddNewStaff = (newStaff) => {
    setStaffMembers([...staffMembers, { id: staffMembers.length + 1, ...newStaff, department: "Unassigned" }])
  }

  const handleUpdateLeaveRequest = (updatedRequest) => {
    setLeaveRequests(leaveRequests.map((request) => (request.id === updatedRequest.id ? updatedRequest : request)))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "staff" && !selectedStaff && (
            <StaffList staffMembers={staffMembers} onSelectStaff={setSelectedStaff} onAddNewStaff={handleAddNewStaff} />
          )}
          {activeView === "staff" && selectedStaff && (
            <StaffDetails staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
          )}
          {activeView === "leave requests" && (
            <LeaveRequests leaveRequests={leaveRequests} onUpdateLeaveRequest={handleUpdateLeaveRequest} />
          )}
          {activeView === "performance" && selectedStaff && <PerformanceReview staff={selectedStaff} />}
          {activeView === "performance" && !selectedStaff && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Performance Reviews</h2>
              <p>Please select a staff member from the Staff List to conduct a performance review.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

