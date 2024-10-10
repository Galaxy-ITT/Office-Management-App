import { NextResponse } from 'next/server';
import { getClient } from '@/app/database';

export async function POST(req: Request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });

  try {
    const body = await req.json();
    console.log('Received new record:', body);

    const client = await getClient();
    
    // Insert the new record into the database
    const result = await client.query('SELECT * FROM records')

    const newRecord = result.rows[0];
    console.log(newRecord);
    return NextResponse.json(newRecord, { status: 201, headers });
  } catch (error) {
    console.error('Error processing new record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
  }
}