# Testing Strategy for Admin Dashboard System

## Overview
This document outlines the comprehensive testing strategy for the admin dashboard system, covering unit tests, integration tests, end-to-end tests, and performance tests. The strategy ensures code quality, reliability, and maintainability.

## Testing Pyramid

```plaintext
        /\        
       /  \       
      /    \      
     /      \     
    /        \    
   /          \   
  /            \  
 /              \ 
/                \
-----------------
   End-to-End    
    (UI Tests)    
-----------------
  Integration    
    (API Tests)    
-----------------
     Unit         
  (Component)    
-----------------
```

## Test Coverage Goals
- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: 70%+ code coverage
- **End-to-End Tests**: Critical user flows covered
- **Performance Tests**: Baseline metrics established

## Testing Tools

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Storybook + Jest
- **End-to-End Tests**: Cypress or Playwright
- **Visual Regression**: Percy or Chromatic

### Backend Testing
- **Unit Tests**: Jest
- **Integration Tests**: Supertest + Jest
- **API Testing**: Postman/Newman
- **Database Testing**: Custom scripts with test database

### Performance Testing
- **Load Testing**: k6 or Artillery
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Test Environment Setup

### Development Environment
- Local development with hot reloading
- Mock API endpoints for frontend development
- Test database instance

### CI/CD Pipeline
- Automated test execution on every commit
- Parallel test execution for faster feedback
- Test coverage reporting

### Staging Environment
- Mirror of production environment
- Integration testing with real services
- Performance testing

### Production Environment
- Monitoring and alerting
- Error tracking (Sentry)
- Feature flags for gradual rollouts

## Unit Testing

### Frontend Unit Tests

#### Example: Testing React Components

Create a test file for a component at `src/components/common/Button.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-indigo-600');
  });

  it('renders with custom props', () => {
    render(
      <Button variant="secondary" size="small">
        Custom Button
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('px-3 py-1');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50 cursor-not-allowed');
  });
});
```

#### Example: Testing Custom Hooks

Create a test file for a custom hook at `src/hooks/useCounter.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter Hook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(4);
  });

  it('should reset count', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    expect(result.current.count).toBe(5);
  });

  it('should set count to specific value', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.setCount(10);
    });
    expect(result.current.count).toBe(10);
  });
});
```

### Backend Unit Tests

#### Example: Testing API Controllers

Create a test file for a controller at `server/controllers/usersController.test.ts`:

```typescript
import { Request, Response } from 'express';
import { getUsers, createUser } from '../controllers/usersController';
import { Pool } from 'pg';

// Mock the database pool
jest.mock('pg', () => {
  const mockQuery = jest.fn();
  return {
    Pool: jest.fn(() => ({ query: mockQuery }));
  };
});

describe('Users Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockPool: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockPool = new Pool();
  });

  describe('getUsers', () => {
    it('should return users from database', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ];

      mockPool.query.mockResolvedValue({ rows: mockUsers });

      await getUsers(mockRequest as Request, mockResponse as Response, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      mockPool.query.mockRejectedValue(mockError);

      await getUsers(mockRequest as Request, mockResponse as Response, mockPool);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = { name: 'New User', email: 'new@example.com', password: 'password123' };
      const mockCreatedUser = { id: '3', ...mockUser };

      mockRequest.body = mockUser;
      mockPool.query.mockResolvedValue({ rows: [mockCreatedUser] });

      await createUser(mockRequest as Request, mockResponse as Response, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [mockUser.name, mockUser.email, expect.any(String)]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedUser);
    });

    it('should handle validation errors', async () => {
      const mockUser = { name: '', email: 'invalid-email', password: 'short' };
      mockRequest.body = mockUser;

      await createUser(mockRequest as Request, mockResponse as Response, mockPool);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Validation error' });
    });
  });
});
```

#### Example: Testing Utility Functions

Create a test file for utility functions at `src/utils/helpers.test.ts`:

