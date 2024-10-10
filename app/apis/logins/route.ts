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

    // Your logic to handle login goes here
    // For example:
    const client = await getClient();
    // Perform database operations
    const result = await client.query('SELECT * FROM lists_of_admins')
    console.log(result.rows[0])
   // return NextResponse.json({ message: 'Login request received' }, { status: 200, headers });
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