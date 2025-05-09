// src/app/api/admin/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Check if any admin exists
export async function GET() {
  try {
    const admins = await query('SELECT COUNT(*) as count FROM admin_users');
    const hasAdmins = admins[0].count > 0;
    
    return NextResponse.json({ hasAdmins });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status', details: error.message },
      { status: 500 }
    );
  }
}

// Create first admin
export async function POST(request) {
  try {
    // Check if an admin already exists
    const admins = await query('SELECT COUNT(*) as count FROM admin_users');
    if (admins[0].count > 0) {
      return NextResponse.json(
        { error: 'An admin user already exists' },
        { status: 409 }
      );
    }
    
    // Parse the request body
    const { username, password } = await request.json();
    
    // Validate the input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert the new admin
    const result = await query(
      'INSERT INTO admin_users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    // Return success message
    return NextResponse.json(
      { message: 'Admin user created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Admin with that username already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error.message },
      { status: 500 }
    );
  }
}