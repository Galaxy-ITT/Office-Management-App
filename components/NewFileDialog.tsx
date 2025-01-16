import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewFileDialog: React.FC<NewFileDialogProps> = ({ isOpen, onClose }) => {
  const [fileName, setFileName] = useState('');
  const { addFile } = useFileSystem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      addFile(fileName.trim());
      setFileName('');
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
          <Button type="submit">Create File</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFileDialog;

