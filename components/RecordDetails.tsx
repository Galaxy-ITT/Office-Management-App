import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface RecordDetailsProps {
  record: {
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
  };
  fileId: string;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ record, fileId }) => {
  const { updateRecord, forwardRecord, selectRecord } = useFileSystem();
  const [forwardTo, setForwardTo] = useState('');
  const [customForwardTo, setCustomForwardTo] = useState('');

  const handleForward = () => {
    const recipient = forwardTo === 'other' ? customForwardTo : forwardTo;
    forwardRecord(fileId, record.id, recipient);
  };

  const handleSave = () => {
    // In a real application, you would update the record here
    // For now, we'll just close the details view
    selectRecord(null);
  };

  const handleCancel = () => {
    selectRecord(null);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Record Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Unique Number:</strong> {record.uniqueNumber}</p>
          <p><strong>Type:</strong> {record.type}</p>
          <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
          <p><strong>From:</strong> {record.from}</p>
          <p><strong>To:</strong> {record.to}</p>
          <p><strong>Sender:</strong> {record.sender}</p>
          <p><strong>Subject:</strong> {record.subject}</p>
          <p><strong>Content:</strong> {record.content}</p>
          <p><strong>Status:</strong> {record.status}</p>
          <p><strong>Reference:</strong> {record.reference}</p>
          <p><strong>Tracking Number:</strong> {record.trackingNumber}</p>
          {record.attachmentUrl && (
            <p>
              <strong>Attachment:</strong>{' '}
              <a href={record.attachmentUrl} target="_blank" rel="noopener noreferrer">View File</a>
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="flex items-center space-x-2 w-full">
          <Select value={forwardTo} onValueChange={setForwardTo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Forward to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boss">Boss</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {forwardTo === 'other' && (
            <Input
              value={customForwardTo}
              onChange={(e) => setCustomForwardTo(e.target.value)}
              placeholder="Enter name"
              className="flex-grow"
            />
          )}
          <Button onClick={handleForward} disabled={record.status === 'forwarded' || (!forwardTo || (forwardTo === 'other' && !customForwardTo))}>
            {record.status === 'forwarded' ? 'Forwarded' : 'Forward'}
          </Button>
        </div>
        <div className="flex justify-between w-full">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save & Exit</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecordDetails;

