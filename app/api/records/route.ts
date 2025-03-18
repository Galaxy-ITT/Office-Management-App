import { NextResponse } from 'next/server';
import { getClient } from '@/app/database';

export async function POST(req: Request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });

  try {
    const formData = await req.formData();
    console.log('Received new record:', formData);

    const client = await getClient();
    
    // Extract file data
    const file = formData.get('file') as File;
    let fileBuffer = null;
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    }

    // Insert the new record into the database
    const result = await client.query(
      `INSERT INTO records (name, status, source, sender_name, date_sent, date_received, organization_ref_number, file)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        formData.get('name'),
        formData.get('status'),
        formData.get('source'),
        formData.get('senderName'),
        formData.get('dateSent'),
        formData.get('dateReceived'),
        formData.get('organizationRefNumber'),
        fileBuffer
      ]
    );

    const newRecord = result.rows[0];
    console.log('Saved new record:', newRecord);
    return NextResponse.json({ message: 'Record saved successfully', record: newRecord }, { status: 201, headers });
  } catch (error) {
    console.error('Error processing new record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
  }
}