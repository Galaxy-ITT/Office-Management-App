'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Search, FileText, Users, Building2, LogOut, Edit, Save, X, Upload, Forward } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Record = {
  id: string
  name: string
  dateCreated: string
  status: string
  source: string
  description?: string
  senderName: string
  receiverName: string
  senderSignature: string
  receiverSignature: string
  dateSent: string
  dateReceived: string
  organizationRefNumber: string
  file?: File
}

type Employee = {
  id: string
  name: string
  department: string
  position: string
  startDate: string
  email: string
}

type Office = {
  id: string
  name: string
  location: string
  capacity: number
  manager: string
}

export function EnhancedAdministrativeDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('records')
  const [records, setRecords] = useState<Record[]>([
    { id: '001', name: 'Annual Report 2023', dateCreated: '2023-05-15', status: 'Active', source: 'Government Office', description: 'Comprehensive annual report for the year 2023', senderName: 'John Doe', receiverName: 'Jane Smith', senderSignature: 'JD', receiverSignature: 'JS', dateSent: '2023-05-10', dateReceived: '2023-05-15', organizationRefNumber: 'GOV-2023-001' },
    { id: '002', name: 'Q2 Financial Statement', dateCreated: '2023-07-01', status: 'Pending', source: 'Private Office', description: 'Financial statement for the second quarter', senderName: 'Alice Johnson', receiverName: 'Bob Williams', senderSignature: 'AJ', receiverSignature: 'BW', dateSent: '2023-06-30', dateReceived: '2023-07-01', organizationRefNumber: 'FIN-2023-Q2' },
  ])
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'E001', name: 'John Doe', department: 'IT', position: 'Software Engineer', startDate: '2022-03-15', email: 'john.doe@example.com' },
    { id: 'E002', name: 'Jane Smith', department: 'HR', position: 'HR Manager', startDate: '2021-11-01', email: 'jane.smith@example.com' },
  ])
  const [offices, setOffices] = useState<Office[]>([
    { id: 'O001', name: 'Headquarters', location: 'New York', capacity: 500, manager: 'Alice Johnson' },
    { id: 'O002', name: 'West Coast Branch', location: 'San Francisco', capacity: 250, manager: 'Bob Williams' },
  ])
  const [selectedItem, setSelectedItem] = useState<Record | Employee | Office | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<Record | Employee | Office | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const [forwardTo, setForwardTo] = useState('')
  const [forwardCc, setForwardCc] = useState(false)

  const handleItemClick = (item: Record | Employee | Office) => {
    setSelectedItem(item)
    setIsEditing(false)
    setIsAddingNew(false)
    setIsForwarding(false)
  }

  const handleEditClick = () => {
    setEditedItem({ ...selectedItem! })
    setIsEditing(true)
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setSelectedItem(null)
    setIsEditing(true)
    if (activeSection === 'records') {
      setEditedItem({ 
        id: '', 
        name: '', 
        dateCreated: new Date().toISOString().split('T')[0], 
        status: '', 
        source: '', 
        description: '',
        senderName: '',
        receiverName: '',
        senderSignature: '',
        receiverSignature: '',
        dateSent: '',
        dateReceived: '',
        organizationRefNumber: ''
      })
    } else if (activeSection === 'employees') {
      setEditedItem({ id: '', name: '', department: '', position: '', startDate: '', email: '' })
    } else if (activeSection === 'office') {
      setEditedItem({ id: '', name: '', location: '', capacity: 0, manager: '' })
    }
  }

  const handleSave = async () => {
    if (editedItem) {
      let endpoint = '';
      if (activeSection === 'records') {
        endpoint = '/apis/records';
      } else if (activeSection === 'employees') {
        endpoint = '/apis/employees';
      } else if (activeSection === 'office') {
        endpoint = '/apis/offices';
      }
  
      // Convert editedItem to a plain object
      const itemData = Object.fromEntries(
        Object.entries(editedItem).map(([key, value]) => {
          if (value instanceof File) {
            // For simplicity, we're just sending the file name
            // In a real application, you'd handle file uploads differently
            return [key, value.name];
          }
          return [key, value];
        })
      );
  
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save item');
        }
  
        const savedItem = await response.json();
  
        // ... rest of the function remains the same
      } catch (error) {
        console.error('Error saving item:', error);
        toast({
          title: "Error",
          description: "Failed to save item. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false)
    setIsAddingNew(false)
    setEditedItem(null)
  }

  const handleLogout = () => {
    router.push('/')
  }

  const handleForward = () => {
    setIsForwarding(true)
  }

  const handleForwardSubmit = () => {
    // Simulating forwarding functionality
    console.log(`Forwarding to: ${forwardTo}`)
    if (forwardCc) {
      console.log('CC-ing to email')
    }
    // Here you would typically make an API call to handle the forwarding
    setIsForwarding(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h1 className="text-2xl font-bold mb-6">Administrative</h1>
        <nav className="space-y-2">
          <Button
            variant={activeSection === 'records' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('records')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Manage Records
          </Button>
          <Button
            variant={activeSection === 'employees' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('employees')}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Employees
          </Button>
          <Button
            variant={activeSection === 'office' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('office')}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Manage Office
          </Button>
        </nav>
        <div className="absolute bottom-4">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>{activeSection === 'records' ? 'Manage Records' : activeSection === 'employees' ? 'Manage Employees' : 'Manage Office'}</CardTitle>
            <CardDescription>Manage your {activeSection} efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="search" placeholder={`Search ${activeSection}...`} className="pl-10" />
              </div>
              <Button onClick={handleAddNew}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New {activeSection === 'records' ? 'Record' : activeSection === 'employees' ? 'Employee' : 'Office'}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  {activeSection === 'records' && (
                    <>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                    </>
                  )}
                  {activeSection === 'employees' && (
                    <>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Start Date</TableHead>
                    </>
                  )}
                  {activeSection === 'office' && (
                    <>
                      <TableHead>Location</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Manager</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSection === 'records' && records.map((record) => (
                  <TableRow key={record.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleItemClick(record)}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.dateCreated}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.source}</TableCell>
                  </TableRow>
                ))}
                {activeSection === 'employees' && employees.map((employee) => (
                  <TableRow key={employee.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleItemClick(employee)}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.startDate}</TableCell>
                  </TableRow>
                ))}
                {activeSection === 'office' && offices.map((office) => (
                  <TableRow key={office.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleItemClick(office)}>
                    <TableCell>{office.id}</TableCell>
                    <TableCell>{office.name}</TableCell>
                    <TableCell>{office.location}</TableCell>
                    <TableCell>{office.capacity}</TableCell>
                    <TableCell>{office.manager}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Details/Edit Dialog */}
      <Dialog open={selectedItem !== null || isAddingNew} onOpenChange={() => { setSelectedItem(null); setIsAddingNew(false); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? (isAddingNew ? 'Add New' : 'Edit') : 'Details'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing ? (
              activeSection === 'records' ? (
                <EditRecordForm record={editedItem as Record} setEditedItem={setEditedItem} />
              ) : activeSection === 'employees' ? (
                <EditEmployeeForm employee={editedItem as Employee} setEditedItem={setEditedItem} />
              ) : (
                <EditOfficeForm office={editedItem as Office} setEditedItem={setEditedItem} />
              )
            ) : (
              <ItemDetails item={selectedItem} />
            )}
            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save</Button>
                  <Button variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-2" />Cancel</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEditClick}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                  {activeSection === 'records' && (
                    <Button onClick={handleForward}><Forward className="h-4 w-4 mr-2" />Forward</Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward Dialog */}
      <Dialog open={isForwarding} onOpenChange={setIsForwarding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forward Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="forwardTo" className="text-right">Forward to:</Label>
              <Select value={forwardTo} onValueChange={setForwardTo}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DG">DG</SelectItem>
                  <SelectItem value="MD">MD</SelectItem>
                  <SelectItem value="HON">HON</SelectItem>
                  <SelectItem value="COMM">COMM</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {forwardTo === 'other' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="otherRecipient" className="text-right">Specify:</Label>
                <Input id="otherRecipient" className="col-span-3" />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox id="ccEmail" checked={forwardCc} onCheckedChange={setForwardCc} />
              <Label htmlFor="ccEmail">CC to email</Label>
            </div>
            <Button onClick={handleForwardSubmit}>Forward</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ItemDetails({ item }: { item: Record | Employee | Office | null }) {
  if (!item) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const renderValue = (key: string, value: any) => {
    if (key === 'file' && value instanceof File) {
      return <a href={URL.createObjectURL(value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a>
    }
    if (typeof value === 'string' && (key.toLowerCase().includes('date') || key === 'startDate')) {
      return formatDate(value)
    }
    return value?.toString() || 'N/A'
  }

  return (
    <div className="grid gap-4">
      {Object.entries(item).map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 items-center gap-4">
          <Label className="text-right font-bold col-span-1">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
          </Label>
          <span className="col-span-2">{renderValue(key, value)}</span>
        </div>
      ))}
    </div>
  )
}

function EditRecordForm({ record, setEditedItem }: { record: Record, setEditedItem: React.Dispatch<React.SetStateAction<Record | Employee | Office | null>> }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditedItem({ ...record, file: e.target.files[0] })
    }
  }

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={record.name} onChange={(e) => setEditedItem({ ...record, name: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dateCreated" className="text-right">Date Created</Label>
        <Input id="dateCreated" type="date" value={record.dateCreated} onChange={(e) => setEditedItem({ ...record, dateCreated: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">Status</Label>
        <Select value={record.status} onValueChange={(value) => setEditedItem({ ...record, status: value })}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="source" className="text-right">Source</Label>
        <Input id="source" value={record.source} onChange={(e) => setEditedItem({ ...record, source: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">Description</Label>
        <Input id="description" value={record.description} onChange={(e) => setEditedItem({ ...record, description: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="senderName" className="text-right">Sender Name</Label>
        <Input id="senderName" value={record.senderName} onChange={(e) => setEditedItem({ ...record, senderName: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="receiverName" className="text-right">Receiver Name</Label>
        <Input id="receiverName" value={record.receiverName} onChange={(e) => setEditedItem({ ...record, receiverName: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="senderSignature" className="text-right">Sender Signature</Label>
        <Input id="senderSignature" value={record.senderSignature} onChange={(e) => setEditedItem({ ...record, senderSignature: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="receiverSignature" className="text-right">Receiver Signature</Label>
        <Input id="receiverSignature" value={record.receiverSignature} onChange={(e) => setEditedItem({ ...record, receiverSignature: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dateSent" className="text-right">Date Sent</Label>
        <Input id="dateSent" type="date" value={record.dateSent} onChange={(e) => setEditedItem({ ...record, dateSent: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dateReceived" className="text-right">Date Received</Label>
        <Input id="dateReceived" type="date" value={record.dateReceived} onChange={(e) => setEditedItem({ ...record, dateReceived: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="organizationRefNumber" className="text-right">Org. Ref. Number</Label>
        <Input id="organizationRefNumber" value={record.organizationRefNumber} onChange={(e) => setEditedItem({ ...record, organizationRefNumber: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="file" className="text-right">File Upload</Label>
        <Input id="file" type="file" onChange={handleFileChange} className="col-span-3" />
      </div>
    </>
  )
}

function EditEmployeeForm({ employee, setEditedItem }: { employee: Employee, setEditedItem: React.Dispatch<React.SetStateAction<Record | Employee | Office | null>> }) {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={employee.name} onChange={(e) => setEditedItem({ ...employee, name: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="department" className="text-right">Department</Label>
        <Input id="department" value={employee.department} onChange={(e) => setEditedItem({ ...employee, department: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="position" className="text-right">Position</Label>
        <Input id="position" value={employee.position} onChange={(e) => setEditedItem({ ...employee, position: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">Start Date</Label>
        <Input id="startDate" type="date" value={employee.startDate} onChange={(e) => setEditedItem({ ...employee, startDate: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">Email</Label>
        <Input id="email" type="email" value={employee.email} onChange={(e) => setEditedItem({ ...employee, email: e.target.value })} className="col-span-3" />
      </div>
    </>
  )
}

function EditOfficeForm({ office, setEditedItem }: { office: Office, setEditedItem: React.Dispatch<React.SetStateAction<Record | Employee | Office | null>> }) {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={office.name} onChange={(e) => setEditedItem({ ...office, name: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Location</Label>
        <Input id="location" value={office.location} onChange={(e) => setEditedItem({ ...office, location: e.target.value })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="capacity" className="text-right">Capacity</Label>
        <Input id="capacity" type="number" value={office.capacity} onChange={(e) => setEditedItem({ ...office, capacity: parseInt(e.target.value) })} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="manager" className="text-right">Manager</Label>
        <Input id="manager" value={office.manager} onChange={(e) => setEditedItem({ ...office, manager: e.target.value })} className="col-span-3" />
      </div>
    </>
  )
}