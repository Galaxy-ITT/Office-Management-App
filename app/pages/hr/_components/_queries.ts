"use server"

import pool from "@/app/database/connection";
import { RowDataPacket, FieldPacket } from "mysql2/promise";
import { v4 as uuidv4 } from 'uuid';
import { sendRoleAssignmentNotification } from "@/server-side/adminEmail";

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

// Role interfaces
export interface Role {
  role_id: string;
  role_name: string;
  employee_id: string;
  employee_name: string;
  department_id: number | null;
  department_name: string | null;
  description: string | null;
  assigned_by: number;
  admin_name: string;
  date_assigned: string;
  status: 'active' | 'inactive';
}

export interface RoleInput {
  role_name: string;
  employee_id: string;
  department_id: number | null;
  description?: string;
  assigned_by: number;
  status: 'active' | 'inactive';
}

// Fetch all roles
export async function fetchRoles(): Promise<{ 
  success: boolean; 
  data?: Role[]; 
  error?: string 
}> {
  try {
    const query = `
      SELECT 
        r.*,
        e.name as employee_name,
        d.name as department_name,
        a.name as admin_name
      FROM 
        roles_table r
      JOIN 
        employees_table e ON r.employee_id = e.employee_id
      LEFT JOIN 
        departments_table d ON r.department_id = d.department_id
      JOIN 
        lists_of_admins a ON r.assigned_by = a.admin_id
      ORDER BY 
        r.role_name ASC, e.name ASC
    `;
    
    const [roles] = await pool.query(query) as [RowDataPacket[], FieldPacket[]];
    
    if (Array.isArray(roles)) {
      return {
        success: true,
        data: roles.map(role => ({
          role_id: role.role_id,
          role_name: role.role_name,
          employee_id: role.employee_id,
          employee_name: role.employee_name,
          department_id: role.department_id,
          department_name: role.department_name,
          description: role.description,
          assigned_by: role.assigned_by,
          admin_name: role.admin_name,
          date_assigned: role.date_assigned instanceof Date 
            ? role.date_assigned.toISOString() 
            : role.date_assigned,
          status: role.status
        }))
      };
    }
    
    return {
      success: true,
      data: []
    };
    
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch roles"
    };
  }
}

// Add new role
export async function addRole(roleData: RoleInput): Promise<{ 
  success: boolean; 
  message?: string;
  role_id?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const roleId = uuidv4();
    
    const insertQuery = `
      INSERT INTO roles_table (
        role_id,
        role_name, 
        employee_id, 
        department_id, 
        description,
        assigned_by,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(insertQuery, [
      roleId,
      roleData.role_name,
      roleData.employee_id,
      roleData.department_id,
      roleData.description || null,
      roleData.assigned_by,
      roleData.status
    ]);
    
    // Get employee details for email notification
    const employeeQuery = `
      SELECT e.name, e.email, d.name as department_name
      FROM employees_table e
      LEFT JOIN departments_table d ON d.department_id = ?
      WHERE e.employee_id = ?
    `;
    
    const [employeeResults] = await connection.query(employeeQuery, [
      roleData.department_id, 
      roleData.employee_id
    ]) as [RowDataPacket[], FieldPacket[]];
    
    // Generate admin credentials and create admin account
    let username = '';
    let password = '';
    let adminId = null;
    
    if (employeeResults.length > 0) {
      const employee = employeeResults[0];
      
      // Generate a username based on employee name (first name + first letter of last name)
      const nameParts = employee.name.split(' ');
      const firstName = nameParts[0].toLowerCase();
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
      username = lastName ? `${firstName}.${lastName.charAt(0)}` : firstName;
      
      // Check if username already exists and append a number if needed
      const [existingUsers] = await connection.query(
        "SELECT username FROM lists_of_admins WHERE username LIKE ?", 
        [`${username}%`]
      ) as [RowDataPacket[], FieldPacket[]];
      
      if (existingUsers.length > 0) {
        username = `${username}${existingUsers.length + 1}`;
      }
      
      // Generate a random password (8 characters)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      password = Array(8).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      
      // Hash password in a real application, but for this example we'll use plaintext
      // const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert into admin table
      const adminInsertQuery = `
        INSERT INTO lists_of_admins (
          name, 
          email, 
          username, 
          role, 
          password
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const [adminResult] = await connection.execute(adminInsertQuery, [
        employee.name,
        employee.email,
        username,
        roleData.role_name,
        password // In production, use hashedPassword
      ]) as [any, FieldPacket[]];
      
      adminId = adminResult.insertId;
    }
    
    await connection.commit();
    
    // Send email notification if employee email is available
    if (employeeResults.length > 0 && adminId) {
      const employee = employeeResults[0];
      
      // Send the notification email with login credentials
      await sendRoleAssignmentNotification(
        employee.email,
        employee.name,
        roleData.role_name,
        employee.department_name,
        roleData.description || null,
        username,
        password
      );
    }
    
    return {
      success: true,
      message: "Role assigned successfully and admin account created",
      role_id: roleId
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding role:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to assign role"
    };
  } finally {
    connection.release();
  }
}

