"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

type FileType = 'internal' | 'external' | 'incoming' | 'outgoing';
type RecordType = 'incoming' | 'outgoing' | 'internal' | 'others';
type RecordStatus = 'pending' | 'forwarded' | 'completed';

type Record = {
  id: string;
  uniqueNumber: string;
  type: RecordType;
  date: string;
  from: string;
  to: string;
  sender: string;
  subject: string;
  content: string;
  attachmentUrl?: string;
  status: RecordStatus;
  reference: string;
  trackingNumber: string;
};

type File = {
  id: string;
  fileNumber: string;
  name: string;
  type: FileType;
  dateCreated: string;
  records: Record[];
};

type FileSystemContextType = {
  files: File[];
  selectedFile: File | null;
  selectedRecord: Record | null;
  addFile: (name: string, type: FileType) => void;
  addRecord: (fileId: string, record: Omit<Record, 'id' | 'status' | 'uniqueNumber' | 'trackingNumber'>) => void;
  updateRecord: (fileId: string, recordId: string, updates: Partial<Record>) => void;
  selectFile: (file: File | null) => void;
  selectRecord: (record: Record | null) => void;
  deleteFile: (fileId: string) => void;
  forwardRecord: (fileId: string, recordId: string, forwardTo: string) => void;
  searchFiles: (query: string) => File[];
  searchRecords: (query: string) => Record[];
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  const addFile = (name: string, type: FileType) => {
    const newFile: File = {
      id: Date.now().toString(),
      fileNumber: `F${Date.now().toString().slice(-6)}`,
      name,
      type,
      dateCreated: new Date().toISOString(),
      records: []
    };
    setFiles(prev => [...prev, newFile]);
  };

  const addRecord = (fileId: string, record: Omit<Record, 'id' | 'status' | 'uniqueNumber' | 'trackingNumber'>) => {
    const uniqueNumber = `R${Date.now().toString().slice(-6)}`;
    const trackingNumber = `T${Date.now().toString().slice(-8)}`;
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          records: [...file.records, { 
            ...record, 
            id: Date.now().toString(), 
            status: 'pending',
            uniqueNumber,
            trackingNumber
          }]
        };
      }
      return file;
    }));
  };

  const updateRecord = (fileId: string, recordId: string, updates: Partial<Record>) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          records: file.records.map(record => 
            record.id === recordId ? { ...record, ...updates } : record
          )
        };
      }
      return file;
    }));
  };

  const selectFile = (file: File | null) => {
    setSelectedFile(file);
    setSelectedRecord(null);
  };

  const selectRecord = (record: Record | null) => {
    setSelectedRecord(record);
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setSelectedRecord(null);
    }
  };

  const forwardRecord = (fileId: string, recordId: string, forwardTo: string) => {
    updateRecord(fileId, recordId, { status: 'forwarded' });
    // In a real application, you would implement the logic to forward the record to the specified person
    console.log(`Record ${recordId} forwarded to ${forwardTo}`);
  };

  const searchFiles = (query: string): File[] => {
    return files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.fileNumber.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchRecords = (query: string): Record[] => {
    return files.flatMap(file => file.records).filter(record => 
      record.subject.toLowerCase().includes(query.toLowerCase()) ||
      record.uniqueNumber.toLowerCase().includes(query.toLowerCase()) ||
      record.trackingNumber.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <FileSystemContext.Provider value={{
      files,
      selectedFile,
      selectedRecord,
      addFile,
      addRecord,
      updateRecord,
      selectFile,
      selectRecord,
      deleteFile,
      forwardRecord,
      searchFiles,
      searchRecords
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};

