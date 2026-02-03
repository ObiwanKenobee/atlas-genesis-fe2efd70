import { Pool } from 'pg';

// Default to mock database to avoid PostgreSQL dependency
console.log('Using mock database for testing');
const mockDb = require('./db.mock');

export const pool = mockDb.pool;
export const query = mockDb.query;