// Update role
export async function updateRole(roleId: string, roleData: Partial<RoleInput>): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get current role details before update
    const [currentRoleResult] = await connection.query(
      `SELECT * FROM roles_table WHERE role_id = ?`,
      [roleId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    if (currentRoleResult.length === 0) {
      return {
        success: false,
        error: "Role not found"
      };
    }
    
    const currentRole = currentRoleResult[0];
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (roleData.role_name !== undefined) {
      updateFields.push("role_name = ?");
      updateValues.push(roleData.role_name);
    }
    
    if (roleData.employee_id !== undefined) {
      updateFields.push("employee_id = ?");
      updateValues.push(roleData.employee_id);
    }
    
    if (roleData.department_id !== undefined) {
      updateFields.push("department_id = ?");
      updateValues.push(roleData.department_id);
    }
    
    if (roleData.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(roleData.description);
    }
    
    if (roleData.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(roleData.status);
    }
    
    // If nothing to update, return early
    if (updateFields.length === 0) {
      return {
        success: false,
        error: "No fields to update"
      };
    }
    
    const updateQuery = `
      UPDATE roles_table 
      SET ${updateFields.join(", ")}
      WHERE role_id = ?
    `;
    
    updateValues.push(roleId);
    
    await connection.execute(updateQuery, updateValues);
    
    // Update admin entry if role name changed
    if (roleData.role_name !== undefined) {
      // Get employee email
      const [employeeResult] = await connection.query(
        `SELECT e.email FROM employees_table e WHERE e.employee_id = ?`,
        [currentRole.employee_id]
      ) as [RowDataPacket[], FieldPacket[]];
      
      if (employeeResult.length > 0) {
        const employeeEmail = employeeResult[0].email;
        
        // Update admin role
        await connection.execute(
          `UPDATE lists_of_admins SET role = ? WHERE email = ?`,
          [roleData.role_name, employeeEmail]
        );
        
        // Notify admin of update
        const { notifyAdminUpdate } = await import('@/server-side/adminEmail');
        await notifyAdminUpdate(employeeEmail);
      }
    }
    
    await connection.commit();
    
    return {
      success: true,
      message: "Role updated successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error updating role:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to update role"
    };
  } finally {
    connection.release();
  }
}

// Delete role
export async function deleteRole(roleId: string): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string 
}> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const deleteQuery = `
      DELETE FROM roles_table
      WHERE role_id = ?
    `;
    
    await connection.execute(deleteQuery, [roleId]);
    await connection.commit();
    
    return {
      success: true,
      message: "Role deleted successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error deleting role:", error);
    
    return {
      success: false,
      error: error?.message || "Failed to delete role"
    };
  } finally {
    connection.release();
  }
} 