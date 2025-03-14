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