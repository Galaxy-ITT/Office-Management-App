"use server"

import pool from "@/app/database/connection";
import { RowDataPacket, FieldPacket } from "mysql2/promise";
import { v4 as uuidv4 } from 'uuid';

// Define department interfaces
export interface Department {
  department_id: number;
  name: string;
  description: string | null;
  head_of_department: string | null;
  location: string | null;
  created_by: number;
  admin_name?: string;
  date_created: string;
}

export interface DepartmentInput {
  name: string;
  description?: string;
  head_of_department?: string;
  location?: string;
  created_by: number;
}

// Fetch all departments
export async function fetchDepartments(): Promise<{ 
  success: boolean; 
  data?: Department[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        d.*,
        a.name as admin_name
      FROM 
        departments_table d
      JOIN 
        lists_of_admins a ON d.created_by = a.admin_id
      ORDER BY 
        d.name ASC
    `;
    
    const [departments] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(departments)) {
      return {
        success: true,
        data: departments.map(dept => ({
          department_id: dept.department_id,
          name: dept.name,
          description: dept.description,
          head_of_department: dept.head_of_department,
          location: dept.location,
          created_by: dept.created_by,
          admin_name: dept.admin_name,
          date_created: dept.date_created instanceof Date 
            ? dept.date_created.toISOString() 
            : dept.date_created
        }))
      };
    }
    
    return {
      success: true,
      data: []
    };
    
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch departments"
    };
  }
}

// Add new department
export async function addDepartment(departmentData: DepartmentInput): Promise<{ 
  success: boolean; 
  message?: string;
  department_id?: number;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const insertQuery = `
      INSERT INTO departments_table (
        name, 
        description, 
        head_of_department, 
        location, 
        created_by
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(insertQuery, [
      departmentData.name,
      departmentData.description || null,
      departmentData.head_of_department || null,
      departmentData.location || null,
      departmentData.created_by
    ]);
    
    await connection.commit();
    
    return {
      success: true,
      message: "Department added successfully",
      department_id: (result as any).insertId
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding department:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to add department"
    };
  } finally {
    connection.release();
  }
}

// Update department
export async function updateDepartment(departmentId: number, departmentData: Partial<DepartmentInput>): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Build the SET clause dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (departmentData.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(departmentData.name);
    }
    
    if (departmentData.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(departmentData.description || null);
    }
    
    if (departmentData.head_of_department !== undefined) {
      updateFields.push("head_of_department = ?");
      updateValues.push(departmentData.head_of_department || null);
    }
    
    if (departmentData.location !== undefined) {
      updateFields.push("location = ?");
      updateValues.push(departmentData.location || null);
    }
    
    // If nothing to update, return early
    if (updateFields.length === 0) {
      return {
        success: false,
        error: "No fields to update"
      };
    }
    
    const updateQuery = `
      UPDATE departments_table 
      SET ${updateFields.join(", ")}
      WHERE department_id = ?
    `;
    
    updateValues.push(departmentId);
    
    await connection.execute(updateQuery, updateValues);
    await connection.commit();
    
    return {
      success: true,
      message: "Department updated successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error updating department:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to update department"
    };
  } finally {
    connection.release();
  }
}

// Delete department
export async function deleteDepartment(departmentId: number): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const deleteQuery = `
      DELETE FROM departments_table
      WHERE department_id = ?
    `;
    
    await connection.execute(deleteQuery, [departmentId]);
    await connection.commit();
    
    return {
      success: true,
      message: "Department deleted successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error deleting department:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to delete department"
    };
  } finally {
    connection.release();
  }
}

