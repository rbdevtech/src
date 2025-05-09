'use server';

import { query } from './db';

// Get progress for an account
export async function getProgressByAccountId(accountId) {
  try {
    // Check if progress exists
    const progress = await query(
      'SELECT * FROM progress_signup WHERE account_id = ?',
      [accountId]
    );
    
    if (progress.length === 0) {
      // Create initial progress record if it doesn't exist
      await createInitialProgress(accountId);
      
      // Fetch the newly created record
      const newProgress = await query(
        'SELECT * FROM progress_signup WHERE account_id = ?',
        [accountId]
      );
      
      return newProgress[0];
    }
    
    return progress[0];
  } catch (error) {
    console.error(`Error fetching progress for account ${accountId}:`, error);
    throw error;
  }
}

// Create initial progress record
export async function createInitialProgress(accountId) {
  try {
    // Check if the account already exists
    const accounts = await query(
      'SELECT created_at FROM accounts WHERE OrderIdAccount = ?',
      [accountId]
    );
    
    if (accounts.length === 0) {
      throw new Error(`Account ${accountId} not found`);
    }
    
    // Set create_account_completed to true since the account already exists
    const accountCreationDate = accounts[0].created_at;
    
    await query(
      `INSERT INTO progress_signup 
        (account_id, create_account_completed, create_account_date, check_account_status) 
       VALUES (?, true, ?, 'pending')`,
      [accountId, accountCreationDate]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error creating initial progress for account ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update step: Create Account
export async function updateCreateAccountStep(accountId, completed) {
  try {
    const date = completed ? new Date() : null;
    
    await query(
      `UPDATE progress_signup 
       SET create_account_completed = ?, 
           create_account_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE account_id = ?`,
      [completed, date, accountId]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating create account step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update step: First Listing
export async function updateFirstListingStep(accountId, completed) {
  try {
    const date = completed ? new Date() : null;
    
    await query(
      `UPDATE progress_signup 
       SET first_listing_completed = ?, 
           first_listing_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE account_id = ?`,
      [completed, date, accountId]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating first listing step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update step: Seller Account
export async function updateSellerAccountStep(accountId, completed) {
  try {
    const date = completed ? new Date() : null;
    
    await query(
      `UPDATE progress_signup 
       SET seller_account_completed = ?, 
           seller_account_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE account_id = ?`,
      [completed, date, accountId]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating seller account step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update step: Check Account
export async function updateCheckAccountStep(accountId, status) {
  try {
    // Validate status is one of the allowed values
    const allowedStatuses = ['pending', 'active', 'suspended'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}`);
    }
    
    // If status is 'suspended', also update the accounts table
    if (status === 'suspended') {
      await query(
        'UPDATE accounts SET Suspended = true WHERE OrderIdAccount = ?',
        [accountId]
      );
    } else if (status === 'active') {
      await query(
        'UPDATE accounts SET Suspended = false WHERE OrderIdAccount = ?',
        [accountId]
      );
    }
    
    // Update progress_signup table
    await query(
      `UPDATE progress_signup 
       SET check_account_status = ?, 
           check_account_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE account_id = ?`,
      [status, new Date(), accountId]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating check account step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}