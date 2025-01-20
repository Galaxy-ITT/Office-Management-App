import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function EmployeeDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong className="font-semibold">Email:</strong> john.doe@company.com
          </div>
          <div>
            <strong className="font-semibold">Phone:</strong> +1 (555) 123-4567
          </div>
          <div>
            <strong className="font-semibold">Location:</strong> New York, NY
          </div>
          <div>
            <strong className="font-semibold">Date of Employment:</strong> March 15, 2022
          </div>
          <div>
            <strong className="font-semibold">Reports To:</strong> Jane Smith (Engineering Manager)
          </div>
          <div>
            <strong className="font-semibold">Team Size:</strong> 5 members
          </div>
        </div>
        <div>
          <strong className="font-semibold">Current Projects:</strong>
          <ul className="list-disc list-inside mt-2">
            <li>Project Alpha - Tech Lead</li>
            <li>Project Beta - Senior Developer</li>
          </ul>
        </div>
        <div>
          <strong className="font-semibold">Skills:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {["JavaScript", "React", "Node.js", "AWS", "Python", "Docker"].map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