```typescript
import { formatDate, calculatePercentage, validateEmail } from './helpers';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-15T10:30:00');
      expect(formatDate(date)).toBe('January 15, 2023');
    });

    it('should handle invalid date', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 200)).toBe(25);
      expect(calculatePercentage(75, 300)).toBe(25);
    });

    it('should handle division by zero', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@sub.domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });
});
```

## Integration Testing

### API Integration Tests

#### Example: Testing API Endpoints

Create a test file for API endpoints at `server/__tests__/api.test.ts`:

```typescript
import request from 'supertest';
import app from '../index';
import { Pool } from 'pg';

describe('API Integration Tests', () => {
  let pool: Pool;
  let testUserId: string;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create a test user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['Test User', 'test@example.com', 'hashed-password']
    );
    testUserId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await pool.end();
  });

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);

      // Clean up
      await pool.query('DELETE FROM users WHERE id = $1', [response.body.id]);
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        name: '',
        email: 'invalid-email',
        password: 'short',
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(200);

      expect(response.body.id).toBe(testUserId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.email).toBe(updatedData.email);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      // Create a user to delete
      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
        ['Delete User', 'delete@example.com', 'hashed-password']
      );
      const deleteUserId = result.rows[0].id;

      await request(app)
        .delete(`/api/users/${deleteUserId}`)
        .expect(204);

      // Verify deletion
      const checkResult = await pool.query('SELECT * FROM users WHERE id = $1', [deleteUserId]);
      expect(checkResult.rows.length).toBe(0);
    });
  });
});
```

### Database Integration Tests

#### Example: Testing Database Operations

Create a test file for database operations at `server/__tests__/database.test.ts`:

```typescript
import { Pool } from 'pg';

describe('Database Operations', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('User Operations', () => {
    it('should create and retrieve a user', async () => {
      const testUser = {
        name: 'Test User',
        email: 'test-database@example.com',
        password_hash: 'hashed-password',
      };

      // Insert user
      const insertResult = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [testUser.name, testUser.email, testUser.password_hash]
      );

      const createdUser = insertResult.rows[0];
      expect(createdUser).toHaveProperty('id');
      expect(createdUser.name).toBe(testUser.name);
      expect(createdUser.email).toBe(testUser.email);

      // Retrieve user
      const selectResult = await pool.query('SELECT * FROM users WHERE id = $1', [createdUser.id]);
      const retrievedUser = selectResult.rows[0];
      expect(retrievedUser.id).toBe(createdUser.id);
      expect(retrievedUser.name).toBe(testUser.name);

      // Clean up
      await pool.query('DELETE FROM users WHERE id = $1', [createdUser.id]);
    });

    it('should handle unique constraint violations', async () => {
      const duplicateEmail = 'duplicate@example.com';

      // Insert first user
      await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
        ['First User', duplicateEmail, 'hashed-password']
      );

      // Try to insert second user with same email
      await expect(
        pool.query(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
          ['Second User', duplicateEmail, 'hashed-password']
        )
      ).rejects.toThrow();

      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', [duplicateEmail]);
    });
  });

  describe('Transaction Operations', () => {
    it('should handle transactions correctly', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Insert a user
        const userResult = await client.query(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
          ['Transaction User', 'transaction@example.com', 'hashed-password']
        );
        const userId = userResult.rows[0].id;

        // Insert a data entry for the user
        await client.query(
          'INSERT INTO data_entries (user_id, title, data) VALUES ($1, $2, $3)',
          [userId, 'Test Entry', { key: 'value' }]
        );

        await client.query('COMMIT');

        // Verify both operations succeeded
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        expect(userCheck.rows.length).toBe(1);

        const dataCheck = await pool.query('SELECT * FROM data_entries WHERE user_id = $1', [userId]);
        expect(dataCheck.rows.length).toBe(1);

        // Clean up
        await pool.query('DELETE FROM data_entries WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });

    it('should rollback on error', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Insert a user
        const userResult = await client.query(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
          ['Rollback User', 'rollback@example.com', 'hashed-password']
        );
        const userId = userResult.rows[0].id;

        // This will cause an error (duplicate email)
        await client.query(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
          ['Duplicate User', 'rollback@example.com', 'hashed-password']
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        // Verify rollback worked
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['rollback@example.com']);
        expect(userCheck.rows.length).toBe(0);
      } finally {
        client.release();
      }
    });
  });
});
```

