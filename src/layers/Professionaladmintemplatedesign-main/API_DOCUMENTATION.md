# API Documentation for Admin Dashboard System

## Overview
This document provides comprehensive documentation for the RESTful API of the Admin Dashboard System. The API follows best practices for authentication, pagination, filtering, and error handling.

## Base URL
- **Development**: `http://localhost:3001/api`
- **Staging**: `https://staging.api.admindashboard.com/api`
- **Production**: `https://api.admindashboard.com/api`

## Authentication

### JWT Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the `Authorization` header:

```http
Authorization: Bearer <your-access-token>
```

#### Token Structure
- **Access Token**: Short-lived token (default: 1 hour)
- **Refresh Token**: Long-lived token (default: 24 hours)

#### Token Refresh

When the access token expires, use the refresh token to get a new access token:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### OAuth2 Integration

The system supports OAuth2 for third-party authentication:

```http
GET /api/auth/oauth/<provider>
```

Supported providers: `google`, `github`, `facebook`, `microsoft`

## API Endpoints

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user", "editor"]
  }
}
```

**Status Codes:**
- `200 OK`: Successful login
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure-password-123",
  "confirmPassword": "secure-password-123"
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2023-01-15T10:30:00Z",
  "roles": ["user"]
}
```

**Status Codes:**
- `201 Created`: User registered successfully
- `400 Bad Request`: Validation error
- `409 Conflict`: Email already exists

#### Logout

```http
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer <your-access-token>

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200 OK`: Successful logout
- `401 Unauthorized`: Invalid token

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <your-access-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user", "editor"],
  "permissions": ["data.read", "data.create"],
  "createdAt": "2023-01-15T10:30:00Z",
  "lastLogin": "2023-01-20T09:15:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token

### Users

#### List Users

```http
GET /api/users
Authorization: Bearer <your-access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (e.g., `name`, `email`, `createdAt`)
- `order`: Sort order (`asc` or `desc`, default: `asc`)
- `filter`: Filter criteria (e.g., `name:John`, `role:admin`)
- `search`: Search term (searches across multiple fields)

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["user"],
      "isActive": true,
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2023-01-15T10:30:00Z"
    },
    {
      "id": "87654321-e89b-12d3-a456-426614174000",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "roles": ["admin"],
      "isActive": true,
      "createdAt": "2023-01-10T08:45:00Z",
      "updatedAt": "2023-01-12T14:20:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

#### Get User

```http
GET /api/users/{id}
Authorization: Bearer <your-access-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["user", "editor"],
  "permissions": ["data.read", "data.create", "data.update"],
  "isActive": true,
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-01-15T10:30:00Z",
  "lastLogin": "2023-01-20T09:15:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: User not found

#### Create User

```http
POST /api/users
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "new@example.com",
  "password": "secure-password-123",
  "roles": ["user"],
  "isActive": true
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "New User",
  "email": "new@example.com",
  "roles": ["user"],
  "isActive": true,
  "createdAt": "2023-01-20T14:30:00Z",
  "updatedAt": "2023-01-20T14:30:00Z"
}
```

**Status Codes:**
- `201 Created`: User created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `409 Conflict`: Email already exists

#### Update User

```http
PUT /api/users/{id}
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "roles": ["user", "editor"],
  "isActive": true
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Name",
  "email": "updated@example.com",
  "roles": ["user", "editor"],
  "isActive": true,
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-01-20T14:30:00Z"
}
```

**Status Codes:**
- `200 OK`: User updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: User not found

#### Delete User

```http
DELETE /api/users/{id}
Authorization: Bearer <your-access-token>
```

**Status Codes:**
- `204 No Content`: User deleted successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: User not found

### Roles

#### List Roles

