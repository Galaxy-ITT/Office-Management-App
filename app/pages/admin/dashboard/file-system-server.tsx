// Server-side function
"use server"
import pool from "@/app/database/connection"
import { RowDataPacket, FieldPacket } from "mysql2"
import { v4 as uuidv4 } from "uuid"


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

// Add a new type for forwarded records
export interface ForwardedRecord {
  forward_id: string;
  record_id: string;
  file_id: string;
  forwarded_by: number;
  forwarded_to: string;
  recipient_type: string;
  notes?: string;
  forward_date: string;
  status: string;
  department_id?: number;
  employee_id?: string;
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

    const [records] = await pool.query(query, [fileId]) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(records)) {
      return {
        success: true,
        data: records.map(record => ({
          id: record.id,
          file_id: record.file_id,
          uniqueNumber: record.uniqueNumber,
          type: record.type,
          date: record.date.toISOString(),
          from: record.from,
          to: record.to,
          subject: record.subject,
          content: record.content,
          status: record.status,
          reference: record.reference,
          trackingNumber: record.trackingNumber,
          attachmentUrl: record.attachmentUrl,
          attachmentName: record.attachmentName,
          attachmentSize: record.attachmentSize,
          attachmentType: record.attachmentType
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

// New function to fetch departments from the database
export async function fetchDepartments(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const query = `
      SELECT department_id, name 
      FROM departments_table 
      ORDER BY name ASC
    `;

    const [departments] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(departments)) {
      return {
        success: true,
        data: departments.map(dept => ({
          id: dept.department_id,
          name: dept.name
        }))
      };
    }

    return {
      success: false,
      error: "No departments found"
    };
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch departments"
    };
  }
}

// New function to fetch employees (colleagues)
export async function fetchEmployees(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const query = `
      SELECT employee_id, name, position, department_id
      FROM employees_table
      WHERE status = 'active'
      ORDER BY name ASC
    `;

    const [employees] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(employees)) {
      return {
        success: true,
        data: employees.map(emp => ({
          id: emp.employee_id,
          name: emp.name,
          position: emp.position,
          departmentId: emp.department_id
        }))
      };
    }

    return {
      success: false,
      error: "No employees found"
    };
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch employees"
    };
  }
}

// Modify the existing handleForwardRecord function to include department and employee information
export async function handleForwardRecord(
  recordId: string,
  fileId: string,
  adminId: number,
  recipientType: string,
  recipientName: string,
  notes?: string,
  departmentId?: number,
  employeeId?: string
): Promise<{ success: boolean; error?: string; data?: ForwardedRecord }> {
  try {
    // Create a new forward record
    const forwardId = uuidv4();
    const forwardQuery = `
      INSERT INTO forwarded_records 
      (forward_id, record_id, file_id, forwarded_by, forwarded_to, recipient_type, notes, forward_date, status, department_id, employee_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Pending', ?, ?)
    `;
    
    await pool.query(forwardQuery, [
      forwardId,
      recordId,
      fileId,
      adminId,
      recipientName,
      recipientType,
      notes || null,
      departmentId || null,
      employeeId || null
    ]);
    
    // Update the record status to "Forwarded"
    const updateQuery = `
      UPDATE records_table 
      SET status = 'Forwarded' 
      WHERE id = ?
    `;
    
    await pool.query(updateQuery, [recordId]);
    
    // Fetch the newly created forward record
    const [forwardedRecords] = await pool.query(
      'SELECT * FROM forwarded_records WHERE forward_id = ?',
      [forwardId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(forwardedRecords) && forwardedRecords.length > 0) {
      const forwardedRecord = forwardedRecords[0];
      return {
        success: true,
        data: {
          forward_id: forwardedRecord.forward_id,
          record_id: forwardedRecord.record_id,
          file_id: forwardedRecord.file_id,
          forwarded_by: forwardedRecord.forwarded_by,
          forwarded_to: forwardedRecord.forwarded_to,
          recipient_type: forwardedRecord.recipient_type,
          notes: forwardedRecord.notes,
          forward_date: forwardedRecord.forward_date.toISOString(),
          status: forwardedRecord.status,
          department_id: forwardedRecord.department_id,
          employee_id: forwardedRecord.employee_id
        }
      };
    }
    
    return { success: true };
    
  } catch (error: any) {
    console.error("Error forwarding record:", error);
    return {
      success: false,
      error: error?.sqlMessage || error?.message || "An unexpected error occurred"
    };
  }
}

// Fetch forwarded records for a specific admin
export async function fetchForwardedRecords(adminId: number): Promise<{ success: boolean; data?: ForwardedRecord[]; error?: string }> {
  try {
    const query = `
      SELECT fr.*, r.subject, r.type, r.trackingNumber, r.date, r.from, r.to, f.name as fileName
      FROM forwarded_records fr
      JOIN records_table r ON fr.record_id = r.id
      JOIN files_table f ON fr.file_id = f.id
      WHERE fr.forwarded_by = ?
      ORDER BY fr.forward_date DESC
    `;
    
    const [records] = await pool.query(query, [adminId]) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(records)) {
      return {
        success: true,
        data: records.map(record => ({
          forward_id: record.forward_id,
          record_id: record.record_id,
          file_id: record.file_id,
          forwarded_by: record.forwarded_by,
          forwarded_to: record.forwarded_to,
          recipient_type: record.recipient_type,
          notes: record.notes,
          forward_date: record.forward_date.toISOString(),
          status: record.status,
          // Additional record data for display
          subject: record.subject,
          type: record.type,
          trackingNumber: record.trackingNumber,
          date: record.date.toISOString(),
          from: record.from,
          to: record.to,
          fileName: record.fileName
        }))
      };
    }
    
    return {
      success: false,
      error: "No forwarded records found"
    };
    
  } catch (error: any) {
    console.error("Error fetching forwarded records:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch forwarded records"
    };
  }
}

