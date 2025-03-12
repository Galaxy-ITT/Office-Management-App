"use client"

import { useState } from "react"
import { useFileSystem, type Record } from "../file-system-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import RecordDetails from "../record-details"
import { handleFileOperation } from "../file-system-server"

export default function SearchRecordsView() {
  const { files, selectRecord, selectedRecord } = useFileSystem()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{ record: Record; fileId: string }[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    // Search through all files and their records
    const results: { record: Record; fileId: string }[] = []

    files.forEach((file) => {
      file.records.forEach((record) => {
        // Search in multiple fields
        if (
          record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.uniqueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.reference.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          results.push({
            record,
            fileId: file.id,
          })
        }
      })
    })

    setSearchResults(results)
  }

  const handleRecordClick = (record: Record, fileId: string) => {
    selectRecord(record)
    setSelectedFileId(fileId)
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Active":
        return "default"
      case "Pending":
        return "secondary"
      case "Archived":
        return "outline"
      case "Urgent":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Search Records</h1>

      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by subject, content, sender, recipient, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unique Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map(({ record, fileId }) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRecordClick(record, fileId)}
                  >
                    <TableCell className="font-medium">{record.uniqueNumber}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.from}</TableCell>
                    <TableCell>{record.to}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(record.status)}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : searchTerm ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No records found matching your search criteria.</p>
          </CardContent>
        </Card>
      ) : null}

      {selectedRecord && selectedFileId && <RecordDetails record={selectedRecord} fileId={selectedFileId} />}
    </div>
  )
}