```http
GET /api/roles
Authorization: Bearer <your-access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (e.g., `name`, `createdAt`)
- `order`: Sort order (`asc` or `desc`, default: `asc`)

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Administrator",
      "description": "System administrator with full access",
      "isSystemRole": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    },
    {
      "id": "87654321-e89b-12d3-a456-426614174000",
      "name": "Editor",
      "description": "Can create and edit content",
      "isSystemRole": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

#### Get Role

```http
GET /api/roles/{id}
Authorization: Bearer <your-access-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Administrator",
  "description": "System administrator with full access",
  "isSystemRole": true,
  "permissions": [
    "user.create",
    "user.read",
    "user.update",
    "user.delete",
    "role.create",
    "role.read",
    "role.update",
    "role.delete",
    "data.create",
    "data.read",
    "data.update",
    "data.delete",
    "audit.read",
    "settings.read",
    "settings.update"
  ],
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Role not found

#### Create Role

```http
POST /api/roles
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "Content Manager",
  "description": "Manages content creation and publishing",
  "permissions": ["data.create", "data.read", "data.update"]
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Content Manager",
  "description": "Manages content creation and publishing",
  "isSystemRole": false,
  "permissions": ["data.create", "data.read", "data.update"],
  "createdAt": "2023-01-20T14:30:00Z",
  "updatedAt": "2023-01-20T14:30:00Z"
}
```

**Status Codes:**
- `201 Created`: Role created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `409 Conflict`: Role name already exists

#### Update Role

```http
PUT /api/roles/{id}
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "Content Manager",
  "description": "Updated description",
  "permissions": ["data.create", "data.read", "data.update", "data.delete"]
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Content Manager",
  "description": "Updated description",
  "isSystemRole": false,
  "permissions": ["data.create", "data.read", "data.update", "data.delete"],
  "createdAt": "2023-01-20T14:30:00Z",
  "updatedAt": "2023-01-20T15:45:00Z"
}
```

**Status Codes:**
- `200 OK`: Role updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission or trying to modify system role
- `404 Not Found`: Role not found

#### Delete Role

```http
DELETE /api/roles/{id}
Authorization: Bearer <your-access-token>
```

**Status Codes:**
- `204 No Content`: Role deleted successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission or trying to delete system role
- `404 Not Found`: Role not found

### Permissions

#### List Permissions

