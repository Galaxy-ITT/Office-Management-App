import { NextResponse } from 'next/server';
import { getClient } from '@/app/database';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Set CORS headers for the actual request
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });

  try {
    // Parse the JSON body of the request
    const { username, password, rememberMe } = await req.json();
    console.log('Received login data:', username, password, rememberMe);

    const client = await getClient();
    
    // Query the database for the user
    const result = await client.query('SELECT * FROM lists_of_admins WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers });
    }

    const user = result.rows[0];

    console.log(user)
    
    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Password is correct, update remember_me field
      await client.query('UPDATE lists_of_admins SET remember_me = $1 WHERE admin_id = $2', [true, user.admin_id]);

      // Password is correct
      return NextResponse.json({ 
        message: 'Login successful', 
        user: { 
          id: user.admin_id, 
          name: user.name, 
          role: user.role,
          rememberMe: true  // Always true after successful login
        } 
      }, { status: 200, headers });
    } else {
      // Password is incorrect
      return NextResponse.json({ error: 'Invalid password' }, { status: 401, headers });
    }

  } catch (error) {
    console.error('Error processing login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}