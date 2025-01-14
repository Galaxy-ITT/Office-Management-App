import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RecordDetails from './RecordDetails';


interface FileDetailsProps {
  file: {
    id: string;
    fileNumber: string;
    name: string;
    type: string;
    dateCreated: string;
    records: Array<{
      id: string;
      uniqueNumber: string;
      type: string;
      date: string;
      from: string;
      to: string;
      sender: string;
      subject: string;
      content: string;
      attachmentUrl?: string;
      status: string;
      reference: string;
      trackingNumber: string;
    }>;
  };
}

const FileDetails: React.FC<FileDetailsProps> = ({ file }) => {
  const { addRecord, selectRecord, selectedRecord } = useFileSystem();
  const [isNewRecordDialogOpen, setIsNewRecordDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: 'incoming' as const,
    date: '',
    from: '',
    to: '',
    sender: '',
    subject: '',
    content: '',
    attachmentUrl: '',
    reference: ''
  });

  const handleAddRecord = () => {
    addRecord(file.id, newRecord);
    setIsNewRecordDialogOpen(false);
    setNewRecord({
      type: 'incoming',
      date: '',
      from: '',
      to: '',
      sender: '',
      subject: '',
      content: '',
      attachmentUrl: '',
      reference: ''
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server here
      // and get back a URL. For this example, we'll just use a fake URL.
      const fakeUrl = URL.createObjectURL(file);
      setNewRecord({ ...newRecord, attachmentUrl: fakeUrl });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{file.name}</h2>
          <p className="text-sm text-gray-500">File Number: {file.fileNumber}</p>
        </div>
        <Button onClick={() => setIsNewRecordDialogOpen(true)}>Add Record</Button>
      </div>
      <p className="text-sm text-gray-500">Type: {file.type}</p>
      <p className="text-sm text-gray-500">Created on: {new Date(file.dateCreated).toLocaleDateString()}</p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unique Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {file.records.map(record => (
            <TableRow key={record.id} className="cursor-pointer hover:bg-gray-100" onClick={() => selectRecord(record)}>
              <TableCell>{record.uniqueNumber}</TableCell>
              <TableCell>{record.type}</TableCell>
              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
              <TableCell>{record.from}</TableCell>
              <TableCell>{record.to}</TableCell>
              <TableCell>{record.sender}</TableCell>
              <TableCell>{record.subject}</TableCell>
              <TableCell>{record.status}</TableCell>
              <TableCell>{record.trackingNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedRecord && <RecordDetails record={selectedRecord} fileId={file.id} />}

      <Dialog open={isNewRecordDialogOpen} onOpenChange={setIsNewRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select 
              value={newRecord.type} 
              onValueChange={(value: 'incoming' | 'outgoing' | 'internal' | 'others') => setNewRecord({...newRecord, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newRecord.date}
              onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
              placeholder="Date"
            />
            <Input
              value={newRecord.from}
              onChange={(e) => setNewRecord({...newRecord, from: e.target.value})}
              placeholder="From"
            />
            <Input
              value={newRecord.to}
              onChange={(e) => setNewRecord({...newRecord, to: e.target.value})}
              placeholder="To"
            />
            <Input
              value={newRecord.sender}
              onChange={(e) => setNewRecord({...newRecord, sender: e.target.value})}
              placeholder="Sender"
            />
            <Input
              value={newRecord.subject}
              onChange={(e) => setNewRecord({...newRecord, subject: e.target.value})}
              placeholder="Subject"
            />
            <Input
              value={newRecord.reference}
              onChange={(e) => setNewRecord({...newRecord, reference: e.target.value})}
              placeholder="Reference"
            />
            <Textarea
              value={newRecord.content}
              onChange={(e) => setNewRecord({...newRecord, content: e.target.value})}
              placeholder="Content"
            />
            <Input
              type="file"
              onChange={handleFileUpload}
            />
            {newRecord.attachmentUrl && (
              <div>
                <p>Uploaded file:</p>
                <a href={newRecord.attachmentUrl} target="_blank" rel="noopener noreferrer">View File</a>
              </div>
            )}
            <Button onClick={handleAddRecord}>Add Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileDetails;

