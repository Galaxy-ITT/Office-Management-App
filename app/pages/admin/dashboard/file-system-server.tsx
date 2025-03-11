// Server-side function
"use server"
import pool from "@/app/database/connection"
import { RowDataPacket, FieldPacket } from "mysql2"


interface FileData {
  id: string
  fileNumber: string
  name: string
  type: string
  dateCreated: string
  referenceNumber: string
  records: any[]
}

interface RecordData {
  id: string
  file_id: string
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

async function getNextIdentifiers(): Promise<{ fileNumber: string, referenceNumber: string }> {
  // Get the latest numbers from the database
  const [lastEntry] = await pool.query(
    'SELECT fileNumber, referenceNumber FROM files_table ORDER BY id DESC LIMIT 1'
  ) as [RowDataPacket[], FieldPacket[]];

  let nextFileNum = 1;
  let nextRefNum = 1;

  if (Array.isArray(lastEntry) && lastEntry.length > 0) {
    // Extract numbers from last file number (FIL-01 -> 1)
    const lastFileMatch = lastEntry[0].fileNumber.match(/\d+/);
    if (lastFileMatch) {
      nextFileNum = parseInt(lastFileMatch[0]) + 1;
    }

    // Extract numbers from last reference number (REF-01 -> 1)
    const lastRefMatch = lastEntry[0].referenceNumber.match(/\d+/);
    if (lastRefMatch) {
      nextRefNum = parseInt(lastRefMatch[0]) + 1;
    }
  }

  // Format new numbers with padding
  const fileNumber = `FIL-${nextFileNum.toString().padStart(2, '0')}`;
  const referenceNumber = `REF-${nextRefNum.toString().padStart(2, '0')}`;

  return { fileNumber, referenceNumber };
}

async function getNextTrackingNumber(): Promise<string> {
  const [lastEntry] = await pool.query(
    'SELECT trackingNumber FROM records_table ORDER BY id DESC LIMIT 1'
  ) as [RowDataPacket[], FieldPacket[]];

  let nextNum = 1;
  if (Array.isArray(lastEntry) && lastEntry.length > 0) {
    const lastMatch = lastEntry[0]?.trackingNumber?.match(/\d+/);
    if (lastMatch) {
      nextNum = parseInt(lastMatch[0]) + 1;
    }
  }

  return `TRK-${nextNum.toString().padStart(5, '0')}`;
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
    if (add) {
      // Generate new identifiers based on last entries
      const { fileNumber, referenceNumber } = await getNextIdentifiers();
      fileData.fileNumber = fileNumber;
      fileData.referenceNumber = referenceNumber;

      // Continue with the existing validation and insertion logic
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

export async function handleRecordOperation(
  recordData: RecordData,
  operation: 'add' | 'update' | 'delete'
): Promise<{ success: boolean; error?: string; data?: RecordData }> {
  try {
    switch (operation) {
      case 'add': {
        // Generate tracking number first
        const trackingNumber = await getNextTrackingNumber();
        
        const query = `
          INSERT INTO records_table (
            id,
            file_id,
            uniqueNumber,
            type,
            date,
            \`from\`,
            \`to\`,
            subject,
            content,
            status,
            reference,
            trackingNumber,
            attachmentUrl,
            attachmentName,
            attachmentSize,
            attachmentType
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          recordData.id,
          recordData.file_id,
          recordData.uniqueNumber,
          recordData.type,
          new Date(recordData.date),
          recordData.from,
          recordData.to,
          recordData.subject,
          recordData.content,
          recordData.status,
          recordData.reference,
          trackingNumber,
          recordData.attachmentUrl || null,
          recordData.attachmentName || null,
          recordData.attachmentSize || null,
          recordData.attachmentType || null
        ];

        const [result] = await pool.query(query, values);
        
        // Return the complete record data including the generated tracking number
        const savedRecord: RecordData = {
          ...recordData,
          trackingNumber,
          attachmentUrl: recordData.attachmentUrl || null,
          attachmentName: recordData.attachmentName || null,
          attachmentSize: recordData.attachmentSize || null,
          attachmentType: recordData.attachmentType || null
        };

        console.log("📝 Record created:", savedRecord);
        
        return { 
          success: true,
          data: savedRecord
        };
      }

      case 'update': {
        const query = `
          UPDATE records_table SET
            type = ?,
            \`from\` = ?,
            \`to\` = ?,
            subject = ?,
            content = ?,
            status = ?,
            reference = ?
          WHERE id = ? AND file_id = ?
        `;

        const values = [
          recordData.type,
          recordData.from,
          recordData.to,
          recordData.subject,
          recordData.content,
          recordData.status,
          recordData.reference,
          recordData.id,
          recordData.file_id
        ];

        const [result] = await pool.query(query, values);
        console.log("📝 Record updated:", { recordData });
        
        return { success: true };
      }

      case 'delete': {
        const query = `
          DELETE FROM records_table
          WHERE id = ? AND file_id = ?
        `;

        const [result] = await pool.query(query, [recordData.id, recordData.file_id]);
        console.log("📝 Record deleted:", { recordId: recordData.id });
        
        return { success: true };
      }

      default:
        return {
          success: false,
          error: 'Invalid operation'
        };
    }
  } catch (error: any) {
    console.error("Error in handleRecordOperation:", {
      operation,
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error?.sqlMessage || error?.message || "An unexpected error occurred"
    };
  }
}

// Update the fetch function to include attachment information
export async function fetchRecordsByFileId(fileId: string): Promise<{ success: boolean; data?: RecordData[]; error?: string }> {
  try {
    const query = `
      SELECT * FROM records_table 
      WHERE file_id = ?
      ORDER BY date DESC
    `;

    const [rows] = await pool.query(query, [fileId]) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(rows)) {
      return {
        success: true,
        data: rows.map(row => ({
          id: row.id,
          file_id: row.file_id,
          uniqueNumber: row.uniqueNumber,
          type: row.type,
          date: row.date.toISOString(),
          from: row.from,
          to: row.to,
          subject: row.subject,
          content: row.content,
          status: row.status,
          reference: row.reference,
          trackingNumber: row.trackingNumber,
          attachmentUrl: row.attachmentUrl,
          attachmentName: row.attachmentName,
          attachmentSize: row.attachmentSize,
          attachmentType: row.attachmentType
        }))
      };
    }

    return {
      success: false,
      error: "No records found"
    };
  } catch (error: any) {
    console.error("Error fetching records:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch records"
    };
  }
}

