"use server"

import pool from '@/app/database/connection';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, FieldPacket } from "mysql2/promise";

// Types
export interface Employee {
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department_id: number;
  department_name: string;
  status: string;
}

export interface Proposal {
  proposal_id: string;
  employee_id: string;
  employee_name: string;
  subject: string;
  content: string;
  submission_date: string;
  status: string;
}

export interface PerformanceReview {
  review_id: string;
  employee_id: string;
  employee_name: string;
  reviewer_id: number;
  reviewer_name: string;
  subject: string;
  content: string;
  rating: number;
  review_date: string;
  status: string;
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  employee_id: string;
  employee_name: string;
  assigned_by: number;
  assigner_name: string;
  due_date: string;
  priority: string;
  status: string;
  created_at: string;
}

// Fetch dashboard statistics for HOD
export async function fetchDashboardStats(hodId: number) {
  try {
    // Get department managed by HOD
    const [hodDept] = await pool.query<RowDataPacket[]>(
      `SELECT department_id FROM departments_table WHERE head_of_department_id = ?`,
      [hodId]
    );
    
    if (!hodDept || !hodDept.length) {
      return { success: false, error: 'No department found for this HOD' };
    }
    
    const departmentId = hodDept[0].department_id;
    
    // Get total employees in department
    const [employees] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM employees_table WHERE department_id = ?`,
      [departmentId]
    );
    
    // Get pending proposals
    const [proposals] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM proposals_table 
       WHERE department_id = ? AND status = 'pending'`,
      [departmentId]
    );
    
    // Get upcoming reviews
    const [reviews] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM performance_reviews_table 
       WHERE department_id = ? AND status = 'pending'`,
      [departmentId]
    );
    
    // Get assigned tasks
    const [tasks] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM tasks_table 
       WHERE department_id = ? AND status != 'completed'`,
      [departmentId]
    );
    
    return { 
      success: true, 
      data: {
        totalEmployees: employees[0].total,
        pendingProposals: proposals[0].total,
        upcomingReviews: reviews[0].total,
        activeTasks: tasks[0].total
      } 
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard statistics' };
  }
}

// Fetch employees in department
export async function fetchDepartmentEmployees(hodId: number) {
  try {
    // Get department managed by HOD
    const [hodDept] = await pool.query<RowDataPacket[]>(
      `SELECT department_id FROM departments_table WHERE head_of_department_id = ?`,
      [hodId]
    );
    
    if (!hodDept || !hodDept.length) {
      return { success: false, error: 'No department found for this HOD' };
    }
    
    const departmentId = hodDept[0].department_id;
    
    // Get employees in department
    const [employees] = await pool.query(
      `SELECT e.employee_id, e.name, e.email, e.phone, e.position, 
              e.department_id, d.name as department_name, e.status
       FROM employees_table e
       JOIN departments_table d ON e.department_id = d.department_id
       WHERE e.department_id = ?`,
      [departmentId]
    );
    
    return { success: true, data: employees };
  } catch (error) {
    console.error('Error fetching department employees:', error);
    return { success: false, error: 'Failed to fetch department employees' };
  }
}

// Fetch employee proposals
export async function fetchProposals(hodId: number) {
  try {
    // Get department managed by HOD
    const [hodDept] = await pool.query<RowDataPacket[]>(
      `SELECT department_id FROM departments_table WHERE head_of_department_id = ?`,
      [hodId]
    );
    
    if (!hodDept || !hodDept.length) {
      return { success: false, error: 'No department found for this HOD' };
    }
    
    const departmentId = hodDept[0].department_id;
    
    // Get proposals from employees in department
    const [proposals] = await pool.query<RowDataPacket[]>(
      `SELECT p.proposal_id, p.employee_id, e.name as employee_name, 
              p.subject, p.content, p.submission_date, p.status
       FROM proposals_table p
       JOIN employees_table e ON p.employee_id = e.employee_id
       WHERE e.department_id = ?
       ORDER BY p.submission_date DESC`,
      [departmentId]
    );
    
    return { success: true, data: proposals };
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return { success: false, error: 'Failed to fetch proposals' };
  }
}

// Review a proposal
export async function reviewProposal(proposalId: string, reviewData: any) {
  try {
    const { status, review_note, reviewer_id } = reviewData;
    
    // Update proposal status
    await pool.query(
      `UPDATE proposals_table 
       SET status = ?, 
           reviewed_by = ?, 
           review_date = CURRENT_TIMESTAMP, 
           review_note = ?
       WHERE proposal_id = ?`,
      [status, reviewer_id, review_note, proposalId]
    );
    
    return { success: true, message: 'Proposal review submitted successfully' };
  } catch (error) {
    console.error('Error reviewing proposal:', error);
    return { success: false, error: 'Failed to submit review' };
  }
}

