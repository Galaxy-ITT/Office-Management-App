"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { handleFileOperation, fetchFilesByAdmin, fetchRecordsByFileId } from "./file-system-server"
import { useRouter } from "next/navigation"
import { handleRecordOperation } from "./file-system-server"

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
  status: string
  reference: string
  trackingNumber: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentSize?: number | null
  attachmentType?: string | null
}

interface RecordData extends Record {
  file_id: string
  attachmentUrl: string | null
  attachmentName: string | null
  attachmentSize: number | null
  attachmentType: string | null
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
  selectFile: (file: File | null) => Promise<void>
  selectRecord: (record: Record | null) => void
  addFile: (name: string, type: FileType, adminData?: any) => void
  updateFile: (fileId: string, updates: Partial<File>) => void
  deleteFile: (fileId: string) => void
  addRecord: (fileId: string, record: Omit<Record, "id" | "uniqueNumber">) => Promise<{
    success: boolean;
    error?: string;
    data?: RecordData;
  }>
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
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadFiles = async () => {
      if (adminData?.admin_id) {
        setIsLoadingFiles(true)
        try {
          // First, fetch all files
          const result = await fetchFilesByAdmin(adminData.admin_id)
          
          if (result.success && result.data) {
            const filesWithoutRecords = result.data.map(file => ({
              ...file,
              type: file.type as FileType,
              records: [] // Initialize with empty records
            }))
            
            // Set initial files state to show something to the user
            setFiles(filesWithoutRecords)
            
            // Then fetch records for each file
            const filesWithRecords = [...filesWithoutRecords]
            
            // Process files in sequence to avoid overwhelming the server
            for (let i = 0; i < filesWithRecords.length; i++) {
              const file = filesWithRecords[i]
              const recordsResult = await fetchRecordsByFileId(file.id)
              
              if (recordsResult.success && recordsResult.data) {
                filesWithRecords[i] = {
                  ...file,
                  //@ts-ignore
                  records: recordsResult.data
                }
              }
            }
            
            // Update state with complete file data including records
            setFiles(filesWithRecords)
          } else {
            console.error("Failed to load files:", result.error)
          }
        } catch (error) {
          console.error("Error loading files and records:", error)
        } finally {
          setIsLoadingFiles(false)
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

  const selectFile = async (file: File | null) => {
    if (file) {
      // If the file already has records loaded, just set it as selected
      if (file.records && file.records.length > 0) {
        setSelectedFile(file)
      } else {
        // Fetch records for the selected file
        const result = await fetchRecordsByFileId(file.id)
        if (result.success && result.data) {
          // Update the file with its records
          const updatedFile = {
            ...file,
            records: result.data
          }
          
          // Update the file in the files array
          setFiles(files.map(f => 
            f.id === file.id ? updatedFile : f
          ))
          
          // Set the selected file with records
          setSelectedFile(updatedFile)
        } else {
          // If no records found, still select the file but with empty records
          setSelectedFile(file)
          console.error("Failed to load records:", result.error)
        }
      }
    } else {
      setSelectedFile(null)
    }
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

  const addRecord = async (fileId: string, record: Omit<Record, "id" | "uniqueNumber">) => {
    const fileIndex = files.findIndex((file) => file.id === fileId)
    if (fileIndex === -1) return { success: false, error: "File not found" }

    const newRecord: RecordData = {
      ...record,
      id: uuidv4(),
      uniqueNumber: `R-${String(files[fileIndex].records.length + 1).padStart(3, "0")}`,
      trackingNumber: `TRK-${new Date().getTime()}`,
      file_id: fileId,
      attachmentUrl: record.attachmentUrl || null,
      attachmentName: record.attachmentName || null,
      attachmentSize: record.attachmentSize || null,
      attachmentType: record.attachmentType || null
    }

    try {
      const result = await handleRecordOperation(newRecord, 'add');

      console.log(result)

      if (result.success) {
        const updatedFiles = [...files];
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          records: [...updatedFiles[fileIndex].records, newRecord],
        };

        setFiles(updatedFiles);

        if (selectedFile && selectedFile.id === fileId) {
          setSelectedFile({
            ...selectedFile,
            records: [...selectedFile.records, newRecord],
          });
        }
        return { success: true, data: newRecord };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding record:", error);
      return { success: false, error: "Failed to add record" };
    }
  }

  const updateRecord = async (fileId: string, recordId: string, updates: Partial<Record>) => {
    try {
      const result = await handleRecordOperation(
        {
          ...updates,
          id: recordId,
          file_id: fileId,
        } as RecordData,
        'update'
      );

      if (result.success) {
        const fileIndex = files.findIndex((file) => file.id === fileId);
        if (fileIndex === -1) return;

        const updatedFiles = [...files];
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          records: updatedFiles[fileIndex].records.map((record) =>
            record.id === recordId ? { ...record, ...updates } : record
          ),
        };

        setFiles(updatedFiles);

        if (selectedFile && selectedFile.id === fileId) {
          setSelectedFile({
            ...selectedFile,
            records: selectedFile.records.map((record) =>
              record.id === recordId ? { ...record, ...updates } : record
            ),
          });
        }

        if (selectedRecord && selectedRecord.id === recordId) {
          setSelectedRecord({ ...selectedRecord, ...updates });
        }
      } else {
        console.error("Failed to update record:", result.error);
      }
    } catch (error) {
      console.error("Error updating record:", error);
    }
  }

  const deleteRecord = async (fileId: string, recordId: string) => {
    try {
      const result = await handleRecordOperation(
        {
          id: recordId,
          file_id: fileId,
        } as RecordData,
        'delete'
      );

      if (result.success) {
        const fileIndex = files.findIndex((file) => file.id === fileId);
        if (fileIndex === -1) return;

        const updatedFiles = [...files];
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          records: updatedFiles[fileIndex].records.filter((record) => record.id !== recordId),
        };

        setFiles(updatedFiles);

        if (selectedFile && selectedFile.id === fileId) {
          setSelectedFile({
            ...selectedFile,
            records: selectedFile.records.filter((record) => record.id !== recordId),
          });
        }

        if (selectedRecord && selectedRecord.id === recordId) {
          setSelectedRecord(null);
        }
      } else {
        console.error("Failed to delete record:", result.error);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
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

