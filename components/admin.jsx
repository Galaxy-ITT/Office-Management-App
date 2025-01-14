'use client';

import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Users, 
  Building, 
  MoreHorizontal,
  Search,
  PlusCircle,
  X,
  ArrowBigRight
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdministrativePage() {
  const [activeSection, setActiveSection] = useState('records')
  const [showForm, setShowForm] = useState(false)
  const [records, setRecords] = useState([
    { id: '001', name: 'Annual Report 2023', dateCreated: '2023-05-15', status: 'Active', source: 'Government Office' },
    { id: '002', name: 'Q2 Financial Statement', dateCreated: '2023-07-01', status: 'Pending', source: 'Private Office' },
  ])
  const [showSuccess, setShowSuccess] = useState(false)
  const navigationItems = [
    { id: 'records', label: 'Manage Records', icon: <FileText className="h-5 w-5" /> },
    { id: 'employees', label: 'Manage Employees', icon: <Users className="h-5 w-5" /> },
    { id: 'office', label: 'Manage Office', icon: <Building className="h-5 w-5" /> },
  ]

  const addNewRecord = (record) => {
    const newRecord = {
      id: (records.length + 1).toString().padStart(3, '0'),
      ...record,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'Active'
    }
    setRecords([...records, newRecord])
    setShowForm(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Administrative</h1>
        </div>
        <nav className="p-4">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => {
                setActiveSection(item.id)
                setShowForm(false)
              }}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{navigationItems.find(item => item.id === activeSection)?.label}</CardTitle>
            <CardDescription>Manage your {activeSection} efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccess && (
              <Alert className="mb-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  The record has been added successfully.
                </AlertDescription>
              </Alert>
            )}
            {showForm ? (
              activeSection === 'records' ? <NewRecordForm onClose={() => setShowForm(false)} onSubmit={addNewRecord} /> :
              activeSection === 'employees' ? <NewEmployeeForm onClose={() => setShowForm(false)} /> :
              activeSection === 'office' ? <NewOfficeForm onClose={() => setShowForm(false)} /> :
              null
            ) : (
              <>
                {activeSection === 'records' && <RecordsTable records={records} onAddNew={() => setShowForm(true)} />}
                {activeSection === 'employees' && <EmployeesTable onAddNew={() => setShowForm(true)} />}
                {activeSection === 'office' && <OfficeTable onAddNew={() => setShowForm(true)} />}
                {activeSection === 'other' && <OtherOptions />}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function RecordsTable({ records, onAddNew }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="search" placeholder="Search records..." className="pl-10" />
        </div>
        <Button onClick={onAddNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Record
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.id}</TableCell>
              <TableCell>{record.name}</TableCell>
              <TableCell>{record.dateCreated}</TableCell>
              <TableCell>{record.status}</TableCell>
              <TableCell>{record.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EmployeesTable({ onAddNew }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="search" placeholder="Search employees..." className="pl-10" />
        </div>
        <Button onClick={onAddNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Employee
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Start Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>E001</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>IT</TableCell>
            <TableCell>Software Engineer</TableCell>
            <TableCell>2022-03-15</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>E002</TableCell>
            <TableCell>Jane Smith</TableCell>
            <TableCell>HR</TableCell>
            <TableCell>HR Manager</TableCell>
            <TableCell>2021-11-01</TableCell>
          </TableRow>
          {/* Add more rows as needed */}
        </TableBody>
      </Table>
    </div>
  )
}

function OfficeTable({ onAddNew }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="search" placeholder="Search offices..." className="pl-10" />
        </div>
        <Button onClick={onAddNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Office
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>O001</TableCell>
            <TableCell>New York</TableCell>
            <TableCell>100</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>O002</TableCell>
            <TableCell>San Francisco</TableCell>
            <TableCell>75</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          {/* Add more rows as needed */}
        </TableBody>
      </Table>
    </div>
  )
}

function OtherOptions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Generate and view reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Go to Reports</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage system settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Go to Settings</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Manage third-party integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Go to Integrations</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function NewRecordForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    date: '',
    senderName: '',
    organizationName: '',
    file: null
  })

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prevData => ({ ...prevData, [id]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add New Record</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Record Name</Label>
        <Input id="name" value={formData.name} onChange={handleChange} placeholder="Enter record name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Select value={formData.source} onValueChange={(value) => setFormData(prevData => ({ ...prevData, source: value }))}>
          <SelectTrigger id="source">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Government Office">Government Office</SelectItem>
            <SelectItem value="Private Office">Private Office</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senderName">Sender Name</Label>
        <Input id="senderName" value={formData.senderName} onChange={handleChange} placeholder="Enter sender name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name</Label>
        <Input id="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="Enter organization name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <Input id="file" type="file" onChange={(e) => setFormData(prevData => ({ ...prevData, file: e.target.files[0] }))} />
      </div>
      <Button type="submit" className="w-full">Submit</Button>
    </form>
  )
}

function NewEmployeeForm({ onClose }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add New Employee</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="employeeName">Employee Name</Label>
        <Input id="employeeName" placeholder="Enter employee name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" placeholder="Enter department" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" placeholder="Enter position" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" type="date" />
      </div>
      <Button className="w-full">Submit</Button>
    </div>
  )
}

function NewOfficeForm({ onClose }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add New Office</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" placeholder="Enter office location" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input id="capacity" type="number" placeholder="Enter office capacity" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="underMaintenance">Under Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full">Submit</Button>
    </div>
  )
}