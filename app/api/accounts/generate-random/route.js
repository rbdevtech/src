// src/app/api/accounts/generate-random/route.js
import { NextResponse } from 'next/server';
import { generateRandomAccount } from '@/lib/accountUtils';

// Generate a random account without saving it
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    
    const randomAccount = await generateRandomAccount(userId);
    
    return NextResponse.json({
      message: 'Random account generated successfully',
      account: randomAccount
    });
  } catch (error) {
    console.error('Error generating random account:', error);
    return NextResponse.json(
      { error: 'Failed to generate random account', details: error.message },
      { status: 500 }
    );
  }
}