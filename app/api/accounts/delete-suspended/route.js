// src/app/api/accounts/delete-suspended/route.js
import { NextResponse } from 'next/server';
import { deleteAllSuspendedAccounts } from '@/lib/accountUtils';

// Delete all suspended accounts
export async function DELETE() {
  try {
    const result = await deleteAllSuspendedAccounts();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete suspended accounts' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: result.message,
      count: result.count
    });
  } catch (error) {
    console.error('Error deleting suspended accounts:', error);
    return NextResponse.json(
      { error: 'Failed to delete suspended accounts', details: error.message },
      { status: 500 }
    );
  }
}