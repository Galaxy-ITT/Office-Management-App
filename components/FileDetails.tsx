import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NewRecordDialog from './NewRecordDialog';
import RecordDetails from './RecordDetails';

interface FileDetailsProps {
  file: {
    id: string;
    fileNumber: string;
    name: string;
    dateCreated: string;
    referenceNumber: string;
    records: Array<{
      id: string;
      uniqueNumber: string;
      type: string;
      date: string;
      from: string;
      to: string;
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
  const { selectRecord, selectedRecord } = useFileSystem();
  const [isNewRecordDialogOpen, setIsNewRecordDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{file.name}</h2>
          <p className="text-sm text-gray-500">File Number: {file.fileNumber}</p>
          <p className="text-sm text-gray-500">Reference Number: {file.referenceNumber}</p>
        </div>
        <Button onClick={() => setIsNewRecordDialogOpen(true)}>Add Record</Button>
      </div>
      <p className="text-sm text-gray-500">Created on: {new Date(file.dateCreated).toLocaleDateString()}</p>
      
      {file.records.length > 0 ? (
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
            {file.records.map(record => (
              <TableRow key={record.id} className="cursor-pointer hover:bg-gray-100" onClick={() => selectRecord(record)}>
                <TableCell>{record.uniqueNumber}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.from}</TableCell>
                <TableCell>{record.to}</TableCell>
                <TableCell>{record.subject}</TableCell>
                <TableCell>{record.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center text-gray-500 my-8">No records found. Click "Add Record" to create a new record.</p>
      )}

      {selectedRecord && <RecordDetails record={selectedRecord} fileId={file.id} />}

      <NewRecordDialog
        isOpen={isNewRecordDialogOpen}
        onClose={() => setIsNewRecordDialogOpen(false)}
        fileId={file.id}
      />
    </div>
  );
};

export default FileDetails;

