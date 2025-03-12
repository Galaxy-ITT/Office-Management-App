"use client"

import { useEffect, useState } from "react"
import { useFileSystem } from "../file-system-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Edit, Trash } from "lucide-react"
import { handleFileOperation } from "../file-system-server"

// Activity type definition
type Activity = {
  id: string
  type: "create_file" | "create_record" | "edit_record" | "delete_record"
  timestamp: string
  fileId: string
  fileName: string
  recordId?: string
  recordName?: string
  user: string
}

export default function RecentActivitiesView() {
  const { files } = useFileSystem()
  const [activities, setActivities] = useState<Activity[]>([])

  // Generate mock activities based on files and records
  useEffect(() => {
    const loadActivities = async () => {
      // Call server component
     

      const mockActivities: Activity[] = []

      // Add file creation activities
      files.forEach((file) => {
        mockActivities.push({
          id: `act-file-${file.id}`,
          type: "create_file",
          timestamp: file.dateCreated,
          fileId: file.id,
          fileName: file.name,
          user: "admin",
        })

        // Add record activities
        file.records.forEach((record) => {
          // Create record activity
          mockActivities.push({
            id: `act-record-${record.id}`,
            type: "create_record",
            timestamp: record.date,
            fileId: file.id,
            fileName: file.name,
            recordId: record.id,
            recordName: record.subject,
            user: "admin",
          })

          // Add some mock edit activities (for 30% of records)
          if (Math.random() > 0.7) {
            const editDate = new Date(record.date)
            editDate.setDate(editDate.getDate() + Math.floor(Math.random() * 5) + 1)

            mockActivities.push({
              id: `act-edit-${record.id}`,
              type: "edit_record",
              timestamp: editDate.toISOString(),
              fileId: file.id,
              fileName: file.name,
              recordId: record.id,
              recordName: record.subject,
              user: "admin",
            })
          }

          // Add some mock delete activities (for 10% of records)
          if (Math.random() > 0.9) {
            const deleteDate = new Date(record.date)
            deleteDate.setDate(deleteDate.getDate() + Math.floor(Math.random() * 10) + 5)

            mockActivities.push({
              id: `act-delete-${record.id}`,
              type: "delete_record",
              timestamp: deleteDate.toISOString(),
              fileId: file.id,
              fileName: file.name,
              recordId: record.id,
              recordName: record.subject,
              user: "admin",
            })
          }
        })
      })

      // Sort by timestamp (newest first)
      mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setActivities(mockActivities)
    }

    loadActivities()
  }, [files])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "create_file":
        return <FileText className="h-4 w-4" />
      case "create_record":
        return <Clock className="h-4 w-4" />
      case "edit_record":
        return <Edit className="h-4 w-4" />
      case "delete_record":
        return <Trash className="h-4 w-4" />
    }
  }

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "create_file":
        return <Badge variant="default">File Created</Badge>
      case "create_record":
        return <Badge variant="secondary">Record Added</Badge>
      case "edit_record":
        return <Badge variant="outline">Record Edited</Badge>
      case "delete_record":
        return <Badge variant="destructive">Record Deleted</Badge>
    }
  }

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case "create_file":
        return `File "${activity.fileName}" was created`
      case "create_record":
        return `Record "${activity.recordName}" was added to file "${activity.fileName}"`
      case "edit_record":
        return `Record "${activity.recordName}" in file "${activity.fileName}" was edited`
      case "delete_record":
        return `Record "${activity.recordName}" was deleted from file "${activity.fileName}"`
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Recent Activities</h1>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{new Date(activity.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      {getActivityBadge(activity.type)}
                    </div>
                  </TableCell>
                  <TableCell>{getActivityDescription(activity)}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

