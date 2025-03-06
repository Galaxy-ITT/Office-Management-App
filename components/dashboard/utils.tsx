"use client"

import { handleFileOperation } from "./file-system-server"

/**
 * Handles menu operations from the sidebar
 * @param operation - The operation name
 * @param toast - Toast function to show notifications
 * @param callbacks - Optional callbacks for specific operations
 */
export async function handleMenuOperation(
  operation: string,
  toast: any,
  callbacks?: {
    openNewFileDialog?: () => void
  },
) {
  toast({
    title: `${operation} Selected`,
    description: `You selected the ${operation} operation.`,
  })

  // Call server component with appropriate parameters
  let result
  switch (operation) {
    case "Create New File":
      result = await handleFileOperation("admin123", "admin", true)
      if (callbacks?.openNewFileDialog) {
        callbacks.openNewFileDialog()
      }
      break
    case "Open Files":
      result = await handleFileOperation("admin123", "admin", false, false, false)
      break
    case "Recent Activities":
      result = await handleFileOperation("admin123", "admin", false, true, false)
      break
    default:
      result = await handleFileOperation("admin123", "admin", false, false, false)
  }

  console.log("Server response:", result)
  return result
}

