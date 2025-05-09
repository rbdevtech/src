// src/lib/accountUtils.js
import fs from 'fs';
import path from 'path';
import { query } from './db';

// Helper to read JSON files
export async function readJsonFile(filename) {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Generate random OrderIdAccount
export function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get current email domain
export async function getEmailDomain() {
  const domains = await query('SELECT domain FROM email_domain LIMIT 1');
  return domains.length > 0 ? domains[0].domain : 'domain.com';
}

// Generate random password
export function generatePassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()';
  
  // Helper function to shuffle a string
  const shuffle = (str) => {
    return str.split('').sort(() => 0.5 - Math.random()).join('');
  };
  
  // Generate parts
  const pwd_lowercase = shuffle(lowercase).slice(0, 5);
  const pwd_uppercase = shuffle(uppercase).slice(0, 2);
  const pwd_digits = shuffle(digits).slice(0, 2);
  const pwd_special = shuffle(special).slice(0, 1);
  
  // Combine and shuffle the parts
  return shuffle(pwd_lowercase + pwd_uppercase + pwd_digits + pwd_special);
}

// Generate random email based on name
export function generateEmail(firstName, lastName, domain) {
  const name = Math.random() > 0.5 ? firstName : lastName;
  const digits = Math.floor(Math.random() * 100);
  const email = `${name.toLowerCase()}${digits}@${domain}`;
  return email;
}

// Generate random account
export async function generateRandomAccount(userId = '') {
  try {
    // Load data from JSON files
    const firstNames = await readJsonFile('firstnames.json');
    const lastNames = await readJsonFile('lastnames.json');
    const countries = await readJsonFile('country.json');
    
    // Get current email domain
    const domain = await getEmailDomain();
    
    // Generate random values
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const orderId = generateOrderId();
    const email = generateEmail(firstName, lastName, domain);
    const password = generatePassword();
    
    return {
      OrderIdAccount: orderId,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      Country: country,
      UserID: userId,
      Suspended: false
    };
  } catch (error) {
    console.error('Error generating random account:', error);
    throw error;
  }
}

// Create account in database
export async function createAccount(accountData) {
  try {
    const result = await query(
      `INSERT INTO accounts (
        OrderIdAccount, FirstName, LastName, Email, 
        Password, Country, UserID, Suspended
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        accountData.OrderIdAccount,
        accountData.FirstName,
        accountData.LastName,
        accountData.Email,
        accountData.Password,
        accountData.Country,
        accountData.UserID,
        accountData.Suspended
      ]
    );
    
    return { 
      success: true, 
      id: result.insertId, 
      OrderIdAccount: accountData.OrderIdAccount,
      ...accountData 
    };
  } catch (error) {
    console.error('Error creating account:', error);
    return { success: false, error: error.message || 'Failed to create account' };
  }
}

// Get all accounts
export async function getAccounts(limit = 100, offset = 0, searchTerm = '') {
  try {
    let queryStr = `
      SELECT * FROM accounts 
    `;
    
    const params = [];
    
    if (searchTerm) {
      queryStr += `
        WHERE 
          OrderIdAccount LIKE ? OR
          FirstName LIKE ? OR
          LastName LIKE ? OR
          Email LIKE ? OR
          Country LIKE ? OR
          UserID LIKE ?
      `;
      const searchPattern = `%${searchTerm}%`;
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
      `SELECT COUNT(*) as total FROM accounts ${searchTerm ? 
        `WHERE 
          OrderIdAccount LIKE ? OR
          FirstName LIKE ? OR
          LastName LIKE ? OR
          Email LIKE ? OR
          Country LIKE ? OR
          UserID LIKE ?` : ''}`,
      searchTerm ? 
        Array(6).fill(`%${searchTerm}%`) : 
        []
    );
    
    return { 
      accounts, 
      total: countResult[0].total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

// Get account by OrderIdAccount
export async function getAccountById(orderId) {
  try {
    const accounts = await query(
      'SELECT * FROM accounts WHERE OrderIdAccount = ?',
      [orderId]
    );
    
    if (accounts.length === 0) {
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error(`Error fetching account ${orderId}:`, error);
    throw error;
  }
}

// Update account
export async function updateAccount(orderId, accountData) {
  try {
    const result = await query(
      `UPDATE accounts SET
        FirstName = ?,
        LastName = ?,
        Email = ?,
        Password = ?,
        Country = ?,
        UserID = ?,
        Suspended = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE OrderIdAccount = ?`,
      [
        accountData.FirstName,
        accountData.LastName,
        accountData.Email,
        accountData.Password,
        accountData.Country,
        accountData.UserID,
        accountData.Suspended,
        orderId
      ]
    );
    
    return { 
      success: result.affectedRows > 0,
      message: result.affectedRows > 0 ? 'Account updated successfully' : 'No account found with that ID' 
    };
  } catch (error) {
    console.error(`Error updating account ${orderId}:`, error);
    return { success: false, error: error.message || 'Failed to update account' };
  }
}

// Delete account
export async function deleteAccount(orderId) {
  try {
    const result = await query(
      'DELETE FROM accounts WHERE OrderIdAccount = ?',
      [orderId]
    );
    
    return { 
      success: result.affectedRows > 0,
      message: result.affectedRows > 0 ? 'Account deleted successfully' : 'No account found with that ID' 
    };
  } catch (error) {
    console.error(`Error deleting account ${orderId}:`, error);
    return { success: false, error: error.message || 'Failed to delete account' };
  }
}

// Get email domain
export async function getEmailDomainSettings() {
  try {
    const domains = await query('SELECT * FROM email_domain LIMIT 1');
    return domains.length > 0 ? domains[0] : { domain: 'domain.com' };
  } catch (error) {
    console.error('Error fetching email domain:', error);
    throw error;
  }
}

// Update email domain
export async function updateEmailDomain(domain) {
  try {
    const domains = await query('SELECT * FROM email_domain LIMIT 1');
    
    if (domains.length === 0) {
      // Insert if not exists
      await query(
        'INSERT INTO email_domain (domain) VALUES (?)',
        [domain]
      );
    } else {
      // Update existing
      await query(
        'UPDATE email_domain SET domain = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [domain, domains[0].id]
      );
    }
    
    return { success: true, message: 'Email domain updated successfully' };
  } catch (error) {
    console.error('Error updating email domain:', error);
    return { success: false, error: error.message || 'Failed to update email domain' };
  }
}

// Delete all suspended accounts
export async function deleteAllSuspendedAccounts() {
  try {
    const result = await query(
      'DELETE FROM accounts WHERE Suspended = true'
    );
    
    return { 
      success: true,
      count: result.affectedRows,
      message: `${result.affectedRows} suspended accounts deleted successfully` 
    };
  } catch (error) {
    console.error('Error deleting suspended accounts:', error);
    return { success: false, error: error.message || 'Failed to delete suspended accounts' };
  }
}