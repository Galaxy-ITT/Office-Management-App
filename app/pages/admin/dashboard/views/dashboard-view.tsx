"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Clock, FolderOpen } from "lucide-react"
import { useFileSystem } from "../file-system-context"

export default function DashboardView() {
  const { files } = useFileSystem()

  // Calculate statistics
  const totalFiles = files.length
  const totalRecords = files.reduce((acc, file) => acc + file.records.length, 0)
  const openFiles = files.filter((file) => file.type === "Open File").length
  const secretFiles = files.filter((file) => file.type === "Secret File").length

  // Get recent files (last 5)
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">Across all file types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">Across all files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Files</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openFiles}</div>
            <p className="text-xs text-muted-foreground">{((openFiles / totalFiles) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secret Files</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{secretFiles}</div>
            <p className="text-xs text-muted-foreground">{((secretFiles / totalFiles) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-6">Recent Files</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentFiles.map((file) => (
          <Card key={file.id}>
            <CardHeader>
              <CardTitle className="text-lg">{file.name}</CardTitle>
              <CardDescription>File Number: {file.fileNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Type: {file.type}</p>
              <p className="text-sm">Created: {new Date(file.dateCreated).toLocaleDateString()}</p>
              <p className="text-sm">Records: {file.records.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

