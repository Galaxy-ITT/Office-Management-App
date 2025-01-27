"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

const performanceData = [
  {
    id: 1,
    name: "Alice Johnson",
    score: 92,
    attendance: 98,
    department: "Sales",
    position: "Senior Sales Representative",
    email: "alice.johnson@example.com",
    phone: "+1234567890",
    hodNotes: [
      { type: "positive", note: "Consistently exceeds sales targets" },
      { type: "positive", note: "Great team player" },
      { type: "negative", note: "Could improve on documentation" },
    ],
  },
  {
    id: 2,
    name: "Bob Smith",
    score: 78,
    attendance: 95,
    department: "IT",
    position: "Software Developer",
    email: "bob.smith@example.com",
    phone: "+1234567891",
    hodNotes: [
      { type: "positive", note: "Quick learner of new technologies" },
      { type: "negative", note: "Sometimes misses project deadlines" },
    ],
  },
  {
    id: 3,
    name: "Carol Williams",
    score: 85,
    attendance: 97,
    department: "Marketing",
    position: "Marketing Specialist",
    email: "carol.williams@example.com",
    phone: "+1234567892",
    hodNotes: [
      { type: "positive", note: "Creative and innovative in campaign designs" },
      { type: "positive", note: "Strong analytical skills" },
    ],
  },
]

export default function PerformanceOverview() {
  const [selectedStaff, setSelectedStaff] = useState(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {performanceData.map((staff) => (
            <li key={staff.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">{staff.name}</p>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(staff)}>
                  View Details
                </Button>
              </div>
              <Progress value={staff.score} className="h-2" />
              <p className="text-sm text-muted-foreground">Performance Score: {staff.score}%</p>
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedStaff.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStaff.position} - {selectedStaff.department}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Performance Score:</strong> {selectedStaff.score}%
                </p>
                <p>
                  <strong>Attendance:</strong> {selectedStaff.attendance}%
                </p>
                <p>
                  <strong>Email:</strong> {selectedStaff.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedStaff.phone}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">HOD Notes:</h4>
                <ul className="space-y-2 mt-2">
                  {selectedStaff.hodNotes.map((note, index) => (
                    <li
                      key={index}
                      className={`text-sm ${note.type === "positive" ? "text-green-600" : "text-red-600"}`}
                    >
                      {note.note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStaff(null)}>
              Close
            </Button>
            <Button onClick={() => console.log(`Calling ${selectedStaff.name}`)}>
              <Phone className="h-4 w-4 mr-2" />
              Call Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