## End-to-End Testing

### Example: Testing User Flows

Create a test file for user flows at `cypress/integration/userFlows.spec.ts`:

```typescript
describe('User Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should allow a user to login successfully', () => {
    // Mock API response
    cy.intercept('POST', '/api/auth/login', {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
    }).as('loginRequest');

    // Fill in login form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for API call and redirect
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');

    // Verify user is logged in
    cy.getCookie('accessToken').should('exist');
    cy.contains('Welcome, Test User').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    // Mock API error response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest');

    // Fill in login form with invalid credentials
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for API call
    cy.wait('@loginRequest');

    // Verify error message is shown
    cy.contains('Invalid email or password').should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('should allow password reset', () => {
    cy.contains('Forgot your password?').click();
    cy.url().should('include', '/auth/forgot-password');

    // Fill in email for password reset
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();

    // Mock API response
    cy.intercept('POST', '/api/auth/forgot-password', {
      message: 'Password reset email sent',
    }).as('forgotPasswordRequest');

    cy.wait('@forgotPasswordRequest');
    cy.contains('Password reset email sent').should('be.visible');
  });
});

describe('User Management Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('admin@example.com', 'adminpassword');
    cy.visit('/admin/users');
  });

  it('should display user list', () => {
    // Mock API response
    cy.intercept('GET', '/api/users', {
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      ],
      pagination: { total: 2, page: 1, limit: 10 },
    }).as('getUsers');

    cy.wait('@getUsers');
    cy.contains('John Doe').should('be.visible');
    cy.contains('Jane Smith').should('be.visible');
  });

  it('should create a new user', () => {
    // Mock API response
    cy.intercept('POST', '/api/users', {
      id: '3',
      name: 'New User',
      email: 'new@example.com',
      role: 'user',
    }).as('createUser');

    // Fill in new user form
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('select[name="role"]').select('user');

    // Submit form
    cy.get('button[type="submit"]').contains('Create User').click();

    cy.wait('@createUser');
    cy.contains('New User').should('be.visible');
  });

  it('should edit an existing user', () => {
    // Mock API responses
    cy.intercept('GET', '/api/users/1', {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    }).as('getUser');

    cy.intercept('PUT', '/api/users/1', {
      id: '1',
      name: 'John Updated',
      email: 'john.updated@example.com',
      role: 'admin',
    }).as('updateUser');

    // Click edit button
    cy.contains('John Doe').parent().within(() => {
      cy.contains('Edit').click();
    });

    cy.wait('@getUser');

    // Update user details
    cy.get('input[name="name"]').clear().type('John Updated');
    cy.get('input[name="email"]').clear().type('john.updated@example.com');

    // Submit form
    cy.get('button[type="submit"]').contains('Update User').click();

    cy.wait('@updateUser');
    cy.contains('John Updated').should('be.visible');
  });

  it('should delete a user', () => {
    // Mock API response
    cy.intercept('DELETE', '/api/users/2', { statusCode: 204 }).as('deleteUser');

    // Click delete button
    cy.contains('Jane Smith').parent().within(() => {
      cy.contains('Delete').click();
    });

    // Confirm deletion
    cy.get('button').contains('Confirm').click();

    cy.wait('@deleteUser');
    cy.contains('Jane Smith').should('not.exist');
  });
});

describe('Data Management Flow', () => {
  beforeEach(() => {
    cy.login('editor@example.com', 'editorpassword');
    cy.visit('/data');
  });

  it('should display data entries', () => {
    // Mock API response
    cy.intercept('GET', '/api/data', {
      data: [
        { id: '1', title: 'First Entry', description: 'First data entry' },
        { id: '2', title: 'Second Entry', description: 'Second data entry' },
      ],
      pagination: { total: 2, page: 1, limit: 10 },
    }).as('getData');

    cy.wait('@getData');
    cy.contains('First Entry').should('be.visible');
    cy.contains('Second Entry').should('be.visible');
  });

  it('should create a new data entry', () => {
    // Mock API response
    cy.intercept('POST', '/api/data', {
      id: '3',
      title: 'New Entry',
      description: 'New data entry',
    }).as('createData');

    // Fill in new data form
    cy.get('input[name="title"]').type('New Entry');
    cy.get('textarea[name="description"]').type('New data entry');

    // Submit form
    cy.get('button[type="submit"]').contains('Create Entry').click();

    cy.wait('@createData');
    cy.contains('New Entry').should('be.visible');
  });

  it('should filter and sort data entries', () => {
    // Mock API responses
    cy.intercept('GET', '/api/data?sort=title&order=asc', {
      data: [
        { id: '2', title: 'Second Entry', description: 'Second data entry' },
        { id: '1', title: 'First Entry', description: 'First data entry' },
      ],
      pagination: { total: 2, page: 1, limit: 10 },
    }).as('getSortedData');

    // Click sort button
    cy.contains('Sort by Title').click();

    cy.wait('@getSortedData');
    cy.get('table tbody tr').first().should('contain', 'First Entry');
  });
});
```

