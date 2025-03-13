"use server"

import pool from "@/app/database/connection";
import { RowDataPacket, FieldPacket } from "mysql2/promise";

// Define types for the record data
export interface ForwardedBossRecord {
  id: string;
  file_id: string;
  uniqueNumber: string;
  type: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  status: string;
  reference: string;
  trackingNumber: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  attachmentType?: string | null;
  
  // Forwarded record data
  forward_id: string;
  forwarded_by: number;
  forwarded_to: string;
  recipient_type: string;
  notes?: string | null;
  forward_date: string;
  forward_status: string;
  
  // Joined data
  fileName?: string;
  fileNumber?: string;
  adminName?: string;
}

export async function fetchBossRecords(): Promise<{ 
  success: boolean; 
  data?: ForwardedBossRecord[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        r.*,
        fr.forward_id,
        fr.forwarded_by,
        fr.forwarded_to,
        fr.recipient_type,
        fr.notes,
        fr.forward_date,
        fr.status as forward_status,
        f.name as fileName,
        f.fileNumber,
        a.name as adminName
      FROM 
        records_table r
      JOIN 
        forwarded_records fr ON r.id = fr.record_id
      JOIN 
        files_table f ON r.file_id = f.id
      JOIN
        lists_of_admins a ON fr.forwarded_by = a.admin_id
      WHERE 
        r.status = 'Forwarded'
        AND fr.forwarded_to = 'boss'
      ORDER BY 
        fr.forward_date DESC
    `;
    
    const [records] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(records) && records.length > 0) {
      return {
        success: true,
        data: records.map(record => ({
          // Record data
          id: record.id,
          file_id: record.file_id,
          uniqueNumber: record.uniqueNumber,
          type: record.type,
          date: record.date instanceof Date ? record.date.toISOString() : record.date,
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
          attachmentType: record.attachmentType,
          
          // Forwarded record data
          forward_id: record.forward_id,
          forwarded_by: record.forwarded_by,
          forwarded_to: record.forwarded_to,
          recipient_type: record.recipient_type,
          notes: record.notes,
          forward_date: record.forward_date instanceof Date 
            ? record.forward_date.toISOString() 
            : record.forward_date,
          forward_status: record.forward_status,
          
          // Joined data
          fileName: record.fileName,
          fileNumber: record.fileNumber,
          adminName: record.adminName
        }))
      };
    }
    
    return {
      success: true,
      data: []
    };
    
  } catch (error: any) {
    console.error("Error fetching boss records:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch records"
    };
  }
}
