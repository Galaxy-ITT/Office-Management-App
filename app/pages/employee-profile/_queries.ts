"use server"

import pool from "@/app/database/connection";

export async function fetchEmployeePerformance(employeeId: string) {
  try {
    const [performance] = await pool.query(
      `SELECT 
        pr.review_id,
        pr.rating,
        pr.review_date,
        pr.review_period,
        pr.status,
        pr.reviewer_id,
        pr.reviewer_comments,
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

export async function fetchEmployeeSkills(employeeId: string) {
  try {
    const [skills] = await pool.query(
      `SELECT * FROM employee_skills_table 
       WHERE employee_id = ?
       ORDER BY proficiency_level DESC, skill_name ASC`,
      [employeeId]
    );
    return { success: true, data: skills };
  } catch (error) {
    console.error('Error fetching employee skills:', error);
    return { success: false, error: 'Failed to fetch employee skills' };
  }
}

export async function fetchEmployeeCourses(employeeId: string) {
  try {
    const [courses] = await pool.query(
      `SELECT * FROM professional_development_table 
       WHERE employee_id = ?
       ORDER BY status ASC, completion_date DESC, start_date DESC`,
      [employeeId]
    );
    return { success: true, data: courses };
  } catch (error) {
    console.error('Error fetching professional development courses:', error);
    return { success: false, error: 'Failed to fetch professional development courses' };
  }
}

export async function addEmployeeSkill(employeeId: string, skillData: {
  skill_name: string;
  proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_experience?: number;
}) {
  try {
    await pool.query(
      `INSERT INTO employee_skills_table (employee_id, skill_name, proficiency_level, years_experience)
       VALUES (?, ?, ?, ?)`,
      [employeeId, skillData.skill_name, skillData.proficiency_level, skillData.years_experience || null]
    );
    return { success: true, message: 'Skill added successfully' };
  } catch (error) {
    console.error('Error adding employee skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

export async function addProfessionalDevelopment(employeeId: string, courseData: {
  course_name: string;
  provider?: string;
  certification_obtained?: boolean;
  start_date?: string;
  completion_date?: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  notes?: string;
}) {
  try {
    await pool.query(
      `INSERT INTO professional_development_table 
        (employee_id, course_name, provider, certification_obtained, start_date, completion_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId, 
        courseData.course_name,
        courseData.provider || null,
        courseData.certification_obtained || false,
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

export async function fetchEmployeeLeaves(employeeId: string) {
  try {
    const [leaves] = await pool.query(
      `SELECT * FROM leave_applications_table WHERE employee_id = ? ORDER BY application_date DESC`,
      [employeeId]
    );
    return { success: true, data: leaves };
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return { success: false, error: 'Failed to fetch leave applications' };
  }
}

export async function fetchEmployeeDetails(employeeId: string) {
  try {
    const [details]: [any[], any] = await pool.query(
      `SELECT e.*, d.name as department_name 
       FROM employees_table e
       LEFT JOIN departments_table d ON e.department_id = d.department_id
       WHERE e.employee_id = ?`,
      [employeeId]
    );
    return { success: true, data: details[0] };
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return { success: false, error: 'Failed to fetch employee details' };
  }
} 