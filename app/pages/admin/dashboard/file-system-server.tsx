// Server-side function
"use server"
import pool from "@/app/database/connection"

interface FileData {
  id: string
  fileNumber: string
  name: string
  type: string
  dateCreated: string
  referenceNumber: string
  records: any[]
}

export async function handleFileOperation(
  fileData: FileData,
  admin_id: string | number,
  username: string,
  email: string,
  role: string,
  add = true,
  update = false,
  delete_op = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // ADD operation
    if (add) {
      console.log("File Data:", fileData)
      console.log("Admin ID:", admin_id)
      console.log("Username:", username)
      console.log("Email:", email)
      console.log("Role:", role)
      console.log("Add:", add)
      console.log("Update:", update)
      console.log("Delete:", delete_op)

      // Create an array to store missing field names
      const missingFields = []

      // Check each required field and add to missingFields if missing
      if (!fileData?.id) missingFields.push('id')
      if (!fileData?.fileNumber) missingFields.push('fileNumber')
      if (!fileData?.name) missingFields.push('name')
      if (!fileData?.type) missingFields.push('type')
      if (!fileData?.dateCreated) missingFields.push('dateCreated')
      if (!fileData?.referenceNumber) missingFields.push('referenceNumber')
      if (!admin_id) missingFields.push('admin_id')
      if (!username) missingFields.push('username')
      if (!email) missingFields.push('email')
      if (!role) missingFields.push('role')

      // If there are any missing fields, return them in the error message
      if (missingFields.length > 0) {
        console.log("Missing fields:", missingFields)
        return {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        }
      }

      const query = `
        INSERT INTO files_table (
          id,
          fileNumber,
          name,
          type,
          dateCreated,
          referenceNumber,
          admin_id,
          username,
          email,
          role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const values = [
        fileData.id,
        fileData.fileNumber,
        fileData.name,
        fileData.type,
        new Date(fileData.dateCreated),
        fileData.referenceNumber,
        admin_id,
        username,
        email,
        role
      ]

      // Debug log the values being inserted
      console.log("Attempting to insert with values:", values)

      try {
        const result = await pool.query(query, values)
        console.log("Query result:", result)
        
        if (result) {
          console.log("📂 File operation successful:", {
            fileData,
            admin_id,
            username,
            email,
            role,
            operation: "add",
            timestamp: new Date().toISOString(),
          })
          return { success: true }
        } else {
          console.log("Insert failed - no rows affected")
          return {
            success: false,
            error: "Failed to save file. No rows were affected."
          }
        }
      } catch (dbError: any) {
        console.error("Database error details:", {
          message: dbError.message,
          code: dbError.code,
          errno: dbError.errno,
          sqlMessage: dbError.sqlMessage,
          sqlState: dbError.sqlState,
          sql: dbError.sql
        })
        
        return {
          success: false,
          error: `Database error: ${dbError.sqlMessage || dbError.message}`
        }
      }
    }

    // UPDATE operation - to be implemented later
    if (update) {
      return {
        success: false,
        error: "Update operation not implemented yet"
      }
    }

    // DELETE operation - to be implemented later
    if (delete_op) {
      return {
        success: false,
        error: "Delete operation not implemented yet"
      }
    }

    return {
      success: false,
      error: "Invalid operation"
    }
  } catch (error: any) {
    console.error("Error in handleFileOperation:", {
      message: error.message,
      stack: error.stack,
      details: error
    })
    return {
      success: false,
      error: error?.sqlMessage || error?.message || "An unexpected error occurred"
    }
  }
}

export async function fetchFilesByAdmin(admin_id: string | number): Promise<{ success: boolean; data?: FileData[]; error?: string }> {
  try {
    const query = `
      SELECT * FROM files_table 
      WHERE admin_id = ?
      ORDER BY dateCreated DESC
    `

    const [rows] = await pool.query(query, [admin_id])
    
    if (Array.isArray(rows)) {
      return {
        success: true,
        data: rows.map((row: any) => ({
          id: row.id,
          fileNumber: row.fileNumber,
          name: row.name,
          type: row.type,
          dateCreated: row.dateCreated.toISOString(),
          referenceNumber: row.referenceNumber,
          records: [] // Initially empty, you may want to fetch records separately
        }))
      }
    }

    return {
      success: false,
      error: "No files found"
    }

  } catch (error: any) {
    console.error("Error fetching files:", error)
    return {
      success: false,
      error: error?.message || "Failed to fetch files"
    }
  }
}

