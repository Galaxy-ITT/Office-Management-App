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
      `SELECT * FROM tasks_table 
       WHERE employee_id = ?
       ORDER BY due_date ASC`,
      [employeeId]
    );
    
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}