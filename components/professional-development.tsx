import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfessionalDevelopment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Development</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Certifications</h3>
          <ul className="space-y-2">
            <li>
              <p className="font-medium">AWS Certified Developer - Associate</p>
              <p className="text-sm text-gray-600">Obtained: May 15, 2022 | Expires: May 15, 2025</p>
            </li>
            <li>
              <p className="font-medium">Certified Scrum Master</p>
              <p className="text-sm text-gray-600">Obtained: October 1, 2021 | Expires: October 1, 2023</p>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recent Training</h3>
          <ul className="space-y-2">
            <li>
              <p className="font-medium">Advanced React Patterns</p>
              <p className="text-sm text-gray-600">Completed: February 28, 2023 | Provider: Frontend Masters</p>
            </li>
            <li>
              <p className="font-medium">Microservices Architecture</p>
              <p className="text-sm text-gray-600">Completed: November 15, 2022 | Provider: Udacity</p>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Conference Participation</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium">React Conf 2023</p>
                <p className="text-sm text-gray-600">May 10, 2023</p>
              </div>
              <Badge variant="secondary">Attendee</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium">AWS re:Invent 2022</p>
                <p className="text-sm text-gray-600">November 28, 2022</p>
              </div>
              <Badge variant="secondary">Speaker</Badge>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

