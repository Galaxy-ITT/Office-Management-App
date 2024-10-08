import { NextResponse } from 'next/server';
import { getClient } from '@/app/database';


export async function GET(request: Request) {
  try {
    // Your logic to fetch admins goes here
    // For example:
    const client = await getClient();
    const admins = [
      { id: 1, name: 'Admin 1' },
      { id: 2, name: 'Admin 2' },
    ];

   


    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}