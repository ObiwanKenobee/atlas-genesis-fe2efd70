
// Mock database for testing purposes
import { Pool } from 'pg';

// In-memory storage
let users: any[] = [];
let transactions: any[] = [];
let tokens: any[] = [];
let rius: any[] = [];
let carbonProjects: any[] = [];
let measurementData: any[] = [];

// Mock query function
export async function query(text: string, params: any[] = []) {
  console.log('Mock query:', text, params);
  
  // Mock user creation
  if (text.includes('INSERT INTO users')) {
    const email = params[0];
    const displayName = params[2];
    const role = params[4];
    
    const user = {
      id: Date.now().toString(),
      email: email,
      display_name: displayName,
      role: role,
      password_hash: params[3],
      email_verified: params[5],
      mfa_enabled: false,
      login_attempts: 0,
      locked_until: null,
      account_locked: false,
      created_at: new Date(),
      updated_at: new Date(),
      preferences: {}
    };
    
    users.push(user);
    
    return {
      rows: [user],
      rowCount: 1
    };
  }
  
  // Mock user lookup
  if (text.includes('SELECT') && text.includes('FROM users')) {
    // Handle different select scenarios
    if (text.includes('WHERE email =')) {
      const email = params[0];
      const user = users.find(u => u.email === email);
      return {
        rows: user ? [user] : [],
        rowCount: user ? 1 : 0
      };
    }
    
    if (text.includes('WHERE id =')) {
      const id = params[0];
      const user = users.find(u => u.id === id);
      return {
        rows: user ? [user] : [],
        rowCount: user ? 1 : 0
      };
    }
    
    return {
      rows: users,
      rowCount: users.length
    };
  }
  
  // Mock update user login attempts
  if (text.includes('UPDATE users SET login_attempts')) {
    const userId = params[params.length - 1];
    const user = users.find(u => u.id === userId);
    
    if (user) {
      user.login_attempts = params[0];
      if (params.length > 2) {
        user.locked_until = params[1];
      }
    }
    
    return {
      rows: [],
      rowCount: 1
    };
  }
  
  // Mock refresh token storage
  if (text.includes('INSERT INTO refresh_tokens')) {
    const token = {
      id: Date.now().toString(),
      user_id: params[0],
      token: params[1],
      expires_at: params[2],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    tokens.push(token);
    
    return {
      rows: [token],
      rowCount: 1
    };
  }
  
  // Mock refresh token lookup and counting
  if (text.includes('SELECT') && text.includes('refresh_tokens')) {
    if (text.includes('COUNT')) {
      // Handle count query
      return {
        rows: [{ count: '0' }],
        rowCount: 1
      };
    }
    
    const token = tokens.find(t => t.user_id === params[0]);
    return {
      rows: token ? [token] : [],
      rowCount: token ? 1 : 0
    };
  }
  
  // Mock default response
  return {
    rows: [],
    rowCount: 0
  };
}

// Mock pool
export const pool = {} as Pool;
