import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const employeeData = {
  name: "Ibrahim Abdulkarim",
  employeeId: "EMP001",
  department: "Engineering",
  position: "Software Developer",
  dateOfEmployment: "2022-03-15",
  email: "iabdulkarim@galaxyitt.com.ng",
  phone: "+234(080) 023-4567",
}

export default function EmployeeProfile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg" alt={employeeData.name} />
            <AvatarFallback>
              {employeeData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{employeeData.name}</h2>
            <p className="text-muted-foreground">{employeeData.position}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong className="font-semibold">Employee ID:</strong> {employeeData.employeeId}
          </div>
          <div>
            <strong className="font-semibold">Department:</strong> {employeeData.department}
          </div>
          <div>
            <strong className="font-semibold">Date of Employment:</strong>{" "}
            {new Date(employeeData.dateOfEmployment).toLocaleDateString()}
          </div>
          <div>
            <strong className="font-semibold">Email:</strong> {employeeData.email}
          </div>
          <div>
            <strong className="font-semibold">Phone:</strong> {employeeData.phone}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

