import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewFileDialog: React.FC<NewFileDialogProps> = ({ isOpen, onClose }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'internal' | 'external' | 'incoming' | 'outgoing'>('internal');
  const { addFile } = useFileSystem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      addFile(fileName.trim(), fileType);
      setFileName('');
      setFileType('internal');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="File Name"
            />
          </div>
          <div>
            <Select value={fileType} onValueChange={(value: 'internal' | 'external' | 'incoming' | 'outgoing') => setFileType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create File</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFileDialog;