## Performance Testing

### Load Testing with k6

Create a load test script at `tests/load/basic_load_test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const responseTimeTrend = new Trend('response_time');
const errorRate = new Rate('error_rate');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Ramp-up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{type:api}': ['p(95)<500'],
    'http_req_duration{type:static}': ['p(95)<200'],
    errors: ['rate<0.01'], // Error rate should be less than 1%
  },
};

// Environment variables
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001/api';
const FRONTEND_BASE_URL = __ENV.FRONTEND_BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' },
  { email: 'user3@example.com', password: 'password123' },
];

// Setup - Authenticate and get access token
export function setup() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  const loginResponse = http.post(`${API_BASE_URL}/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status !== 200) {
    console.error('Login failed:', loginResponse.body);
    return null;
  }

  const { accessToken } = JSON.parse(loginResponse.body);
  return { accessToken };
}

// Main test function
export default function (data) {
  if (!data || !data.accessToken) {
    console.error('No access token available');
    return;
  }

  const { accessToken } = data;

  // Test API endpoints
  const endpoints = [
    { method: 'GET', url: `${API_BASE_URL}/users`, type: 'api' },
    { method: 'GET', url: `${API_BASE_URL}/data`, type: 'api' },
    { method: 'GET', url: `${FRONTEND_BASE_URL}/`, type: 'static' },
    { method: 'GET', url: `${FRONTEND_BASE_URL}/dashboard`, type: 'static' },
  ];

  endpoints.forEach((endpoint) => {
    const params = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const startTime = Date.now();
    const response = http.request(endpoint.method, endpoint.url, null, params);
    const duration = Date.now() - startTime;

    // Track metrics
    responseTimeTrend.add(duration, { type: endpoint.type });
    errorRate.add(response.status >= 400);

    // Check response
    const success = check(response, {
      [`${endpoint.method} ${endpoint.url} status is 200`]: (r) => r.status === 200,
      [`${endpoint.method} ${endpoint.url} response time < 500ms`]: (r) => duration < 500,
    });

    if (!success) {
      console.error(`${endpoint.method} ${endpoint.url} failed:`, response.body);
    }

    sleep(1); // Add think time between requests
  });
}