// Employee interfaces
export interface Employee {
  employee_id: string;
  name: string;
  position: string;
  department_id: number | null;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeInput {
  name: string;
  position: string;
  department_id: number | null;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  created_by: number;
}

// Fetch all employees
export async function fetchEmployees(): Promise<{ 
  success: boolean; 
  data?: Employee[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        e.*,
        d.name as department
      FROM 
        employees_table e
      LEFT JOIN 
        departments_table d ON e.department_id = d.department_id
      ORDER BY 
        e.name ASC
    `;
    
    const [employees] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(employees)) {
      return {
        success: true,
        data: employees.map(emp => ({
          employee_id: emp.employee_id,
          name: emp.name,
          position: emp.position,
          department_id: emp.department_id,
          department: emp.department || 'Unassigned',
          email: emp.email,
          phone: emp.phone,
          status: emp.status,
          created_by: emp.created_by,
          created_at: emp.created_at instanceof Date 
            ? emp.created_at.toISOString() 
            : emp.created_at,
          updated_at: emp.updated_at instanceof Date 
            ? emp.updated_at.toISOString() 
            : emp.updated_at
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

// Add new employee
export async function addEmployee(employeeData: EmployeeInput): Promise<{ 
  success: boolean; 
  message?: string;
  employee_id?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const employeeId = uuidv4();
    
    const insertQuery = `
      INSERT INTO employees_table (
        employee_id,
        name, 
        position, 
        department_id, 
        email, 
        phone,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(insertQuery, [
      employeeId,
      employeeData.name,
      employeeData.position,
      employeeData.department_id,
      employeeData.email,
      employeeData.phone,
      employeeData.status,
      employeeData.created_by
    ]);
    
    await connection.commit();
    
    return {
      success: true,
      message: "Employee added successfully",
      employee_id: employeeId
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding employee:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to add employee"
    };
  } finally {
    connection.release();
  }
}

// Update employee
export async function updateEmployee(employeeId: string, employeeData: Partial<EmployeeInput>): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Build the SET clause dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (employeeData.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(employeeData.name);
    }
    
    if (employeeData.position !== undefined) {
      updateFields.push("position = ?");
      updateValues.push(employeeData.position);
    }
    
    if (employeeData.department_id !== undefined) {
      updateFields.push("department_id = ?");
      updateValues.push(employeeData.department_id);
    }
    
    if (employeeData.email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(employeeData.email);
    }
    
    if (employeeData.phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(employeeData.phone);
    }
    
    if (employeeData.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(employeeData.status);
    }
    
    // If nothing to update, return early
    if (updateFields.length === 0) {
      return {
        success: false,
        error: "No fields to update"
      };
    }
    
    const updateQuery = `
      UPDATE employees_table 
      SET ${updateFields.join(", ")}
      WHERE employee_id = ?
    `;
    
    updateValues.push(employeeId);
    
    await connection.execute(updateQuery, updateValues);
    await connection.commit();
    
    return {
      success: true,
      message: "Employee updated successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error updating employee:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to update employee"
    };
  } finally {
    connection.release();
  }
}

// Delete employee
export async function deleteEmployee(employeeId: string): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const deleteQuery = `
      DELETE FROM employees_table
      WHERE employee_id = ?
    `;
    
    await connection.execute(deleteQuery, [employeeId]);
    await connection.commit();
    
    return {
      success: true,
      message: "Employee deleted successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error deleting employee:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to delete employee"
    };
  } finally {
    connection.release();
  }
}

// Fetch dashboard statistics
export async function fetchDashboardStats(): Promise<{ 
  success: boolean; 
  data?: {
    totalEmployees: number;
    openPositions: number;
    upcomingReviews: number;
    pendingLeaves: number;
  }; 
  error?: string 
}> {
  try {
    // Get total employees count
    const [employeeCountResult] = await pool.query(
      "SELECT COUNT(*) as total FROM employees_table WHERE status = 'active'"
    ) as [RowDataPacket[], FieldPacket[]];
    
    const totalEmployees = employeeCountResult[0]?.total || 0;
    
    // For now, return hardcoded values for other metrics
    // These would be replaced with actual queries in a complete implementation
    
    return {
      success: true,
      data: {
        totalEmployees,
        openPositions: 0,        // Placeholder
        upcomingReviews: 0,      // Placeholder
        pendingLeaves: 0          // Placeholder
      }
    };
    
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch dashboard statistics"
    };
  }
} 