// src/app/api/email-domain/route.js
import { NextResponse } from 'next/server';
import { getEmailDomainSettings, updateEmailDomain } from '@/lib/accountUtils';

// Get current email domain
export async function GET() {
  try {
    const domain = await getEmailDomainSettings();
    
    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error fetching email domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email domain', details: error.message },
      { status: 500 }
    );
  }
}

// Update email domain
export async function PUT(request) {
  try {
    const data = await request.json();
    
    if (!data.domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }
    
    const result = await updateEmailDomain(data.domain);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update email domain' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Email domain updated successfully',
      domain: data.domain
    });
  } catch (error) {
    console.error('Error updating email domain:', error);
    return NextResponse.json(
      { error: 'Failed to update email domain', details: error.message },
      { status: 500 }
    );
  }
}