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

// Define types for the review data
export interface ReviewSubmission {
  record_id: string;
  forward_id: string;
  reviewed_by: string;
  review_action: string;
  review_note: string;
  department?: string;
  department_person?: string;
}

// Define types for reviewed records
export interface ReviewedRecord {
  review_id: string;
  record_id: string;
  forward_id: string;
  reviewed_by: string;
  review_action: string;
  review_note: string;
  department?: string | null;
  department_person?: string | null;
  review_date: string;
  
  // Record details
  uniqueNumber: string;
  type: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  reference: string;
  
  // File details
  fileName: string;
  fileNumber: string;
}

// Define type for leave application data
export interface LeaveApplication {
  leave_id: string;
  employee_id: string;
  employee_name: string;
  employee_position: string;
  department_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  application_date: string;
  evidence_url?: string | null;
  evidence_name?: string | null;
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

export async function submitReview(reviewData: ReviewSubmission): Promise<{ 
  success: boolean; 
  message?: string; 
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Generate a unique ID for the review
    const review_id = crypto.randomUUID();
    
    // 1. Insert the review into reviews_records table
    const insertQuery = `
      INSERT INTO reviews_records (
        review_id, 
        record_id, 
        forward_id, 
        reviewed_by, 
        review_action, 
        review_note, 
        department, 
        department_person
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(insertQuery, [
      review_id,
      reviewData.record_id,
      reviewData.forward_id,
      reviewData.reviewed_by,
      reviewData.review_action,
      reviewData.review_note,
      reviewData.department || null,
      reviewData.department_person || null
    ]);
    
    // 2. Update records_table status to "Reviewed"
    await connection.execute(
      `UPDATE records_table SET status = 'Reviewed' WHERE id = ?`,
      [reviewData.record_id]
    );
    
    // 3. Update forwarded_records status to "Reviewed"
    await connection.execute(
      `UPDATE forwarded_records SET status = 'Reviewed' WHERE forward_id = ?`,
      [reviewData.forward_id]
    );
    
    await connection.commit();
    
    return {
      success: true,
      message: "Review submitted successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error submitting review:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to submit review"
    };
  } finally {
    connection.release();
  }
}

export async function fetchReviewedRecords(): Promise<{ 
  success: boolean; 
  data?: ReviewedRecord[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        rv.*,
        r.uniqueNumber,
        r.type,
        r.date,
        r.from,
        r.to,
        r.subject,
        r.content,
        r.reference,
        f.name as fileName,
        f.fileNumber
      FROM 
        reviews_records rv
      JOIN 
        records_table r ON rv.record_id = r.id
      JOIN 
        files_table f ON r.file_id = f.id
      ORDER BY 
        rv.review_date DESC
    `;
    
    const [records] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(records) && records.length > 0) {
      return {
        success: true,
        data: records.map(record => ({
          // Review data
          review_id: record.review_id,
          record_id: record.record_id,
          forward_id: record.forward_id,
          reviewed_by: record.reviewed_by,
          review_action: record.review_action,
          review_note: record.review_note,
          department: record.department,
          department_person: record.department_person,
          review_date: record.review_date instanceof Date 
            ? record.review_date.toISOString() 
            : record.review_date,
          
          // Record details
          uniqueNumber: record.uniqueNumber,
          type: record.type,
          date: record.date instanceof Date ? record.date.toISOString() : record.date,
          from: record.from,
          to: record.to,
          subject: record.subject,
          content: record.content,
          reference: record.reference,
          
          // File details
          fileName: record.fileName,
          fileNumber: record.fileNumber,
        }))
      };
    }
    
    return {
      success: true,
      data: []
    };
    
  } catch (error: any) {
    console.error("Error fetching reviewed records:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch reviewed records"
    };
  }
}

export async function fetchLeaveApplications(): Promise<{
  success: boolean;
  data?: LeaveApplication[];
  error?: string;
}> {
  try {
    const query = `
      SELECT 
        l.leave_id,
        l.employee_id,
        e.name as employee_name,
        e.position as employee_position,
        d.name as department_name,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.evidence_url,
        l.evidence_name,
        l.application_date
      FROM 
        leave_applications_table l
      JOIN 
        employees_table e ON l.employee_id = e.employee_id
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
      ORDER BY 
        l.application_date DESC
    `;
    
    const [records] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(records)) {
      return {
        success: true,
        data: records.map(record => ({
          leave_id: record.leave_id,
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          employee_position: record.employee_position,
          department_name: record.department_name,
          leave_type: record.leave_type,
          start_date: record.start_date instanceof Date ? 
            record.start_date.toISOString().split('T')[0] : record.start_date,
          end_date: record.end_date instanceof Date ? 
            record.end_date.toISOString().split('T')[0] : record.end_date,
          reason: record.reason,
          status: record.status,
          application_date: record.application_date instanceof Date ? 
            record.application_date.toISOString() : record.application_date,
          evidence_url: record.evidence_url,
          evidence_name: record.evidence_name
        }))
      };
    }
    
    return {
      success: true,
      data: []
    };
    
  } catch (error: any) {
    console.error("Error fetching leave applications:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch leave applications"
    };
  }
}

export async function updateLeaveStatus(
  leaveId: string, 
  status: 'approved' | 'rejected', 
  adminId: number,
  comment: string
): Promise<{ 
  success: boolean; 
  message?: string; 
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Update the leave application status
    await connection.execute(
      `UPDATE leave_applications_table 
       SET status = ?, approved_by = ?, updated_at = NOW() 
       WHERE leave_id = ?`,
      [status, adminId, leaveId]
    );
    
    // Add a comment to the leave application if provided
    if (comment) {
      // You could create a comments table for this, but for now just add it to a notes column
      // This assumes you've added a boss_comment column to the leave_applications_table
      await connection.execute(
        `UPDATE leave_applications_table 
         SET boss_comment = ? 
         WHERE leave_id = ?`,
        [comment, leaveId]
      );
    }
    
    await connection.commit();
    
    return {
      success: true,
      message: `Leave application ${status} successfully`
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error(`Error ${status} leave application:`, error);
    
    return {
      success: false,
      error: error?.message || `Failed to ${status} leave application`
    };
  } finally {
    connection.release();
  }
}
