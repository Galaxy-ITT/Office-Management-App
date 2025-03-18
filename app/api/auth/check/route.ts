import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/database/connection'
import { RowDataPacket } from 'mysql2/promise'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const authToken = (await cookies()).get('auth_token')?.value
    
    if (!authToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }
    
    // Verify token
    const decoded = verify(
      authToken, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: number, role: string }
    
    // Get user data from database
    const connection = await pool.getConnection()
    
    try {
      // Get admin details
      const [admins] = await connection.query(
        'SELECT admin_id, name, email, username, role FROM lists_of_admins WHERE admin_id = ?',
        [decoded.id]
      ) as [RowDataPacket[], any]
      
      if (admins.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 })
      }
      
      const admin = admins[0]
      // Define userData with an explicit type annotation
      type UserData = {
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
      
      // For HOD role, get additional data
      if (admin.role === 'HOD') {
        const [roles] = await connection.query(
          `SELECT r.*, d.name as department_name, e.position 
           FROM roles_table r 
           JOIN employees_table e ON r.employee_id = e.employee_id
           LEFT JOIN departments_table d ON r.department_id = d.department_id
           WHERE r.admin_id = ?`,
          [admin.admin_id]
        ) as [RowDataPacket[], any]
        
        if (roles.length > 0) {
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
      
      return NextResponse.json({
        success: true,
        data: userData
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication error' 
    }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  // Clear auth token cookie
  (await
        // Clear auth token cookie
        cookies()).delete('auth_token')
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })
}