// src/lib/auth.js
import jwt from 'jsonwebtoken';

// Get the JWT secret consistently, so it's the same across server restarts
const JWT_SECRET = process.env.JWT_SECRET || 'default-fallback-secret-for-development-only';

// Create a JWT token with consistent algorithm
export function createToken(payload, expiresIn = '1d') {
  try {
    console.log(`Creating token for user: ${payload.username} with expiresIn: ${expiresIn}`);
    
    // Always use HS256 algorithm for jose compatibility
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn,
      algorithm: 'HS256'
    });
    
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

// Verify token (server-side)
export function verifyToken(token) {
  try {
    const verified = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    console.log(`Successfully verified token for: ${verified.username}`);
    return verified;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// Client-side functions
export function getAuthTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('auth_token=')) {
      return cookie.substring('auth_token='.length, cookie.length);
    }
  }
  return null;
}

export function isAuthenticated() {
  const token = getAuthTokenFromCookie();
  return !!token;
}

export function removeAuthCookie() {
  // More reliable cookie removal for development
  document.cookie = 'auth_token=; Max-Age=0; path=/; domain=' + window.location.hostname;
  document.cookie = 'auth_token=; Max-Age=0; path=/;';
}

// Parse JWT payload (client-side)
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

export function getCurrentUser() {
  const token = getAuthTokenFromCookie();
  if (!token) return null;
  
  return parseJwt(token);
}