// src/app/api/auth/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Login endpoint
export async function POST(request) {
  try {
    // Parse request body
    const { username, password, rememberMe } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Fetch the user from the database
    const users = await query(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );
    
    // Check if user exists
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Create JWT payload (exclude password)
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    // Create token with expiration based on rememberMe
    const expiresIn = rememberMe ? '7d' : '1d';
    const token = createToken(tokenPayload, expiresIn);
    
    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 1 day in seconds
      path: '/',
      // Only set SameSite in production
      ...(process.env.NODE_ENV === 'production' && { sameSite: 'lax' })
    };
    
    // Create the response
    const response = NextResponse.json(
      { message: 'Login successful', user: tokenPayload },
      { status: 200 }
    );
    
    // Set the cookie properly in the response
    response.cookies.set('auth_token', token, cookieOptions);
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to log in', details: error.message },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expire immediately
    path: '/',
    // Only set SameSite in production
    ...(process.env.NODE_ENV === 'production' && { sameSite: 'lax' })
  };
  
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the cookie directly on the response
  response.cookies.set('auth_token', '', cookieOptions);

  return response;
}