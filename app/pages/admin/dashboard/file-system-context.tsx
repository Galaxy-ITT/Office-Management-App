"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { handleFileOperation, fetchFilesByAdmin } from "./file-system-server"
import { useRouter } from "next/navigation"

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
  addFile: (name: string, type: FileType, adminData?: any) => void
  updateFile: (fileId: string, updates: Partial<File>) => void
  deleteFile: (fileId: string) => void
  addRecord: (fileId: string, record: Omit<Record, "id" | "uniqueNumber">) => void
  updateRecord: (fileId: string, recordId: string, updates: Partial<Record>) => void
  deleteRecord: (fileId: string, recordId: string) => void
  adminData?: any
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider")
  }
  return context
}

export const FileSystemProvider: React.FC<{ children: React.ReactNode; adminData?: any }> = ({ 
  children, 
  adminData: initialAdminData 
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [adminData, setAdminData] = useState(initialAdminData)
  const router = useRouter()

  useEffect(() => {
    const loadFiles = async () => {
      if (adminData?.admin_id) {
        const result = await fetchFilesByAdmin(adminData.admin_id)
        if (result.success && result.data) {
          setFiles(result.data.map(file => ({
            ...file,
            type: file.type as FileType
          })))
        } else {
          console.error("Failed to load files:", result.error)
        }
      }
    }

    loadFiles()
  }, [adminData])

  useEffect(() => {
    if (initialAdminData) {
      setAdminData(initialAdminData)
    }
  }, [initialAdminData])

  useEffect(() => {
    if (!adminData) {
      router.push("/pages/admins-login")
    }
  }, [adminData, router])

  const selectFile = (file: File | null) => {
    setSelectedFile(file)
    setSelectedRecord(null)
  }

  const selectRecord = (record: Record | null) => {
    setSelectedRecord(record)
  }
  
  const addFile = async (name: string, type: FileType) => {
    if (!adminData) {
      return {
        success: false,
        error: "Authentication required"
      }
    }
    
    const newFile = {
      id: uuidv4(),
      fileNumber: `F-${new Date().getFullYear()}-${String(files.length + 1).padStart(3, "0")}`,
      name,
      type,
      dateCreated: new Date().toISOString(),
      referenceNumber: `REF-${String(files.length + 1).padStart(3, "0")}`,
      records: [],
    }

    const result = await handleFileOperation(
      newFile,
      adminData.admin_id,
      adminData.name,
      adminData.email,
      adminData.role,
      true,
      false,
      false
    )

    if (result.success) {
      setFiles([...files, newFile])
    }
    
    return result
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
        adminData,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}

