import { NextResponse } from 'next/server';
import { getClient } from '@/app/database';

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
    const body = await req.json();
    console.log('Received login data:', body);

    // Your logic to handle login goes here
    // For example:
    // const client = await getClient();
    // Perform database operations

    // For now, we'll just return a success message
    return NextResponse.json({ message: 'Login request received' }, { status: 200, headers });
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