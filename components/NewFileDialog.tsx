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
  const [fileType, setFileType] = useState('Open File');
  const { addFile } = useFileSystem();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      addFile(fileName.trim(), fileType);
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
          <div>
            <label htmlFor="fileType">File Type</label>

          <select
              id="fileType"
              value={fileType}
              onChange={(e) => setFileType(e.target.value as FileType)}
              className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Open File">Open Files</option>
              <option value="Secret File">Secret Files - Govt Copy</option>
              <option value="Subject Matter">Subject Matter - AOB</option>
              <option value="Temporary">Temporary</option>
            </select>

          </div>
          <Button type="submit">Create File</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFileDialog;
