import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/database/connection'
import { RowDataPacket } from 'mysql2/promise'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username and password are required' 
      }, { status: 400 })
    }

    const connection = await pool.getConnection()
    
    try {
      // Step 1: Query the lists_of_admins table
      const [admins] = await connection.query(
        'SELECT * FROM lists_of_admins WHERE username = ? AND password = ?',
        [username, password]
      ) as [RowDataPacket[], any]

      if (admins.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid username or password' 
        }, { status: 401 })
      }

      const admin = admins[0]
      
      // Step 2: Set up the user object based on role
      interface UserData {
        admin_id: any;
        name: any;
        email: any;
        username: any;
        role: any;
        role_id?: any;
        role_name?: any;
        department_id?: any;
        department_name?: any;
        employee_id?: any;
        position?: any;
      }
      
      let userData: UserData = {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role
      }
      
      // Step 3: For HOD role, get additional data from roles_table
      if (admin.role === 'HOD') {
        // Get the role details for this admin
        const [roles] = await connection.query(
          `SELECT r.*, d.name as department_name, e.position 
           FROM roles_table r 
           JOIN employees_table e ON r.employee_id = e.employee_id
           LEFT JOIN departments_table d ON r.department_id = d.department_id
           WHERE r.admin_id = ?`,
          [admin.admin_id]
        ) as [RowDataPacket[], any]
        
        if (roles.length > 0) {
          // Add role-specific data to userData
          userData = {
            ...userData,
            role_id: roles[0].role_id,
            role_name: roles[0].role_name,
            department_id: roles[0].department_id,
            department_name: roles[0].department_name,
            employee_id: roles[0].employee_id,
            position: roles[0].position
          }
        }
      }

      // Step 4: Create JWT token
      const token = sign(
        { id: admin.admin_id, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '8h' }
      )

      // Step 6: Calculate redirect path based on role
      let redirectPath
      switch (admin.role) {
        case 'HOD':
          redirectPath = '/pages/hod-admin'
          break
        case 'Super Admin':
          redirectPath = '/pages/super-admin'
          break
        case 'Registry':
          redirectPath = '/pages/registry'
          break
        case 'Human Resource':
          redirectPath = '/pages/hr'
          break
        case 'Boss':
          redirectPath = '/pages/boss'
          break
        case 'Employee':
          redirectPath = '/pages/employee-profile'
          break
        default:
          redirectPath = '/dashboard'
      }

      // Step 7: Create response and set cookie on it
      const response = NextResponse.json({
        success: true,
        data: userData,
        redirectPath
      })
      
      // Set cookie on the response object
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 60 * 60 // 8 hours
      })

      return response
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during login' 
    }, { status: 500 })
  }
}