// src/app/api/accounts/route.js
import { NextResponse } from 'next/server';
import { 
  createAccount, 
  generateRandomAccount 
} from '@/lib/accountUtils';
import { query } from '@/lib/db';
import { updateCreateAccountStep } from '@/lib/progressUtils';

// Get accounts with pagination and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';
    const suspended = searchParams.get('suspended') === 'true';
    
    // Build the query
    let queryStr = `
      SELECT * FROM accounts 
      WHERE Suspended = ?
    `;
    
    const params = [suspended];
    
    if (search) {
      queryStr += `
        AND (
          OrderIdAccount LIKE ? OR
          FirstName LIKE ? OR
          LastName LIKE ? OR
          Email LIKE ? OR
          Country LIKE ? OR
          UserID LIKE ?
        )
      `;
      const searchPattern = `%${search}%`;
      params.push(
        searchPattern, searchPattern, searchPattern, 
        searchPattern, searchPattern, searchPattern
      );
    }
    
    queryStr += `
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    
    const accounts = await query(queryStr, params);
    
    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM accounts 
      WHERE Suspended = ?
      ${search ? 
        `AND (
          OrderIdAccount LIKE ? OR
          FirstName LIKE ? OR
          LastName LIKE ? OR
          Email LIKE ? OR
          Country LIKE ? OR
          UserID LIKE ?
        )` : ''}`,
      search ? 
        [suspended, ...Array(6).fill(`%${search}%`)] : 
        [suspended]
    );
    
    return NextResponse.json({ 
      accounts, 
      total: countResult[0].total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts', details: error.message },
      { status: 500 }
    );
  }
}

// Create a new account
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Check if we're generating a random account
    if (data.generateRandom) {
      const randomAccount = await generateRandomAccount(data.UserID || '');
      const result = await createAccount(randomAccount);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to create random account' },
          { status: 500 }
        );
      }
      
      // Create progress entry and mark first step as completed
      try {
        await updateCreateAccountStep(result.OrderIdAccount, true);
      } catch (progressError) {
        console.error('Error updating progress after account creation:', progressError);
        // Continue even if progress update fails
      }
      
      return NextResponse.json(
        { message: 'Random account created successfully', account: result },
        { status: 201 }
      );
    }
    
    // Validate required fields
    if (!data.OrderIdAccount || !data.Email || !data.Password) {
      return NextResponse.json(
        { error: 'OrderIdAccount, Email, and Password are required' },
        { status: 400 }
      );
    }
    
    // Create the account with provided data
    const result = await createAccount({
      OrderIdAccount: data.OrderIdAccount,
      FirstName: data.FirstName || '',
      LastName: data.LastName || '',
      Email: data.Email,
      Password: data.Password,
      Country: data.Country || '',
      UserID: data.UserID || '',
      Suspended: data.Suspended || false
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create account' },
        { status: 500 }
      );
    }
    
    // Create progress entry and mark first step as completed
    try {
      await updateCreateAccountStep(result.OrderIdAccount, true);
    } catch (progressError) {
      console.error('Error updating progress after account creation:', progressError);
      // Continue even if progress update fails
    }
    
    return NextResponse.json(
      { message: 'Account created successfully', account: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account', details: error.message },
      { status: 500 }
    );
  }
}