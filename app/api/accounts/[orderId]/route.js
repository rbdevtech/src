// src/app/api/accounts/[orderId]/route.js
import { NextResponse } from 'next/server';
import { 
  getAccountById, 
  updateAccount, 
  deleteAccount 
} from '@/lib/accountUtils';

// Get account by ID
export async function GET(request, { params }) {
  try {
    const { orderId } = params;
    
    const account = await getAccountById(orderId);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(account);
  } catch (error) {
    console.error(`Error fetching account ${params.orderId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch account', details: error.message },
      { status: 500 }
    );
  }
}

// Update account
export async function PUT(request, { params }) {
  try {
    const { orderId } = params;
    const data = await request.json();
    
    // Make sure account exists
    const existingAccount = await getAccountById(orderId);
    
    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Update the account
    const result = await updateAccount(orderId, {
      FirstName: data.FirstName ?? existingAccount.FirstName,
      LastName: data.LastName ?? existingAccount.LastName,
      Email: data.Email ?? existingAccount.Email,
      Password: data.Password ?? existingAccount.Password,
      Country: data.Country ?? existingAccount.Country,
      UserID: data.UserID ?? existingAccount.UserID,
      Suspended: data.Suspended ?? existingAccount.Suspended
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update account' },
        { status: 500 }
      );
    }
    
    // Get updated account
    const updatedAccount = await getAccountById(orderId);
    
    return NextResponse.json({
      message: 'Account updated successfully',
      account: updatedAccount
    });
  } catch (error) {
    console.error(`Error updating account ${params.orderId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update account', details: error.message },
      { status: 500 }
    );
  }
}

// Delete account
export async function DELETE(request, { params }) {
  try {
    const { orderId } = params;
    
    const result = await deleteAccount(orderId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting account ${params.orderId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    );
  }
}