```http
GET /api/permissions
Authorization: Bearer <your-access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (e.g., `name`, `category`, `createdAt`)
- `order`: Sort order (`asc` or `desc`, default: `asc`)
- `category`: Filter by permission category

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "user.create",
      "description": "Create new users",
      "category": "User Management",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    },
    {
      "id": "87654321-e89b-12d3-a456-426614174000",
      "name": "user.read",
      "description": "View user information",
      "category": "User Management",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

### Data Entries

#### List Data Entries

```http
GET /api/data
Authorization: Bearer <your-access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (e.g., `title`, `createdAt`, `updatedAt`)
- `order`: Sort order (`asc` or `desc`, default: `desc`)
- `category`: Filter by category
- `tags`: Filter by tags (comma-separated)
- `isPublic`: Filter by public/private status
- `search`: Search term (searches title and description)

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Quarterly Report",
      "description": "Q1 2023 Financial Report",
      "category": "Financial",
      "tags": ["finance", "report", "q1"],
      "isPublic": false,
      "createdBy": {
        "id": "87654321-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2023-01-15T10:30:00Z"
    },
    {
      "id": "87654321-e89b-12d3-a456-426614174000",
      "title": "Marketing Plan",
      "description": "2023 Marketing Strategy",
      "category": "Marketing",
      "tags": ["marketing", "strategy"],
      "isPublic": true,
      "createdBy": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2023-01-10T08:45:00Z",
      "updatedAt": "2023-01-12T14:20:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

#### Get Data Entry

```http
GET /api/data/{id}
Authorization: Bearer <your-access-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Quarterly Report",
  "description": "Q1 2023 Financial Report",
  "data": {
    "revenue": 1000000,
    "expenses": 800000,
    "profit": 200000,
    "growth": 15.5
  },
  "category": "Financial",
  "tags": ["finance", "report", "q1"],
  "isPublic": false,
  "createdBy": {
    "id": "87654321-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Data entry not found

#### Create Data Entry

```http
POST /api/data
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "title": "New Report",
  "description": "Description of the report",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "category": "Financial",
  "tags": ["finance", "report"],
  "isPublic": false
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "New Report",
  "description": "Description of the report",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "category": "Financial",
  "tags": ["finance", "report"],
  "isPublic": false,
  "createdBy": {
    "id": "87654321-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2023-01-20T14:30:00Z",
  "updatedAt": "2023-01-20T14:30:00Z"
}
```

**Status Codes:**
- `201 Created`: Data entry created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

#### Update Data Entry

```http
PUT /api/data/{id}
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "title": "Updated Report",
  "description": "Updated description",
  "data": {
    "key1": "updated-value1",
    "key2": "updated-value2",
    "key3": "new-value"
  },
  "category": "Financial",
  "tags": ["finance", "report", "updated"],
  "isPublic": true
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Updated Report",
  "description": "Updated description",
  "data": {
    "key1": "updated-value1",
    "key2": "updated-value2",
    "key3": "new-value"
  },
  "category": "Financial",
  "tags": ["finance", "report", "updated"],
  "isPublic": true,
  "createdBy": {
    "id": "87654321-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-01-20T14:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Data entry updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Data entry not found

#### Delete Data Entry

```http
DELETE /api/data/{id}
Authorization: Bearer <your-access-token>
```

**Status Codes:**
- `204 No Content`: Data entry deleted successfully
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Data entry not found

### Audit Logs

#### List Audit Logs

```http
GET /api/audit-logs
Authorization: Bearer <your-access-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (e.g., `createdAt`, `action`, `entityType`)
- `order`: Sort order (`asc` or `desc`, default: `desc`)
- `userId`: Filter by user ID
- `action`: Filter by action type
- `entityType`: Filter by entity type
- `entityId`: Filter by entity ID
- `status`: Filter by status
- `dateFrom`: Filter by start date (ISO format)
- `dateTo`: Filter by end date (ISO format)

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": {
        "id": "87654321-e89b-12d3-a456-426614174000",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "user.create",
      "entityType": "user",
      "entityId": "999e4567-e89b-12d3-a456-426614174000",
      "oldValue": null,
      "newValue": {
        "name": "New User",
        "email": "new@example.com"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "status": "success",
      "createdAt": "2023-01-20T14:30:00Z"
    },
    {
      "id": "87654321-e89b-12d3-a456-426614174000",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "action": "data.update",
      "entityType": "data",
      "entityId": "555e4567-e89b-12d3-a456-426614174000",
      "oldValue": {
        "title": "Old Title"
      },
      "newValue": {
        "title": "Updated Title"
      },
      "ipAddress": "192.168.1.101",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "status": "success",
      "createdAt": "2023-01-20T14:25:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 10,
    "totalPages": 13
  }
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

#### Get Audit Log

```http
GET /api/audit-logs/{id}
Authorization: Bearer <your-access-token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user": {
    "id": "87654321-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "action": "user.create",
  "entityType": "user",
  "entityId": "999e4567-e89b-12d3-a456-426614174000",
  "oldValue": null,
  "newValue": {
    "name": "New User",
    "email": "new@example.com",
    "roles": ["user"]
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "status": "success",
  "metadata": {
    "requestId": "abc123",
    "duration": 150
  },
  "createdAt": "2023-01-20T14:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Audit log not found

### System Settings

#### Get System Settings

```http
GET /api/settings
Authorization: Bearer <your-access-token>
```

**Query Parameters:**
- `keys`: Comma-separated list of specific keys to retrieve

**Response:**
```json
{
  "settings": {
    "app.name": "Admin Dashboard System",
    "app.version": "1.0.0",
    "app.environment": "production",
    "auth.jwt.expiration": "3600",
    "auth.refresh_token.expiration": "86400",
    "rate_limiting.enabled": "true",
    "rate_limiting.window": "15",
    "rate_limiting.max_requests": "100"
  }
}
```

**Status Codes:**
- `200 OK`: Successful retrieval
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

#### Update System Settings

```http
PUT /api/settings
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "settings": {
    "app.environment": "staging",
    "rate_limiting.max_requests": "200"
  }
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "updatedSettings": {
    "app.environment": "staging",
    "rate_limiting.max_requests": "200"
  }
}
```

**Status Codes:**
- `200 OK`: Settings updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User doesn't have permission

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field1": "Specific error for field1",
      "field2": "Specific error for field2"
    },
    "timestamp": "2023-01-20T14:30:00Z",
    "requestId": "abc123-def456-ghi789"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_001` | 401 | Invalid credentials |
| `AUTH_002` | 401 | Invalid or expired token |
| `AUTH_003` | 403 | Insufficient permissions |
| `VALIDATION_001` | 400 | Validation error |
| `VALIDATION_002` | 400 | Required field missing |
| `NOT_FOUND_001` | 404 | Resource not found |
| `CONFLICT_001` | 409 | Resource already exists |
| `RATE_LIMIT_001` | 429 | Too many requests |
| `SERVER_001` | 500 | Internal server error |
| `SERVER_002` | 503 | Service unavailable |

### Example Error Responses

#### Validation Error

```json
{
  "error": {
    "code": "VALIDATION_001",
    "message": "Validation failed",
    "details": {
      "email": "Email must be a valid email address",
      "password": "Password must be at least 8 characters"
    },
    "timestamp": "2023-01-20T14:30:00Z",
    "requestId": "abc123-def456-ghi789"
  }
}
```

#### Authentication Error

```json
{
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": null,
    "timestamp": "2023-01-20T14:30:00Z",
    "requestId": "abc123-def456-ghi789"
  }
}
```

#### Rate Limiting Error

```json
{
  "error": {
    "code": "RATE_LIMIT_001",
    "message": "Too many requests from this IP, please try again later",
    "details": {
      "limit": 100,
      "window": "15 minutes",
      "retryAfter": 300
    },
    "timestamp": "2023-01-20T14:30:00Z",
    "requestId": "abc123-def456-ghi789"
  }
}
```

## Pagination

### Standard Pagination Format

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 3,
    "prevPage": 1
  }
}
```

### Pagination Query Parameters

- `page`: Current page number (1-based index)
- `limit`: Number of items per page (default: 10, max: 100)

### Example Paginated Request

```http
GET /api/users?page=2&limit=20
Authorization: Bearer <your-access-token>
```

## Filtering and Sorting

### Filtering

Filtering is supported on most list endpoints using the `filter` query parameter:

```http
GET /api/users?filter=name:John,role:admin
```

This would return users with name containing "John" AND role equal to "admin".

### Sorting

Sorting is supported using the `sort` and `order` query parameters:

```http
GET /api/users?sort=createdAt&order=desc
```

### Combined Example

```http
GET /api/data?page=1&limit=20&sort=createdAt&order=desc&filter=category:Financial,tags:report
```

## WebSocket API

### Connection

```javascript
const socket = new WebSocket('wss://api.admindashboard.com/ws');
```

### Message Format

All WebSocket messages follow this format:

```json
{
  "type": "event_type",
  "data": { ... },
  "timestamp": "2023-01-20T14:30:00Z",
  "requestId": "abc123-def456-ghi789"
}
```

### Supported Events

#### Authentication

```json
{
  "type": "authenticate",
  "data": {
    "token": "your-access-token"
  }
}
```

#### Data Updates

```json
{
  "type": "data.created",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "New Report",
    "createdBy": "87654321-e89b-12d3-a456-426614174000"
  }
}
```

#### User Updates

```json
{
  "type": "user.updated",
  "data": {
    "id": "87654321-e89b-12d3-a456-426614174000",
    "name": "Updated Name"
  }
}
```

#### Notifications

```json
{
  "type": "notification",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "info",
    "title": "New Message",
    "message": "You have a new message from John Doe"
  }
}
```

## Rate Limiting

### Default Limits

- **Anonymous Users**: 10 requests per 15 minutes
- **Authenticated Users**: 100 requests per 15 minutes
- **Admin Users**: 500 requests per 15 minutes

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 900
```

### Rate Limit Response

When the rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_001",
    "message": "Too many requests from this IP, please try again later",
    "details": {
      "limit": 100,
      "window": "15 minutes",
      "retryAfter": 300
    },
    "timestamp": "2023-01-20T14:30:00Z",
    "requestId": "abc123-def456-ghi789"
  }
}
```

## Security

### HTTPS
All API endpoints require HTTPS in production environments.

### CORS
The API implements CORS with the following defaults:
- Allowed Origins: Configured in environment variables
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization
- Max Age: 86400 (24 hours)

### Input Validation
All API inputs are validated according to the following rules:
- Required fields must be present
- Data types must match expected types
- String lengths must be within limits
- Email addresses must be valid
- Passwords must meet complexity requirements

### Security Headers
The API includes the following security headers:
- `Content-Security-Policy`: Prevents XSS attacks
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Enables XSS protection
- `Strict-Transport-Security`: Enforces HTTPS

## Versioning

### API Versioning Strategy
The API uses URL-based versioning:

```http
https://api.admindashboard.com/api/v1/users
```

### Version Support Policy
- Current version: Full support
- Previous version: Deprecated with 6 months notice
- Older versions: Not supported

### Deprecation Process
1. Announce deprecation in release notes
2. Add deprecation warning to API responses
3. Maintain deprecated version for 6 months
4. Remove deprecated version

## Changelog

### v1.0.0 (Current)
- Initial release
- All core endpoints implemented
- JWT authentication
- Role-based access control
- Pagination and filtering

### v0.9.0 (Beta)
- Initial beta release
- Basic user management
- Data entry endpoints
- Authentication system

## Support

### Contact Information
- **Email**: support@admindashboard.com
- **API Status Page**: https://status.admindashboard.com
- **Documentation**: https://docs.admindashboard.com

### Support Levels
- **Community**: Free support via GitHub issues
- **Standard**: Email support with 24-hour response time
- **Premium**: 24/7 phone and email support with 1-hour response time

## Appendix

### Data Types

| Type | Format | Example |
|------|--------|---------|
| UUID | RFC 4122 UUID | `123e4567-e89b-12d3-a456-426614174000` |
| DateTime | ISO 8601 | `2023-01-20T14:30:00Z` |
| Email | RFC 5322 | `user@example.com` |
| JSON | RFC 8259 | `{"key": "value"}` |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200 OK` | Successful request |
| `201 Created` | Resource created successfully |
| `204 No Content` | Successful request with no content |
| `400 Bad Request` | Invalid request format |
| `401 Unauthorized` | Authentication required |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource conflict |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |
| `503 Service Unavailable` | Service temporarily unavailable |

### Glossary

- **JWT**: JSON Web Token - A compact, URL-safe means of representing claims to be transferred between two parties
- **RBAC**: Role-Based Access Control - A method of regulating access to resources based on user roles
- **CORS**: Cross-Origin Resource Sharing - A mechanism that allows restricted resources on a web page to be requested from another domain
- **OAuth2**: An open standard for authorization commonly used as a way to grant websites or applications limited access to user information
- **WebSocket**: A computer communications protocol providing full-duplex communication channels over a single TCP connection

## OpenAPI Specification

The complete OpenAPI specification is available at:
- `/api/docs/openapi.json`
- `/api/docs/swagger-ui` (interactive documentation)

### OpenAPI Example

```yaml
openapi: 3.0.0
info:
  title: Admin Dashboard API
  description: API for the Admin Dashboard System
  version: 1.0.0
servers:
  - url: https://api.admindashboard.com/api/v1
    description: Production server
  - url: https://staging.api.admindashboard.com/api/v1
    description: Staging server
  - url: http://localhost:3001/api/v1
    description: Development server
paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    LoginRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
      required:
        - email
        - password
    LoginResponse:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        user:
          $ref: '#/components/schemas/User'
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        roles:
          type: array
          items:
            type: string
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string
              format: uuid
```

## Conclusion

This API documentation provides comprehensive information about the Admin Dashboard System's RESTful API. It covers authentication, all available endpoints, request/response formats, error handling, pagination, filtering, and more.

For any questions or issues, please contact the support team at support@admindashboard.com.