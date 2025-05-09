'use server';

import { 
  getProgressByAccountId,
  updateCreateAccountStep,
  updateFirstListingStep,
  updateSellerAccountStep,
  updateCheckAccountStep
} from '@/lib/progressUtils';

// Get progress for an account
export async function getProgress(accountId) {
  try {
    const progress = await getProgressByAccountId(accountId);
    return { success: true, data: progress };
  } catch (error) {
    console.error(`Error fetching progress for account ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update create account step
export async function updateCreateAccount(accountId, completed) {
  try {
    const result = await updateCreateAccountStep(accountId, completed);
    if (result.success) {
      const progress = await getProgressByAccountId(accountId);
      return { success: true, data: progress };
    }
    return result;
  } catch (error) {
    console.error(`Error updating create account step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update first listing step
export async function updateFirstListing(accountId, completed) {
  try {
    const result = await updateFirstListingStep(accountId, completed);
    if (result.success) {
      const progress = await getProgressByAccountId(accountId);
      return { success: true, data: progress };
    }
    return result;
  } catch (error) {
    console.error(`Error updating first listing step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update seller account step
export async function updateSellerAccount(accountId, completed) {
  try {
    const result = await updateSellerAccountStep(accountId, completed);
    if (result.success) {
      const progress = await getProgressByAccountId(accountId);
      return { success: true, data: progress };
    }
    return result;
  } catch (error) {
    console.error(`Error updating seller account step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}

// Update check account step
export async function updateCheckAccount(accountId, status) {
  try {
    const result = await updateCheckAccountStep(accountId, status);
    if (result.success) {
      const progress = await getProgressByAccountId(accountId);
      return { success: true, data: progress };
    }
    return result;
  } catch (error) {
    console.error(`Error updating check account step for ${accountId}:`, error);
    return { success: false, error: error.message };
  }
}