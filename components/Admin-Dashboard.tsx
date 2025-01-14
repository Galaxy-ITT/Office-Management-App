"use client"

import React, { useState } from 'react';
import { useFileSystem } from './FileSystemContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewFileDialog from './NewFileDialog';
import FileDetails from './FileDetails';
import Sidebar from './Sidebar';

const AdminDashboard: React.FC = () => {
  const { files, selectedFile, selectFile } = useFileSystem();
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Files</h1>
          <Button onClick={() => setIsNewFileDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New File
          </Button>
        </div>
        {selectedFile ? (
          <FileDetails file={selectedFile} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => (
              <div
                key={file.id}
                className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => selectFile(file)}
              >
                <h2 className="text-lg font-semibold">{file.name}</h2>
                <p className="text-sm text-gray-500">File Number: {file.fileNumber}</p>
                <p className="text-sm text-gray-500">Type: {file.type}</p>
                <p className="text-sm text-gray-500">Records: {file.records.length}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;