// Teardown
export function teardown(data) {
  if (data && data.accessToken) {
    http.post(`${API_BASE_URL}/auth/logout`, JSON.stringify({ token: data.accessToken }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### Performance Test Scenarios

#### 1. Basic Load Test
- **Objective**: Establish baseline performance metrics
- **Users**: 50-100 concurrent users
- **Duration**: 2-3 minutes
- **Metrics**: Response times, error rates, throughput

#### 2. Stress Test
- **Objective**: Identify breaking points and bottlenecks
- **Users**: 200-500 concurrent users
- **Duration**: 5 minutes
- **Metrics**: System resource usage, error rates, response degradation

#### 3. Soak Test
- **Objective**: Identify memory leaks and performance degradation
- **Users**: 100 concurrent users
- **Duration**: 1-2 hours
- **Metrics**: Memory usage, response time trends, error rates

#### 4. Spike Test
- **Objective**: Test system response to sudden traffic spikes
- **Users**: 0 to 500 users in 30 seconds, then back to 0
- **Duration**: 2 minutes
- **Metrics**: Response times during spike, recovery time

### Performance Test Execution

```bash
# Run basic load test
k6 run tests/load/basic_load_test.js

# Run stress test
k6 run --stage 30s:100,5m:500,30s:0 tests/load/stress_test.js

# Run soak test
k6 run --duration 1h tests/load/soak_test.js

# Run spike test
k6 run --stage 30s:0,30s:500,30s:0 tests/load/spike_test.js
```

## Test Automation

### CI/CD Integration

Example GitHub Actions workflow for automated testing:

```yaml
name: Automated Testing

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run ESLint
        run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm run test:unit
      - name: Upload coverage report
        uses: actions/upload-artifact@v2
        with:
          name: coverage-report
          path: coverage/

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: admin_dashboard
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/admin_dashboard
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Start backend server
        run: npm run start:backend &
      - name: Wait for backend to be ready
        run: sleep 10
      - name: Run Cypress tests
        uses: cypress-io/github-action@v2
        with:
          start: npm run start:frontend
          wait-on: 'http://localhost:3000'

  performance-tests:
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Start backend server
        run: npm run start:backend &
      - name: Wait for backend to be ready
        run: sleep 10
      - name: Run performance tests
        run: npm run test:performance
      - name: Upload performance report
        uses: actions/upload-artifact@v2
        with:
          name: performance-report
          path: performance-results/

  report:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests, e2e-tests, performance-tests]
    if: always()
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v2
        with:
          path: artifacts
      - name: Generate test report
        run: npm run generate:report
      - name: Upload test report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: test-report/
```

## Test Reporting

### Test Coverage Reports

Configure Jest to generate coverage reports:

```json
{
  "jest": {
    "coverageDirectory": "coverage",
    "coverageReporters": ["json", "lcov", "text", "clover"],
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/index.ts",
      "!src/**/types.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Performance Reports

Generate performance reports with k6:

```bash
# Generate HTML report
k6 run --out json=performance-results.json tests/load/basic_load_test.js
k6 html performance-results.json > performance-report.html

# Generate CSV report
k6 run --out csv=performance-results.csv tests/load/basic_load_test.js
```

### Test Dashboard

Example test dashboard configuration using Grafana:

1. **Data Sources**:
   - Prometheus for performance metrics
   - PostgreSQL for test results
   - Elasticsearch for logs

2. **Dashboards**:
   - Test execution overview
   - Performance metrics
   - Error trends
   - Test coverage trends

## Best Practices

### Test Organization
- Keep tests close to the code they test
- Use clear naming conventions (e.g., `Component.test.tsx`)
- Group related tests together
- Keep test files small and focused

### Test Quality
- Write deterministic tests (no randomness)
- Test one thing per test case
- Use descriptive test names
- Avoid test interdependencies
- Keep tests fast and isolated

### Test Maintenance
- Update tests when requirements change
- Remove obsolete tests
- Refactor tests along with production code
- Keep test data up to date

### Test Performance
- Mock external dependencies
- Use test databases
- Parallelize test execution
- Cache test dependencies

## Conclusion

This comprehensive testing strategy ensures that the admin dashboard system is thoroughly tested at all levels, from individual components to complete user flows. By implementing unit tests, integration tests, end-to-end tests, and performance tests, we can maintain high code quality, catch bugs early, and ensure a reliable user experience.

The strategy includes:
- **Unit Testing**: Fast, isolated tests for individual components
- **Integration Testing**: Tests for API endpoints and database interactions
- **End-to-End Testing**: Complete user flow testing
- **Performance Testing**: Load, stress, and soak testing
- **Automation**: CI/CD integration for continuous testing
- **Reporting**: Comprehensive test coverage and performance reports

By following these best practices and maintaining a strong test suite, we can ensure the admin dashboard system remains stable, performant, and maintainable throughout its lifecycle.