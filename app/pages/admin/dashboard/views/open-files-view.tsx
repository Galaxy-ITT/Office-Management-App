"use client"

import { useFileSystem } from "../file-system-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import FileList from "../file-list"
import FileDetails from "../file-details"
import { handleFileOperation } from "../file-system-server"

export default function OpenFilesView() {
  const { files, selectedFile, selectFile } = useFileSystem()

  // Filter only open files
  const openFiles = files.filter((file) => file.type === "Open File")

  // Call server component when view is loaded
  useState(() => {
    const loadData = async () => {
     
    }
    loadData()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Open Files</h1>
      </div>

      {selectedFile ? (
        <>
          <Button variant="outline" onClick={() => selectFile(null)} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Files
          </Button>
          <FileDetails file={selectedFile} />
        </>
      ) : (
        <FileList files={openFiles} onSelectFile={selectFile} />
      )}
    </div>
  )
}