// Fetch performance reviews
export async function fetchPerformanceReviews(hodId: number) {
  try {
    // Get department managed by HOD
    const [hodDept] = await pool.query<RowDataPacket[]>(
      `SELECT department_id FROM departments_table WHERE head_of_department_id = ?`,
      [hodId]
    );
    
    if (!hodDept || !hodDept.length) {
      return { success: false, error: 'No department found for this HOD' };
    }
    
    const departmentId = hodDept[0].department_id;
    
    // Get performance reviews for employees in department
    const [reviews] = await pool.query<RowDataPacket[]>(
      `SELECT pr.review_id, pr.employee_id, e.name as employee_name,
              pr.reviewer_id, a.name as reviewer_name, pr.subject,
              pr.content, pr.rating, pr.review_date, pr.status
       FROM performance_reviews_table pr
       JOIN employees_table e ON pr.employee_id = e.employee_id
       JOIN lists_of_admins a ON pr.reviewer_id = a.admin_id
       WHERE e.department_id = ?
       ORDER BY pr.review_date DESC`,
      [departmentId]
    );
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    return { success: false, error: 'Failed to fetch performance reviews' };
  }
}

// Add new performance review
export async function addReview(reviewData: any) {
  try {
    const reviewId = uuidv4();
    const { employee_id, reviewer_id, subject, content, rating, status } = reviewData;
    
    await pool.query(
      `INSERT INTO performance_reviews_table 
       (review_id, employee_id, reviewer_id, subject, content, 
        rating, status, review_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [reviewId, employee_id, reviewer_id, subject, content, rating, status]
    );
    
    return { success: true, message: 'Performance review added successfully' };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: 'Failed to add performance review' };
  }
}

// Update performance review
export async function updateReview(reviewId: string, reviewData: any) {
  try {
    const { subject, content, rating, status } = reviewData;
    
    await pool.query(
      `UPDATE performance_reviews_table 
       SET subject = ?, 
           content = ?, 
           rating = ?, 
           status = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE review_id = ?`,
      [subject, content, rating, status, reviewId]
    );
    
    return { success: true, message: 'Performance review updated successfully' };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error: 'Failed to update performance review' };
  }
}

// Fetch assigned tasks
export async function fetchAssignedTasks(hodId: number) {
  try {
    // Get department managed by HOD
    const [hodDept] = await pool.query<RowDataPacket[]>(
      `SELECT department_id FROM departments_table WHERE head_of_department_id = ?`,
      [hodId]
    );
    
    if (!hodDept || !hodDept.length) {
      return { success: false, error: 'No department found for this HOD' };
    }
    
    const departmentId = hodDept[0].department_id;
    
    // Get tasks for employees in department
    const [tasks] = await pool.query<RowDataPacket[]>(
      `SELECT t.task_id, t.title, t.description, 
              t.employee_id, e.name as employee_name,
              t.assigned_by, a.name as assigner_name,
              t.due_date, t.priority, t.status, t.created_at
       FROM tasks_table t
       JOIN employees_table e ON t.employee_id = e.employee_id
       JOIN lists_of_admins a ON t.assigned_by = a.admin_id
       WHERE e.department_id = ?
       ORDER BY t.created_at DESC`,
      [departmentId]
    );
    
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: 'Failed to fetch assigned tasks' };
  }
}

// Add new task
export async function addTask(taskData: any) {
  try {
    const taskId = uuidv4();
    const { title, description, employee_id, assigned_by, due_date, priority, status } = taskData;
    
    await pool.query(
      `INSERT INTO tasks_table 
       (task_id, title, description, employee_id, assigned_by, 
        due_date, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [taskId, title, description, employee_id, assigned_by, due_date, priority, status || 'pending']
    );
    
    return { success: true, message: 'Task assigned successfully' };
  } catch (error) {
    console.error('Error adding task:', error);
    return { success: false, error: 'Failed to add task' };
  }
}

// Update task
export async function updateTask(taskId: string, taskData: any) {
  try {
    const { title, description, due_date, priority, status } = taskData;
    
    await pool.query(
      `UPDATE tasks_table 
       SET title = ?, 
           description = ?, 
           due_date = ?, 
           priority = ?, 
           status = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE task_id = ?`,
      [title, description, due_date, priority, status, taskId]
    );
    
    return { success: true, message: 'Task updated successfully' };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}
