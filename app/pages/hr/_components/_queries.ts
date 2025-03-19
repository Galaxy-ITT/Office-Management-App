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

// Add new employee with admin account creation
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
    
    // Insert employee record
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

    // Get department name if department_id is provided
    let departmentName = null;
    if (employeeData.department_id) {
      const [departmentResult] = await connection.query(
        `SELECT name FROM departments_table WHERE department_id = ?`,
        [employeeData.department_id]
      ) as [RowDataPacket[], FieldPacket[]];
      
      if (departmentResult.length > 0) {
        departmentName = departmentResult[0].name;
      }
    }
    
    // Generate username based on employee name
    const nameParts = employeeData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    // Take first initial + first 3 chars of last name
    const firstInitial = firstName.charAt(0);
    const lastNameShort = lastName.substring(0, 3);
    const baseUsername = (firstInitial + lastNameShort).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Ensure username is unique
    let isUsernameUnique = false;
    let attemptCount = 0;
    let username = baseUsername;
    
    while (!isUsernameUnique && attemptCount < 10) {
      if (attemptCount > 0) {
        username = baseUsername + attemptCount;
      }
      
      const [existingUsername] = await connection.query(
        `SELECT username FROM lists_of_admins WHERE username = ?`,
        [username]
      ) as [RowDataPacket[], FieldPacket[]];
      
      if (existingUsername.length === 0) {
        isUsernameUnique = true;
      } else {
        attemptCount++;
      }
    }
    
    if (!isUsernameUnique) {
      username = baseUsername + Math.floor(Math.random() * 100);
    }
    
    // Generate secure random password
    const password = Math.random().toString(36).slice(2, 8) + 
               Math.random().toString(36).slice(2, 8).toUpperCase() + 
               Math.floor(Math.random() * 10);
    
    // Create employee admin account
    const adminInsertQuery = `
      INSERT INTO lists_of_admins (
        name,
        email,
        username,
        role,
        password
      ) VALUES (?, ?, ?, 'Employee', ?)
    `;
    
    await connection.execute(adminInsertQuery, [
      employeeData.name,
      employeeData.email,
      username,
      password
    ]);
    
    await connection.commit();
    
    // Send email notification with login credentials
    const { sendEmployeeAccountNotification } = await import('@/server-side/adminEmail');
    await sendEmployeeAccountNotification(
      employeeData.email,
      employeeData.name,
      employeeData.position,
      departmentName,
      username,
      password
    );
    
    return {
      success: true,
      message: "Employee added successfully and account created",
      employee_id: employeeId
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error adding employee:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('email')) {
        return {
          success: false,
          error: "An employee with this email already exists"
        };
      }
      if (error.message.includes('username')) {
        return {
          success: false,
          error: "Username already exists. Please try again."
        };
      }
    }
    
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
    
    // Get current employee data to check for email changes
    const [currentEmployeeResult] = await connection.query(
      `SELECT * FROM employees_table WHERE employee_id = ?`,
      [employeeId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    if (currentEmployeeResult.length === 0) {
      return {
        success: false,
        error: "Employee not found"
      };
    }
    
    const currentEmployee = currentEmployeeResult[0];
    const emailChanged = employeeData.email !== undefined && employeeData.email !== currentEmployee.email;
    
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
    
    // Update admin account if email or name changed
    if (emailChanged || (employeeData.name !== undefined && employeeData.name !== currentEmployee.name)) {
      const adminUpdateFields: string[] = [];
      const adminUpdateValues: any[] = [];
      
      if (employeeData.name !== undefined) {
        adminUpdateFields.push("name = ?");
        adminUpdateValues.push(employeeData.name);
      }
      
      if (emailChanged) {
        adminUpdateFields.push("email = ?");
        adminUpdateValues.push(employeeData.email);
      }
      
      if (adminUpdateFields.length > 0) {
        const adminUpdateQuery = `
          UPDATE lists_of_admins 
          SET ${adminUpdateFields.join(", ")}
          WHERE email = ? AND role = 'Employee'
        `;
        
        adminUpdateValues.push(currentEmployee.email);
        await connection.execute(adminUpdateQuery, adminUpdateValues);
        
        // Notify admin of update if email changed
        if (emailChanged && employeeData.email) {
          const { notifyAdminUpdate } = await import('@/server-side/adminEmail');
          await notifyAdminUpdate(employeeData.email);
        }
      }
    }
    
    await connection.commit();
    
    return {
      success: true,
      message: "Employee updated successfully"
    };
    
  } catch (error: any) {
    await connection.rollback();
    console.error("Error updating employee:", error);
    
    // Handle specific errors
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
      return {
        success: false,
        error: "An employee with this email already exists"
      };
    }
    
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
    
    // Get employee details before deletion
    const [employeeDetails] = await connection.query(
      `SELECT name, email FROM employees_table WHERE employee_id = ?`,
      [employeeId]
    ) as [RowDataPacket[], FieldPacket[]];
    
    if (employeeDetails.length === 0) {
      return {
        success: false,
        error: "Employee not found"
      };
    }
    
    const employee = employeeDetails[0];
    
    // Delete related admin account if exists
    await connection.execute(`
      DELETE FROM lists_of_admins
      WHERE email = ? AND role = 'Employee'
    `, [employee.email]);
    
    // Delete the employee
    const deleteQuery = `
      DELETE FROM employees_table
      WHERE employee_id = ?
    `;
    
    await connection.execute(deleteQuery, [employeeId]);
    await connection.commit();
    
    // Send notification email
    const { sendAdminRemovalNotification } = await import('@/server-side/adminEmail');
    await sendAdminRemovalNotification(
      employee.name,
      employee.email,
      'Employee'
    );
    
    return {
      success: true,
      message: "Employee deleted successfully and account removed"
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
    // First, verify that assigned_by exists in lists_of_admins
    const checkAdminQuery = `SELECT admin_id FROM lists_of_admins WHERE admin_id = ?`;
    const [adminResults] = await connection.query(checkAdminQuery, [roleData.assigned_by]) as [RowDataPacket[], FieldPacket[]];
    
    if (adminResults.length === 0) {
      return {
        success: false,
        error: "Invalid admin ID. Please log in again or contact system administrator."
      };
    }
    
    await connection.beginTransaction();
    
    const roleId = uuidv4();
    
    // Get employee details for email notification
    const employeeQuery = `
      SELECT e.name, e.email, d.name as department_name
      FROM employees_table e
      LEFT JOIN departments_table d ON d.department_id = ?
      WHERE e.employee_id = ?
    `;
    
    const [employeeResults] = await connection.query(employeeQuery, [
      roleData.department_id || null,
      roleData.employee_id
    ]) as [RowDataPacket[], FieldPacket[]];
    
    if (employeeResults.length === 0) {
      return {
        success: false,
        error: "Employee not found"
      };
    }
    
    const employee = employeeResults[0];
    
    // Generate shorter username (max ~4 chars)
    const nameParts = employee.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    // Take first initial + first 3 chars of last name
    const firstInitial = firstName.charAt(0);
    const lastNameShort = lastName.substring(0, 3);
    const baseUsername = (firstInitial + lastNameShort).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Always generate a new unique username
    let isUsernameUnique = false;
    let attemptCount = 0;
    let username = baseUsername;
    
    while (!isUsernameUnique && attemptCount < 10) {
      // Add single digit if needed after first attempt
      if (attemptCount > 0) {
        username = baseUsername + attemptCount;
      }
      
      // Check if username exists
      const [existingUsername] = await connection.query(
        `SELECT username FROM lists_of_admins WHERE username = ?`,
        [username]
      ) as [RowDataPacket[], FieldPacket[]];
      
      if (existingUsername.length === 0) {
        isUsernameUnique = true;
      } else {
        attemptCount++;
      }
    }
    
    if (!isUsernameUnique) {
      username = baseUsername + Math.floor(Math.random() * 100);
    }
    
    // Generate random password
    const password = Math.random().toString(36).slice(2, 10) + 
               Math.random().toString(36).slice(2, 10).toUpperCase() + 
               Math.floor(Math.random() * 10);
    
    // Create HOD admin account
    const adminInsertQuery = `
      INSERT INTO lists_of_admins (
        name,
        email,
        username,
        role,
        password
      ) VALUES (?, ?, ?, 'HOD', ?)
    `;
    
    const [adminResult] = await connection.execute(adminInsertQuery, [
      employee.name,
      employee.email,
      username,
      password
    ]) as [any, FieldPacket[]];
    
    const adminId = adminResult.insertId;
    
    // Insert the role with the admin_id reference
    const insertQuery = `
      INSERT INTO roles_table (
        role_id,
        role_name, 
        employee_id, 
        department_id, 
        description,
        assigned_by,
        admin_id,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(insertQuery, [
      roleId,
      roleData.role_name,
      roleData.employee_id,
      roleData.department_id,
      roleData.description || null,
      roleData.assigned_by,
      adminId,
      roleData.status
    ]);
    
    await connection.commit();
    
    // Send email notification with login credentials
    if (employeeResults.length > 0) {
      await sendRoleAssignmentNotification(
        employee.email,
        employee.name,
        roleData.role_name,
        employee.department_name,
        roleData.description || null,
        username,
        password // Show actual password in email
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
    
    // Handle specific errors with user-friendly messages
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('username')) {
      return {
        success: false,
        error: "Username already exists. Please try again."
      };
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.message.includes('assigned_by')) {
        return {
          success: false,
          error: "You don't have permission to assign roles. Please log in again."
        };
      }
      if (error.message.includes('employee_id')) {
        return {
          success: false,
          error: "Selected employee does not exist."
        };
      }
      if (error.message.includes('department_id')) {
        return {
          success: false,
          error: "Selected department does not exist."
        };
      }
    }
    
    return {
      success: false,
      error: "Database error: " + (error?.sqlMessage || error?.message || "Failed to assign role")
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
    
    // Get role and employee details before deletion
    const [roleDetails] = await connection.query(`
      SELECT r.*, e.name as employee_name, e.email as employee_email
      FROM roles_table r
      JOIN employees_table e ON r.employee_id = e.employee_id
      WHERE r.role_id = ?
    `, [roleId]) as [RowDataPacket[], FieldPacket[]];
    
    if (roleDetails.length === 0) {
      return {
        success: false,
        error: "Role not found"
      };
    }
    
    const role = roleDetails[0];
    
    // Delete related admin account if exists
    await connection.execute(`
      DELETE FROM lists_of_admins
      WHERE email = ? AND role = ?
    `, [role.employee_email, role.role_name]);
    
    // Delete the role
    const deleteQuery = `
      DELETE FROM roles_table
      WHERE role_id = ?
    `;
    
    await connection.execute(deleteQuery, [roleId]);
    await connection.commit();
    
    // Send notification email
    const { sendAdminRemovalNotification } = await import('@/server-side/adminEmail');
    await sendAdminRemovalNotification(
      role.employee_name,
      role.employee_email,
      role.role_name
    );
    
    return {
      success: true,
      message: "Role deleted successfully and admin access revoked"
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