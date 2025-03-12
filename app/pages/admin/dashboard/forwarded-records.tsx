"use client"

import { useState, useEffect } from "react"
import { useFileSystem } from "./file-system-context"
import { fetchForwardedRecords, type ForwardedRecord } from "./file-system-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, FileText, User, Send, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ForwardedRecords() {
  const { adminData } = useFileSystem()
  const [forwardedRecords, setForwardedRecords] = useState<(ForwardedRecord & {
    subject: string;
    trackingNumber: string;
    date: string;
    from: string;
    to: string;
    fileName: string;
  })[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [selectedRecord, setSelectedRecord] = useState<(ForwardedRecord & {
    subject: string;
    trackingNumber: string;
    date: string;
    from: string;
    to: string;
    fileName: string;
  }) | null>(null)

  useEffect(() => {
    async function loadForwardedRecords() {
      if (!adminData?.admin_id) return
      
      try {
        const result = await fetchForwardedRecords(adminData.admin_id)
        
        if (result.success && result.data) {
          setForwardedRecords(result.data as any)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load forwarded records",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error loading forwarded records:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadForwardedRecords()
  }, [adminData, toast])

  return (
    <div className="space-y-4">
      {selectedRecord ? (
        <ForwardedRecordDetails 
          record={selectedRecord} 
          onBack={() => setSelectedRecord(null)} 
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Forwarded Records</CardTitle>
            <CardDescription>
              View all records you have forwarded to others
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : forwardedRecords.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-muted/10">
                <Send className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                <h3 className="mt-4 text-lg font-medium">No forwarded records</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't forwarded any records yet.
                </p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Forwarded To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forwardedRecords.map((record) => (
                      <TableRow
                        key={record.forward_id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <TableCell className="font-medium">{record.trackingNumber}</TableCell>
                        <TableCell>{record.fileName}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.forwarded_to}</TableCell>
                        <TableCell>{new Date(record.forward_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getForwardStatusVariant(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ForwardedRecordDetailsProps {
  record: ForwardedRecord & {
    subject: string;
    trackingNumber: string;
    date: string;
    from: string;
    to: string;
    fileName: string;
  }
  onBack: () => void
}

function ForwardedRecordDetails({ record, onBack }: ForwardedRecordDetailsProps) {
  return (
    <Card>
      <CardHeader className="relative pb-2">
        <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="pt-8">
          <div className="flex items-center gap-2">
            <Badge variant={getForwardStatusVariant(record.status)}>{record.status}</Badge>
          </div>
          <CardTitle className="text-xl mt-2">{record.subject}</CardTitle>
          <CardDescription className="flex items-center gap-3">
            <span className="font-medium">{record.trackingNumber}</span> •{" "}
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> {new Date(record.date).toLocaleDateString()}
            </span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-b pb-4">
          <div>
            <p className="text-muted-foreground flex items-center mb-1">
              <FileText className="h-3 w-3 mr-1" /> File:
            </p>
            <p className="font-medium">{record.fileName}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center mb-1">
              <Send className="h-3 w-3 mr-1" /> Forwarded Date:
            </p>
            <p className="font-medium">{new Date(record.forward_date).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-b pb-4">
          <div>
            <p className="text-muted-foreground flex items-center mb-1">
              <User className="h-3 w-3 mr-1" /> From:
            </p>
            <p className="font-medium">{record.from}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center mb-1">
              <User className="h-3 w-3 mr-1" /> To:
            </p>
            <p className="font-medium">{record.to}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-b pb-4">
          <div>
            <p className="text-muted-foreground flex items-center mb-1">
              <Send className="h-3 w-3 mr-1" /> Forwarded To:
            </p>
            <p className="font-medium">{record.forwarded_to}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center mb-1">
              <Send className="h-3 w-3 mr-1" /> Recipient Type:
            </p>
            <p className="font-medium capitalize">{record.recipient_type}</p>
          </div>
        </div>
        
        {record.notes && (
          <div className="mb-4 text-sm">
            <p className="text-muted-foreground mb-1">Forward Notes:</p>
            <div className="p-4 bg-muted/20 rounded-md whitespace-pre-wrap border">
              {record.notes}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getForwardStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Pending":
      return "secondary"
    case "Received":
      return "default"
    case "Rejected":
      return "destructive"
    default:
      return "outline"
  }
} 