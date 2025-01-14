import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewFolderDialog: React.FC<NewFolderDialogProps> = ({ isOpen, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const { addFolder } = useFileSystem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      addFolder(folderName.trim());
      setFolderName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder Name"
          />
          <Button type="submit">Create Folder</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderDialog;

