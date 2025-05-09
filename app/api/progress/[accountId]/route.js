// src/app/api/progress/[accountId]/route.js
import { NextResponse } from 'next/server';
import { 
  getProgressByAccountId,
  updateCreateAccountStep,
  updateFirstListingStep,
  updateSellerAccountStep,
  updateCheckAccountStep
} from '@/lib/progressUtils';

// Get progress data
export async function GET(request, { params }) {
  try {
    const { accountId } = params;
    
    const progress = await getProgressByAccountId(accountId);
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error(`Error fetching progress for account ${params.accountId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data', details: error.message },
      { status: 500 }
    );
  }
}

// Update progress step
export async function PUT(request, { params }) {
  try {
    const { accountId } = params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.step) {
      return NextResponse.json(
        { error: 'Step is required' },
        { status: 400 }
      );
    }
    
    let result;
    
    // Handle different steps
    switch (data.step) {
      case 'createAccount':
        result = await updateCreateAccountStep(accountId, data.completed);
        break;
      case 'firstListing':
        result = await updateFirstListingStep(accountId, data.completed);
        break;
      case 'sellerAccount':
        result = await updateSellerAccountStep(accountId, data.completed);
        break;
      case 'checkAccount':
        if (!data.status) {
          return NextResponse.json(
            { error: 'Status is required for checkAccount step' },
            { status: 400 }
          );
        }
        result = await updateCheckAccountStep(accountId, data.status);
        break;
      default:
        return NextResponse.json(
          { error: `Invalid step: ${data.step}` },
          { status: 400 }
        );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update progress' },
        { status: 500 }
      );
    }
    
    // Get updated progress
    const updatedProgress = await getProgressByAccountId(accountId);
    
    return NextResponse.json({
      message: 'Progress updated successfully',
      progress: updatedProgress
    });
  } catch (error) {
    console.error(`Error updating progress for account ${params.accountId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update progress', details: error.message },
      { status: 500 }
    );
  }
}