import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In a real app, you would use a database instead of a JSON file
const dataFilePath = path.join(process.cwd(), 'data/waitlist.json');

// Ensure the data directory exists
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Ensure the waitlist file exists
const ensureFileExists = () => {
  ensureDirectoryExists(path.dirname(dataFilePath));
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ emails: [] }), 'utf8');
  }
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email } = body;

    // Simple validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Ensure data file exists
    ensureFileExists();

    // Read existing data
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);

    // Check if email already exists
    if (data.emails.includes(email)) {
      return NextResponse.json(
        { success: true, message: 'You are already on the waitlist' },
        { status: 200 }
      );
    }

    // Add email to waitlist
    data.emails.push(email);

    // Save updated data
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Successfully added to the waitlist' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
} 