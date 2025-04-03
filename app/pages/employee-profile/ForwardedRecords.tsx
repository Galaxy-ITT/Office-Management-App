"use client"

import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/userContext/userContext";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Download, File, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchForwardedRecords, reviewForwardedRecord } from "./_queries";

interface ForwardedRecord {
  forward_id: string;
  record_id: string;
  file_id: string;
  forwarded_by: number;
  forwarded_to: string;
  notes: string;
  forward_date: string;
  status: string;
  forwarder_name: string; // Admin name who forwarded
  // Record details
  uniqueNumber: string;
  type: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  reference: string;
  trackingNumber: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  // File details
  fileNumber: string;
  fileName: string;
  fileType: string;
}

export default function ForwardedRecords() {
  const { userData } = useContext(UserContext);
  const { toast } = useToast();
  const [records, setRecords] = useState<ForwardedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ForwardedRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getForwardedRecords = async () => {
      try {
        if (!userData || !userData.employee_id) {
          setError("Employee information not available");
          setLoading(false);
          return;
        }

        const result = await fetchForwardedRecords(userData.employee_id);
        if (result.success && Array.isArray(result.data)) {
          setRecords(result.data as ForwardedRecord[]);
        } else {
          setError(result.error || "Failed to load data");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching forwarded records:", err);
        setError("Failed to load forwarded records");
        setLoading(false);
      }
    };

    getForwardedRecords();
  }, [userData]);

  const handleDownloadAttachment = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Could not download the attachment",
        variant: "destructive",
      });
    }
  };

  const handleReviewRecord = async (forward_id: string, action: "Accept" | "Reject", note: string = "") => {
    try {
      const result = await reviewForwardedRecord({
        forward_id,
        employee_id: userData?.employee_id!,
        employee_name: userData?.name!,
        review_action: action,
        review_note: note
      });
      
      if (result.success) {
        // Update the local state
        setRecords(prev => 
          prev.map(record => 
            record.forward_id === forward_id 
              ? { ...record, status: action === "Accept" ? "Accepted" : "Rejected" } 
              : record
          )
        );
        
        toast({
          title: `Record ${action === "Accept" ? "Accepted" : "Rejected"}`,
          description: `You have ${action.toLowerCase()}ed the forwarded record.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action.toLowerCase()} the record.`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Forwarded Records</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forwarded Records</h2>
        <Badge className="px-3 py-1">
          {records.length} {records.length === 1 ? 'Record' : 'Records'}
        </Badge>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Records Found</CardTitle>
            <CardDescription>
              You don't have any records forwarded to you at the moment.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Records Forwarded to You</CardTitle>
            <CardDescription>
              Review and manage records that have been forwarded to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Forwarded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.forward_id}>
                    <TableCell className="font-medium">
                      {record.subject}
                      <div className="text-xs text-muted-foreground">
                        {record.fileNumber} • {record.uniqueNumber}
                      </div>
                    </TableCell>
                    <TableCell>{record.forwarder_name}</TableCell>
                    <TableCell>
                      {format(new Date(record.forward_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            {selectedRecord && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>{selectedRecord.subject}</DialogTitle>
                                  <DialogDescription>
                                    {selectedRecord.uniqueNumber} • Forwarded on {format(new Date(selectedRecord.forward_date), 'MMMM d, yyyy')}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">File Details</h4>
                                    <p className="text-sm">File Number: {selectedRecord.fileNumber}</p>
                                    <p className="text-sm">File Name: {selectedRecord.fileName}</p>
                                    <p className="text-sm">File Type: {selectedRecord.fileType}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Record Details</h4>
                                    <p className="text-sm">From: {selectedRecord.from}</p>
                                    <p className="text-sm">To: {selectedRecord.to}</p>
                                    <p className="text-sm">Type: {selectedRecord.type}</p>
                                    <p className="text-sm">Date: {format(new Date(selectedRecord.date), 'MMMM d, yyyy')}</p>
                                  </div>
                                </div>
                                <div className="space-y-2 py-2">
                                  <h4 className="font-medium text-sm">Content</h4>
                                  <div className="p-4 bg-muted rounded-md text-sm">
                                    {selectedRecord.content || "No content provided."}
                                  </div>
                                </div>
                                <div className="space-y-2 py-2">
                                  <h4 className="font-medium text-sm">Forwarding Notes</h4>
                                  <div className="p-4 bg-muted rounded-md text-sm">
                                    {selectedRecord.notes || "No notes provided."}
                                  </div>
                                </div>
                                {selectedRecord.attachmentUrl && (
                                  <div className="flex items-center space-x-2 py-2">
                                    <File className="h-4 w-4" />
                                    <span className="text-sm">{selectedRecord.attachmentName}</span>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDownloadAttachment(
                                        selectedRecord.attachmentUrl!, 
                                        selectedRecord.attachmentName!
                                      )}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                )}
                                <DialogFooter>
                                  {selectedRecord.status.toLowerCase() === 'pending' && (
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        className="border-red-200 hover:bg-red-50"
                                        onClick={() => handleReviewRecord(selectedRecord.forward_id, "Reject")}
                                      >
                                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                        Reject
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="border-green-200 hover:bg-green-50"
                                        onClick={() => handleReviewRecord(selectedRecord.forward_id, "Accept")}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                        Accept
                                      </Button>
                                    </div>
                                  )}
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 