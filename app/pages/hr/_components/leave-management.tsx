"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LeaveApplicationForm from "../../../../components/leave-application-form"

export default function LeaveManagement() {
  const [showLeaveForm, setShowLeaveForm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Leave Balance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Annual Leave</span>
              <p className="text-lg font-semibold">15 days</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Sick Leave</span>
              <p className="text-lg font-semibold">10 days</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Personal Leave</span>
              <p className="text-lg font-semibold">3 days</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recent Leave Requests</h3>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <span>Annual Leave: 2023-07-01 to 2023-07-07</span>
              <Badge variant="success">Approved</Badge>
            </li>
            <li className="flex justify-between items-center">
              <span>Sick Leave: 2023-05-15 to 2023-05-16</span>
              <Badge variant="success">Approved</Badge>
            </li>
            <li className="flex justify-between items-center">
              <span>Personal Leave: 2023-08-10 to 2023-08-11</span>
              <Badge>Pending</Badge>
            </li>
          </ul>
        </div>
        {!showLeaveForm ? (
          <Button onClick={() => setShowLeaveForm(true)} className="w-full">
            Apply for Leave
          </Button>
        ) : (
          <LeaveApplicationForm onCancel={() => setShowLeaveForm(false)} />
        )}
      </CardContent>
    </Card>
  )
}

