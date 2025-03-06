"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { v4 as uuidv4 } from "uuid"

export type FileType = "Open File" | "Secret File" | "Subject Matter" | "Temporary"

export interface Record {
  id: string
  uniqueNumber: string
  type: string
  date: string
  from: string
  to: string
  subject: string
  content: string
  attachmentUrl?: string
  status: string
  reference: string
  trackingNumber: string
}

export interface File {
  id: string
  fileNumber: string
  name: string
  type: FileType
  dateCreated: string
  referenceNumber: string
  records: Record[]
}

interface FileSystemContextType {
  files: File[]
  selectedFile: File | null
  selectedRecord: Record | null
  selectFile: (file: File | null) => void
  selectRecord: (record: Record | null) => void
  addFile: (name: string, type: FileType) => void
  updateFile: (fileId: string, updates: Partial<File>) => void
  deleteFile: (fileId: string) => void
  addRecord: (fileId: string, record: Omit<Record, "id" | "uniqueNumber">) => void
  updateRecord: (fileId: string, recordId: string, updates: Partial<Record>) => void
  deleteRecord: (fileId: string, recordId: string) => void
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider")
  }
  return context
}

// Sample data
const initialFiles: File[] = [
  {
    id: "1",
    fileNumber: "F-2023-001",
    name: "Annual Budget Report",
    type: "Open File",
    dateCreated: new Date().toISOString(),
    referenceNumber: "REF-001",
    records: [
      {
        id: "101",
        uniqueNumber: "R-101",
        type: "Memo",
        date: new Date().toISOString(),
        from: "Finance Department",
        to: "Executive Office",
        subject: "Budget Allocation for Q1",
        content: "Details of budget allocation for the first quarter of the fiscal year.",
        status: "Active",
        reference: "REF-101",
        trackingNumber: "TRK-101",
      },
      {
        id: "102",
        uniqueNumber: "R-102",
        type: "Report",
        date: new Date().toISOString(),
        from: "Accounting",
        to: "Finance Department",
        subject: "Q1 Expenditure Analysis",
        content: "Analysis of expenditures for Q1 with recommendations for Q2.",
        status: "Active",
        reference: "REF-102",
        trackingNumber: "TRK-102",
      },
    ],
  },
  {
    id: "2",
    fileNumber: "F-2023-002",
    name: "HR Policies Update",
    type: "Subject Matter",
    dateCreated: new Date().toISOString(),
    referenceNumber: "REF-002",
    records: [
      {
        id: "201",
        uniqueNumber: "R-201",
        type: "Policy Document",
        date: new Date().toISOString(),
        from: "HR Department",
        to: "All Staff",
        subject: "Updated Leave Policy",
        content: "Details of the updated leave policy effective from next month.",
        status: "Active",
        reference: "REF-201",
        trackingNumber: "TRK-201",
      },
    ],
  },
]

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)

  const selectFile = (file: File | null) => {
    setSelectedFile(file)
    setSelectedRecord(null)
  }

  const selectRecord = (record: Record | null) => {
    setSelectedRecord(record)
  }

  const addFile = (name: string, type: FileType) => {
    const newFile: File = {
      id: uuidv4(),
      fileNumber: `F-${new Date().getFullYear()}-${String(files.length + 1).padStart(3, "0")}`,
      name,
      type,
      dateCreated: new Date().toISOString(),
      referenceNumber: `REF-${String(files.length + 1).padStart(3, "0")}`,
      records: [],
    }
    setFiles([...files, newFile])
  }

  const updateFile = (fileId: string, updates: Partial<File>) => {
    setFiles(files.map((file) => (file.id === fileId ? { ...file, ...updates } : file)))

    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile({ ...selectedFile, ...updates })
    }
  }

  const deleteFile = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId))
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(null)
    }
  }

  const addRecord = (fileId: string, record: Omit<Record, "id" | "uniqueNumber">) => {
    const fileIndex = files.findIndex((file) => file.id === fileId)
    if (fileIndex === -1) return

    const newRecord: Record = {
      ...record,
      id: uuidv4(),
      uniqueNumber: `R-${String(files[fileIndex].records.length + 1).padStart(3, "0")}`,
    }

    const updatedFiles = [...files]
    updatedFiles[fileIndex] = {
      ...updatedFiles[fileIndex],
      records: [...updatedFiles[fileIndex].records, newRecord],
    }

    setFiles(updatedFiles)

    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile({
        ...selectedFile,
        records: [...selectedFile.records, newRecord],
      })
    }
  }

  const updateRecord = (fileId: string, recordId: string, updates: Partial<Record>) => {
    const fileIndex = files.findIndex((file) => file.id === fileId)
    if (fileIndex === -1) return

    const updatedFiles = [...files]
    updatedFiles[fileIndex] = {
      ...updatedFiles[fileIndex],
      records: updatedFiles[fileIndex].records.map((record) =>
        record.id === recordId ? { ...record, ...updates } : record,
      ),
    }

    setFiles(updatedFiles)

    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile({
        ...selectedFile,
        records: selectedFile.records.map((record) => (record.id === recordId ? { ...record, ...updates } : record)),
      })
    }

    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({ ...selectedRecord, ...updates })
    }
  }

  const deleteRecord = (fileId: string, recordId: string) => {
    const fileIndex = files.findIndex((file) => file.id === fileId)
    if (fileIndex === -1) return

    const updatedFiles = [...files]
    updatedFiles[fileIndex] = {
      ...updatedFiles[fileIndex],
      records: updatedFiles[fileIndex].records.filter((record) => record.id !== recordId),
    }

    setFiles(updatedFiles)

    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile({
        ...selectedFile,
        records: selectedFile.records.filter((record) => record.id !== recordId),
      })
    }

    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord(null)
    }
  }

  return (
    <FileSystemContext.Provider
      value={{
        files,
        selectedFile,
        selectedRecord,
        selectFile,
        selectRecord,
        addFile,
        updateFile,
        deleteFile,
        addRecord,
        updateRecord,
        deleteRecord,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}

