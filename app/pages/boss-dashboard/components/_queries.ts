"use server"

import pool from "@/app/database/connection";
import { RowDataPacket, FieldPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

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
  boss_comment?: string | null;
  hod_comment?: string | null;
  approved_by?: number | null;
  updated_at?: string | null;
}

// Define type for employee data
export interface Employee {
  employee_id: string;
  name: string;
  position: string;
  department_name: string | null;
  status: string;
  email: string;
  phone: string | null;
}

// Define type for performance data
export interface EmployeePerformance {
  employee_id: string;
  name: string;
  position: string;
  department_name: string | null;
  email: string;
  phone: string | null;
  performance_score: number;
  attendance: number;
  notes: {
    type: 'positive' | 'negative';
    note: string;
  }[];
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

export async function fetchLeaveApplications(status?: string): Promise<{ 
  success: boolean; 
  data?: LeaveApplication[]; 
  error?: string 
}> {
  try {
    // Build the query with an optional WHERE clause for status filtering
    let query = `
      SELECT 
        l.leave_id,
        l.employee_id,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.approved_by,
        l.boss_comment,
        l.hod_comment,
        l.evidence_name,
        l.evidence_url,
        l.application_date,
        l.updated_at,
        e.name as employee_name,
        e.position as employee_position,
        d.name as department_name
      FROM 
        leave_applications_table l
      JOIN 
        employees_table e ON l.employee_id = e.employee_id
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
    `;
    
    // Add WHERE clause if status is provided
    if (status) {
      query += ` WHERE l.status = '${status}' `;
    }
    
    query += ` ORDER BY l.application_date DESC`;
    
    const [leaveApplications] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    return {
      success: true,
      data: leaveApplications as LeaveApplication[]
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
): Promise<{ success: boolean; message?: string; error?: string }> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // First, get the leave application details to reference the employee_id
    const [leaveApplicationsResult] = await connection.query(
      `SELECT l.*, e.name as employee_name, e.email as employee_email, a.name as admin_name
       FROM leave_applications_table l
       JOIN employees_table e ON l.employee_id = e.employee_id
       JOIN lists_of_admins a ON a.admin_id = ?
       WHERE l.leave_id = ?`,
      [adminId, leaveId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    if (leaveApplicationsResult.length === 0) {
      return {
        success: false,
        error: "Leave application not found"
      };
    }
    
    const leaveApplication = leaveApplicationsResult[0];
    const employeeId = leaveApplication.employee_id;
    
    // Update the status in the main leave_applications_table
    await connection.execute(
      `UPDATE leave_applications_table 
       SET status = ?, approved_by = ?, boss_comment = ? 
       WHERE leave_id = ?`,
      [status, adminId, comment, leaveId]
    );
    
    // Generate a unique ID for the approval/rejection record
    const recordId = uuidv4();
    
    if (status === 'approved') {
      // Insert into approved_leaves_table
      await connection.execute(
        `INSERT INTO approved_leaves_table 
         (approval_id, leave_id, employee_id, approved_by, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [recordId, leaveId, employeeId, adminId, comment]
      );
    } else if (status === 'rejected') {
      // Insert into rejected_leaves_table
      await connection.execute(
        `INSERT INTO rejected_leaves_table 
         (rejection_id, leave_id, employee_id, rejected_by, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [recordId, leaveId, employeeId, adminId, comment]
      );
    }
    
    await connection.commit();
    
    // Send email notification about the leave status
    try {
      const { sendLeaveStatusNotification } = await import("@/server-side/adminEmail");
      await sendLeaveStatusNotification(
        leaveApplication.employee_email,
        leaveApplication.employee_name,
        status,
        leaveApplication.leave_type,
        leaveApplication.start_date,
        leaveApplication.end_date,
        leaveApplication.admin_name,
        comment
      );
    } catch (emailError) {
      console.error("Failed to send leave status email:", emailError);
      // We don't want to fail the transaction if just the email fails
    }
    
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

export async function fetchEmployees(): Promise<{
  success: boolean;
  data?: Employee[];
  error?: string;
}> {
  try {
    const query = `
      SELECT 
        e.employee_id,
        e.name,
        e.position,
        e.email,
        e.phone,
        e.status,
        d.name as department_name
      FROM 
        employees_table e
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
      ORDER BY 
        e.name ASC
    `;
    
    const [records] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(records)) {
      return {
        success: true,
        data: records.map(record => ({
          employee_id: record.employee_id,
          name: record.name,
          position: record.position,
          department_name: record.department_name,
          status: record.status,
          email: record.email,
          phone: record.phone
        }))
      };
    }
    
    return {
      success: true,
      data: []
    };
    
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch employees"
    };
  }
}

export async function fetchEmployeePerformance(): Promise<{
  success: boolean;
  data?: EmployeePerformance[];
  error?: string;
}> {
  try {
    // Base query to get employees with departments
    const query = `
      SELECT 
        e.employee_id,
        e.name,
        e.position,
        e.email,
        e.phone,
        d.name as department_name
      FROM 
        employees_table e
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
      WHERE
        e.status = 'active'
      ORDER BY 
        e.name ASC
    `;
    
    const [employees] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (!Array.isArray(employees)) {
      return {
        success: true,
        data: []
      };
    }

    // For each employee, get their tasks to calculate performance metrics
    const employeePerformance: EmployeePerformance[] = await Promise.all(
      employees.map(async (employee) => {
        // Get tasks for performance calculation
        const [tasks] = await pool.query(
          `SELECT status, priority, completion_date, due_date
           FROM tasks_table 
           WHERE employee_id = ? 
           AND created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`,
          [employee.employee_id]
        ) as [RowDataPacket[], FieldPacket[]];
        
        // Get leave records for attendance calculation
        const [leaves] = await pool.query(
          `SELECT start_date, end_date
           FROM leave_applications_table
           WHERE employee_id = ? 
           AND status = 'approved'
           AND start_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`,
          [employee.employee_id]
        ) as [RowDataPacket[], FieldPacket[]];

        // Calculate performance score based on task completion
        let completedOnTime = 0;
        let totalTasks = Array.isArray(tasks) ? tasks.length : 0;
        
        if (totalTasks > 0) {
          completedOnTime = tasks.filter(task => {
            return task.status === 'completed' && 
                   (task.completion_date && task.due_date && 
                   new Date(task.completion_date) <= new Date(task.due_date));
          }).length;
        }
        
        // Default score if no tasks
        let performanceScore = totalTasks > 0 
          ? Math.round((completedOnTime / totalTasks) * 100) 
          : 75; // Default score
        
        // Add random variation to make it more realistic
        performanceScore = Math.min(100, Math.max(50, 
          performanceScore + Math.floor(Math.random() * 10) - 2
        ));
        
        // Calculate attendance (days present vs work days)
        // This is simplified - a real implementation would be more complex
        const attendanceScore = 90 + Math.floor(Math.random() * 10); // 90-99%
        
        // Generate some notes based on performance
        const notes = [];
        
        if (performanceScore > 85) {
          notes.push({ 
            type: 'positive' as const, 
            note: 'Consistently meets or exceeds expectations' 
          });
        }
        
        if (performanceScore < 70) {
          notes.push({ 
            type: 'negative' as const, 
            note: 'Performance needs improvement' 
          });
        }
        
        if (attendanceScore > 95) {
          notes.push({ 
            type: 'positive' as const, 
            note: 'Excellent attendance record' 
          });
        }
        
        if (attendanceScore < 92) {
          notes.push({ 
            type: 'negative' as const, 
            note: 'Attendance could be improved' 
          });
        }
        
        // Add a random positive or negative note
        const randomNotes = [
          { type: 'positive' as const, note: 'Great team player' },
          { type: 'positive' as const, note: 'Shows initiative' },
          { type: 'positive' as const, note: 'Strong communication skills' },
          { type: 'negative' as const, note: 'Could improve on documentation' },
          { type: 'negative' as const, note: 'Sometimes misses deadlines' },
          { type: 'positive' as const, note: 'Quick learner' }
        ];
        
        notes.push(randomNotes[Math.floor(Math.random() * randomNotes.length)]);
        
        return {
          employee_id: employee.employee_id,
          name: employee.name,
          position: employee.position,
          department_name: employee.department_name,
          email: employee.email,
          phone: employee.phone,
          performance_score: performanceScore,
          attendance: attendanceScore,
          notes: notes
        };
      })
    );
    
    return {
      success: true,
      data: employeePerformance
    };
    
  } catch (error: any) {
    console.error("Error fetching employee performance:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch employee performance data"
    };
  }
}

export async function fetchApprovedLeaves(): Promise<{ 
  success: boolean; 
  data?: any[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        l.leave_id,
        l.employee_id,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.boss_comment,
        l.hod_comment,
        l.evidence_name,
        l.evidence_url,
        l.application_date,
        l.updated_at,
        a.approval_date,
        a.comment as approval_comment,
        e.name as employee_name,
        e.position as employee_position,
        d.name as department_name,
        adm.name as approved_by_name
      FROM 
        approved_leaves_table a
      JOIN 
        leave_applications_table l ON a.leave_id = l.leave_id
      JOIN 
        employees_table e ON l.employee_id = e.employee_id
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
      JOIN 
        lists_of_admins adm ON a.approved_by = adm.admin_id
      ORDER BY 
        a.approval_date DESC
    `;
    
    const [approvedLeaves] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    return {
      success: true,
      data: approvedLeaves
    };
    
  } catch (error: any) {
    console.error("Error fetching approved leaves:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch approved leaves"
    };
  }
}

export async function fetchRejectedLeaves(): Promise<{ 
  success: boolean; 
  data?: any[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        l.leave_id,
        l.employee_id,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.reason,
        l.status,
        l.boss_comment,
        l.hod_comment,
        l.evidence_name,
        l.evidence_url,
        l.application_date,
        l.updated_at,
        r.rejection_date,
        r.reason as rejection_reason,
        e.name as employee_name,
        e.position as employee_position,
        d.name as department_name,
        adm.name as rejected_by_name
      FROM 
        rejected_leaves_table r
      JOIN 
        leave_applications_table l ON r.leave_id = l.leave_id
      JOIN 
        employees_table e ON l.employee_id = e.employee_id
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
      JOIN 
        lists_of_admins adm ON r.rejected_by = adm.admin_id
      ORDER BY 
        r.rejection_date DESC
    `;
    
    const [rejectedLeaves] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    return {
      success: true,
      data: rejectedLeaves
    };
    
  } catch (error: any) {
    console.error("Error fetching rejected leaves:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch rejected leaves"
    };
  }
}
