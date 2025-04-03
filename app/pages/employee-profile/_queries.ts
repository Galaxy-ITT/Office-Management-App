"use server"

import pool from "@/app/database/connection";
import { RowDataPacket, FieldPacket } from "mysql2/promise";

export async function fetchEmployeePerformance(employeeId: string) {
  try {
    const [performance] = await pool.query(
      `SELECT 
        pr.review_id,
        pr.rating,
        pr.review_date,
        pr.subject AS review_period,
        pr.status,
        pr.reviewer_id,
        pr.content AS reviewer_comments,
        ra.admin_id,
        ra.name as reviewer_name
      FROM performance_reviews_table pr
      LEFT JOIN lists_of_admins ra ON pr.reviewer_id = ra.admin_id
      WHERE pr.employee_id = ? 
      ORDER BY pr.review_date DESC`,
      [employeeId]
    );
    return { success: true, data: performance };
  } catch (error) {
    console.error('Error fetching performance:', error);
    return { success: false, error: 'Failed to fetch performance data' };
  }
}

export async function fetchEmployeeLeaves(employeeId: string) {
  try {
    // Define a type for leave records
    type LeaveRecord = {
      leave_id: string;
      leave_type: string;
      start_date: Date | string;
      end_date: Date | string;
      reason: string;
      status: string;
      evidence_name: string | null;
      evidence_url: string | null;
      evidence_file: string | null;
      application_date: Date | string;
    };

    const [leaves] = await pool.query(
      `SELECT 
        leave_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        evidence_name, 
        evidence_url,
        evidence_file,
        application_date
      FROM leave_applications_table
      WHERE employee_id = ?
      ORDER BY application_date DESC`,
      [employeeId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    // Convert binary data to base64 strings for serialization
    const serializedLeaves = Array.isArray(leaves) ? 
      leaves.map(leave => {
        const serializedLeave = { ...leave };
        
        // Convert dates to ISO strings
        if (serializedLeave.start_date instanceof Date) {
          serializedLeave.start_date = serializedLeave.start_date.toISOString();
        }
        if (serializedLeave.end_date instanceof Date) {
          serializedLeave.end_date = serializedLeave.end_date.toISOString();
        }
        if (serializedLeave.application_date instanceof Date) {
          serializedLeave.application_date = serializedLeave.application_date.toISOString();
        }
        
        // Convert evidence_file from Uint8Array/Buffer to base64 string
        if (serializedLeave.evidence_file) {
          if (Buffer.isBuffer(serializedLeave.evidence_file)) {
            serializedLeave.evidence_file = Buffer.from(serializedLeave.evidence_file).toString('base64');
          } else if (serializedLeave.evidence_file instanceof Uint8Array) {
            serializedLeave.evidence_file = Buffer.from(serializedLeave.evidence_file).toString('base64');
          } else if (typeof serializedLeave.evidence_file === 'object') {
            // Handle potential serialized buffer format
            try {
              serializedLeave.evidence_file = Buffer.from(serializedLeave.evidence_file).toString('base64');
            } catch (err) {
              console.error('Error converting evidence_file to base64:', err);
              serializedLeave.evidence_file = null;
            }
          }
        }
        
        return serializedLeave;
      }) : [];
    
    return { success: true, data: serializedLeaves as LeaveRecord[] };
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return { success: false, error: 'Failed to fetch leave data' };
  }
}

export async function fetchEmployeeDetails(employeeId: string) {
  try {
    const [employees] = await pool.query(
      `SELECT 
        e.employee_id,
        e.name,
        e.email,
        e.phone,
        e.position,
        e.department_id,
        d.name as department_name,
        e.hire_date,
        e.status
      FROM employees_table e
      LEFT JOIN departments_table d ON e.department_id = d.department_id
      WHERE e.employee_id = ?`,
      [employeeId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    const details = employees[0] || null;
    return { success: true, data: details };
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return { success: false, error: 'Failed to fetch employee details' };
  }
}

export async function fetchEmployeeSkills(employeeId: string) {
  try {
    const [skills] = await pool.query(
      `SELECT * FROM employee_skills_table 
       WHERE employee_id = ?
       ORDER BY years_experience DESC`,
      [employeeId]
    );
    return { success: true, data: skills };
  } catch (error) {
    console.error('Error fetching skills:', error);
    return { success: false, error: 'Failed to fetch skills data' };
  }
}

export async function fetchEmployeeCourses(employeeId: string) {
  try {
    const [courses] = await pool.query(
      `SELECT * FROM professional_development_table 
       WHERE employee_id = ?
       ORDER BY start_date DESC`,
      [employeeId]
    );
    return { success: true, data: courses };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { success: false, error: 'Failed to fetch courses data' };
  }
}

export async function fetchEmployeeDocuments(employeeId: string) {
  try {
    const [documents] = await pool.query(
      `SELECT * FROM employee_documents_table 
       WHERE employee_id = ?
       ORDER BY upload_date DESC`,
      [employeeId]
    );
    return { success: true, data: documents };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { success: false, error: 'Failed to fetch documents data' };
  }
}

export async function addEmployeeSkill(employeeId: string, skillData: any) {
  try {
    await pool.query(
      `INSERT INTO employee_skills_table 
       (employee_id, skill_name, proficiency_level, years_experience)
       VALUES (?, ?, ?, ?)`,
      [
        employeeId,
        skillData.skill_name,
        skillData.proficiency_level,
        skillData.years_experience
      ]
    );
    return { success: true, message: 'Skill added successfully' };
  } catch (error) {
    console.error('Error adding skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

export async function addProfessionalDevelopment(employeeId: string, courseData: any) {
  try {
    await pool.query(
      `INSERT INTO professional_development_table 
       (employee_id, course_name, provider, certification_obtained, start_date, completion_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        courseData.course_name,
        courseData.provider || null,
        courseData.certification_obtained ? 1 : 0,
        courseData.start_date || null,
        courseData.completion_date || null,
        courseData.status,
        courseData.notes || null
      ]
    );
    return { success: true, message: 'Course added successfully' };
  } catch (error) {
    console.error('Error adding professional development course:', error);
    return { success: false, error: 'Failed to add course' };
  }
}

export async function addEmployeeDocument(employeeId: string, documentData: any) {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    await pool.query(
      `INSERT INTO employee_documents_table 
       (employee_id, document_name, document_type, file_url, upload_date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        documentData.document_name,
        documentData.document_type,
        documentData.file_url,
        currentDate,
        documentData.description || null
      ]
    );
    return { success: true, message: 'Document added successfully' };
  } catch (error) {
    console.error('Error adding document:', error);
    return { success: false, error: 'Failed to add document' };
  }
}

export async function submitLeaveApplication(leaveData: any) {
  try {
    const {
      leave_id,
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      evidence_url,
      evidence_name,
      evidence_file,
      status,
      application_date
    } = leaveData;

    // Format the application_date to be MySQL compatible
    let formattedDate = application_date;
    if (application_date) {
      // Convert ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      const date = new Date(application_date);
      formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    await pool.query(
      `INSERT INTO leave_applications_table (
        leave_id, 
        employee_id, 
        leave_type, 
        start_date, 
        end_date, 
        reason, 
        evidence_name, 
        evidence_url, 
        evidence_file,
        status, 
        application_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        leave_id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        reason,
        evidence_name,
        evidence_url,
        evidence_file,
        status || 'pending',
        formattedDate || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );

    // Return a simple serializable object instead of the MySQL result
    return { success: true, message: 'Leave application submitted successfully' };
  } catch (error: unknown) {
    console.error("Error submitting leave application:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

export async function fetchEmployeeTasks(employeeId: string) {
  try {
    const [tasks] = await pool.query(
      `SELECT 
        task_id, title, description, employee_id, assigned_by, 
        due_date, priority, status, completion_date, completion_note,
        employee_notes, created_at, updated_at
      FROM tasks_table 
      WHERE employee_id = ? 
      ORDER BY 
        CASE 
          WHEN status = 'overdue' THEN 1
          WHEN status = 'pending' THEN 2
          WHEN status = 'in progress' THEN 3
          WHEN status = 'completed' THEN 4
          ELSE 5
        END,
        due_date ASC`,
      [employeeId]
    );
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    return { success: false, error: 'Failed to fetch employee tasks' };
  }
}

export async function fetchForwardedRecords(employeeId: string) {
  try {
    // Define interface for database record type
    interface ForwardedRecordRow extends RowDataPacket {
      forward_id: string;
      record_id: string;
      file_id: string;
      forwarded_by: number;
      forwarded_to: string;
      notes: string | null;
      forward_date: Date;
      status: string;
      forwarder_name: string;
      uniqueNumber: string;
      type: string;
      date: Date;
      from: string;
      to: string;
      subject: string;
      content: string | null;
      reference: string | null;
      trackingNumber: string | null;
      attachmentUrl: string | null;
      attachmentName: string | null;
      fileNumber: string;
      fileName: string;
      fileType: string;
    }

    // Define interface for serialized record with string dates
    interface SerializedForwardedRecord {
      forward_id: string;
      record_id: string;
      file_id: string;
      forwarded_by: number;
      forwarded_to: string;
      notes: string | null;
      forward_date: string; // Changed to string for ISO format
      status: string;
      forwarder_name: string;
      uniqueNumber: string;
      type: string;
      date: string; // Changed to string for ISO format
      from: string;
      to: string;
      subject: string;
      content: string | null;
      reference: string | null;
      trackingNumber: string | null;
      attachmentUrl: string | null;
      attachmentName: string | null;
      fileNumber: string;
      fileName: string;
      fileType: string;
    }

    // Type assertion for the query result
    const [records] = await pool.query<ForwardedRecordRow[]>(`
      SELECT 
        fr.forward_id, fr.record_id, fr.file_id, fr.forwarded_by, fr.forwarded_to,
        fr.notes, fr.forward_date, fr.status,
        adm.name AS forwarder_name,
        r.uniqueNumber, r.type, r.date, r.from, r.to, r.subject, r.content, 
        r.reference, r.trackingNumber, r.attachmentUrl, r.attachmentName,
        f.fileNumber, f.name AS fileName, f.type AS fileType
      FROM forwarded_records fr
      JOIN records_table r ON fr.record_id = r.id
      JOIN files_table f ON fr.file_id = f.id
      JOIN lists_of_admins adm ON fr.forwarded_by = adm.admin_id
      WHERE fr.employee_id = ?
      ORDER BY fr.forward_date DESC
    `, [employeeId]) as [ForwardedRecordRow[], FieldPacket[]];

    // Convert dates to ISO strings for serialization
    const serializedRecords: SerializedForwardedRecord[] = records.map(record => {
      const serializedRecord = { ...record } as unknown as SerializedForwardedRecord;
      
      // Convert dates to ISO strings
      if (record.forward_date instanceof Date) {
        serializedRecord.forward_date = record.forward_date.toISOString();
      }
      if (record.date instanceof Date) {
        serializedRecord.date = record.date.toISOString();
      }
      
      return serializedRecord;
    });

    return { success: true, data: serializedRecords };
  } catch (error) {
    console.error('Error fetching forwarded records:', error);
    return { success: false, error: 'Failed to fetch forwarded records' };
  }
}

export async function reviewForwardedRecord(reviewData: {
  forward_id: string;
  employee_id: string;
  employee_name: string;
  review_action: string;
  review_note?: string;
}) {
  try {
    const { forward_id, employee_id, employee_name, review_action, review_note } = reviewData;
    
    if (!forward_id || !employee_id || !employee_name || !review_action) {
      return { success: false, error: "Missing required fields" };
    }

    // Get forwarded record details
    const [forwardedRecords] = await pool.query(
      "SELECT record_id FROM forwarded_records WHERE forward_id = ?",
      [forward_id]
    ) as [RowDataPacket[], FieldPacket[]];

    if (forwardedRecords.length === 0) {
      return { success: false, error: "Forwarded record not found" };
    }

    const record_id = forwardedRecords[0].record_id;
    const review_id = crypto.randomUUID(); // Using Node.js built-in UUID generator

    // Begin transaction
    await pool.query("START TRANSACTION");

    try {
      // Update forwarded_records status
      await pool.query(
        "UPDATE forwarded_records SET status = ? WHERE forward_id = ?",
        [review_action, forward_id]
      );

      // Insert into reviews_records
      await pool.query(
        `INSERT INTO reviews_records 
        (review_id, record_id, forward_id, reviewed_by, review_action, review_note, review_date)
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [review_id, record_id, forward_id, employee_name, review_action, review_note || null]
      );

      // Commit transaction
      await pool.query("COMMIT");

      return {
        success: true,
        message: `Record ${review_action.toLowerCase()} successfully`,
      };
    } catch (error) {
      // Rollback on error
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error('Error processing record review:', error);
    return { success: false, error: 'Failed to process record review' };
  }
}

export async function fetchFinishedTasks(employeeId: string) {
  try {
    const [tasks] = await pool.query(
      `SELECT 
        f.finished_id,
        f.task_id,
        f.title,
        f.description,
        f.employee_id,
        f.assigned_by,
        f.due_date,
        f.priority,
        f.completion_date,
        f.completion_note,
        f.performance_rating,
        f.admin_remarks,
        f.created_at,
        a.name as assigned_by_name
      FROM finished_tasks_table f
      LEFT JOIN lists_of_admins a ON f.assigned_by = a.admin_id
      WHERE f.employee_id = ? 
      ORDER BY f.completion_date DESC`,
      [employeeId]
    );
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching finished tasks:', error);
    return { success: false, error: 'Failed to fetch finished tasks' };
  }
}

export async function updateTaskStatus(data: {
  task_id: string;
  status: string;
  completion_note?: string;
  move_to_finished: boolean;
}) {
  try {
    const { task_id, status, completion_note, move_to_finished } = data;
    
    // Define task interface to match the database schema
    interface TaskRow extends RowDataPacket {
      task_id: string;
      title: string;
      description: string;
      employee_id: string;
      assigned_by: number;
      due_date: string;
      priority: string;
      status: string;
      employee_notes: string | null;
      created_at: string;
      updated_at: string;
    }
    
    // Start transaction
    await pool.query("START TRANSACTION");
    
    try {
      // Get task details first with proper typing
      const [taskRows] = await pool.query<TaskRow[]>(
        "SELECT * FROM tasks_table WHERE task_id = ?",
        [task_id]
      ) as [TaskRow[], FieldPacket[]];
      
      if (taskRows.length === 0) {
        await pool.query("ROLLBACK");
        return { success: false, error: 'Task not found' };
      }
      
      const task = taskRows[0];
      
      // Update the existing task
      if (move_to_finished && status.toLowerCase() === 'completed') {
        // Insert into finished_tasks_table
        const finished_id = crypto.randomUUID();
        await pool.query(
          `INSERT INTO finished_tasks_table (
            finished_id, task_id, title, description, 
            employee_id, assigned_by, due_date, 
            priority, completion_date, completion_note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
          [
            finished_id, task.task_id, task.title, task.description,
            task.employee_id, task.assigned_by, task.due_date,
            task.priority, completion_note || null
          ]
        );
        
        // Delete from tasks_table
        await pool.query("DELETE FROM tasks_table WHERE task_id = ?", [task_id]);
      } else {
        // Just update the task status
        await pool.query(
          `UPDATE tasks_table 
           SET status = ?, employee_notes = ?, updated_at = NOW() 
           WHERE task_id = ?`,
          [status, completion_note || null, task_id]
        );
      }
      
      // Commit transaction
      await pool.query("COMMIT");
      
      return { 
        success: true, 
        message: move_to_finished ? "Task completed and moved to finished tasks" : "Task status updated successfully" 
      };
    } catch (error) {
      // Rollback on error
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error: 'Failed to update task status' };
  }
}