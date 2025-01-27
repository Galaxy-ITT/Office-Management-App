import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const staffMembers = [
  { id: 1, name: "Alice Johnson", role: "Manager", department: "Sales", status: "Active" },
  { id: 2, name: "Bob Smith", role: "Developer", department: "IT", status: "On Leave" },
  { id: 3, name: "Carol Williams", role: "Designer", department: "Marketing", status: "Active" },
]

export default function StaffList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff List</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {staffMembers.map((staff) => (
            <li key={staff.id} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={`/staff-${staff.id}.jpg`} alt={staff.name} />
                <AvatarFallback>
                  {staff.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{staff.name}</p>
                <p className="text-sm text-muted-foreground">
                  {staff.role}, {staff.department}
                </p>
              </div>
              <Badge variant={staff.status === "Active" ? "default" : "secondary"}>{staff.status}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

