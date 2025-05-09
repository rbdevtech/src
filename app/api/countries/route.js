// src/app/api/countries/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Get countries list
export async function GET() {
  try {
    // Read the country list from the JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'country.json');
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const countries = JSON.parse(fileContents);
    
    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries', details: error.message },
      { status: 500 }
    );
  }
}