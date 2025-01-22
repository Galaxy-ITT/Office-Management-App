import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StaffDetails({ selectedStaff }) {
  const [staffData, setStaffData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    startDate: "",
    bio: "",
  })
  const [showForm, setShowForm] = useState(true)

  useEffect(() => {
    if (selectedStaff) {
      setStaffData({
        name: selectedStaff.name,
        email: `${selectedStaff.name.toLowerCase().replace(" ", ".")}@company.com`,
        position: "Position",
        department: "Department",
        startDate: "YYYY-MM-DD",
        bio: "Staff member bio",
      })
    }
  }, [selectedStaff])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setStaffData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Updated staff data:", staffData)
    alert("Staff details updated successfully!")
    setShowForm(false)
  }

  if (!selectedStaff) {
    return <div>Please select a staff member</div>
  }

  return (
    {showForm ? (
      <Card>
        <CardHeader>
          <CardTitle>Staff Details</CardTitle>
          <CardDescription>View and edit staff information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={staffData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={staffData.email} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input id="position" name="position" value={staffData.position} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={staffData.department} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={staffData.startDate}
                onChange={handleInputChange}
              />
  </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value=
  staffData.bio
  onChange={handleInputChange} />
  </div>
          </CardContent>
          <CardFooter>
            <Button
  type = "submit" > Save
  Changes
  </Button>
  </CardFooter>
        </form>
      </Card>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Staff Details Saved</CardTitle>
          <CardDescription>Staff information has been updated successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick=
  ;() => setShowForm(true)
  >Edit Again</Button>
        </CardContent>
      </Card>
    )
}
)
}

