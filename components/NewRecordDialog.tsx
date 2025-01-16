import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NewRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
}

const NewRecordDialog: React.FC<NewRecordDialogProps> = ({ isOpen, onClose, fileId }) => {
  const { addRecord } = useFileSystem();
  const [newRecord, setNewRecord] = useState({
    type: 'incoming' as const,
    date: '',
    from: '',
    to: '',
    subject: '',
    content: '',
    attachmentUrl: '',
    reference: ''
  });

  const handleAddRecord = () => {
    addRecord(fileId, newRecord);
    onClose();
    setNewRecord({
      type: 'incoming',
      date: '',
      from: '',
      to: '',
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
  );
};

export default NewRecordDialog;

