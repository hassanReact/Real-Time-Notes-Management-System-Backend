# Notes Management API Documentation

Complete API documentation for frontend developers to implement the Notes Management System.

## 🌐 Base Configuration

- **Base URL**: `http://localhost:7200/api/v1`
- **API Documentation**: `http://localhost:7200/api/docs`
- **Authentication**: JWT /localhost:3 required for most endpoints
- **Content-Type*ttp`application/json`

## 🔐 Authentication Flow

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "USER",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 3. Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

### 4. Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 6. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## 👤 User Management

### 1. Get Current User Profile
**GET** `/users/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "profilePicture": "https://example.com/avatar.jpg",
    "role": "USER",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Update User Profile
**PUT** `/users/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+1987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe Updated",
    "phone": "+1987654321",
    "profilePicture": "https://example.com/avatar.jpg",
    "role": "USER",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T01:00:00.000Z"
  }
}
```

### 3. Upload Avatar
**POST** `/users/upload-avatar`

**Headers:** 
- `Authorization: Bearer {accessToken}`
- `Content-Type: multipart/form-data`

**Request Body:** Form data with `file` field (image file, max 5MB)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://example.com/avatars/user123.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

### 4. Search Users
**GET** `/users/search?query=john&limit=10`

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `query` (optional): Search term for name or email
- `limit` (optional): Maximum results (1-50, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://example.com/avatar.jpg"
    }
  ]
}
```

## 📝 Notes Management

### 1. Get All Notes
**GET** `/notes?page=1&limit=10&search=keyword&tags=work,personal&visibility=PRIVATE&sortBy=updatedAt&sortOrder=desc`

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-50, default: 10)
- `search` (optional): Search in title and content
- `tags` (optional): Filter by tags (comma-separated)
- `visibility` (optional): PRIVATE, SHARED, PUBLIC
- `authorId` (optional): Filter by author
- `sortBy` (optional): Field to sort by (default: updatedAt)
- `sortOrder` (optional): asc or desc (default: desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "My Note",
        "description": "Note content here",
        "visibility": "PRIVATE",
        "tags": ["work", "important"],
        "archived": false,
        "authorId": "uuid",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "author": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "noteUsers": [],
        "_count": {
          "versions": 1
        }
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 2. Create Note
**POST** `/notes`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "title": "My New Note",
  "description": "This is the note content",
  "tags": ["work", "important"],
  "visibility": "PRIVATE"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My New Note",
    "description": "This is the note content",
    "visibility": "PRIVATE",
    "tags": ["work", "important"],
    "archived": false,
    "authorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "versions": [],
    "sharedWith": []
  }
}
```

### 3. Get Single Note
**GET** `/notes/{noteId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Note",
    "description": "Note content",
    "visibility": "PRIVATE",
    "tags": ["work"],
    "archived": false,
    "authorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "versions": [
      {
        "id": "uuid",
        "noteId": "uuid",
        "title": "My Note",
        "content": "Note content",
        "version": 1,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "createdById": "uuid",
        "createdBy": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "sharedWith": []
  }
}
```

### 4. Update Note
**PATCH** `/notes/{noteId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "title": "Updated Note Title",
  "description": "Updated content",
  "tags": ["work", "updated"],
  "visibility": "SHARED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Note Title",
    "description": "Updated content",
    "visibility": "SHARED",
    "tags": ["work", "updated"],
    "archived": false,
    "authorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T01:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "versions": [],
    "sharedWith": []
  }
}
```

### 5. Delete Note
**DELETE** `/notes/{noteId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (204):** No content

### 6. Share Note
**POST** `/notes/{noteId}/share`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "userIds": ["uuid1", "uuid2"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Shared Note",
    "description": "Note content",
    "visibility": "SHARED",
    "tags": ["work"],
    "archived": false,
    "authorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "sharedWith": [
      {
        "userId": "uuid2",
        "permission": "VIEW",
        "user": {
          "id": "uuid2",
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      }
    ]
  }
}
```

### 7. Get Note Versions
**GET** `/notes/{noteId}/versions`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "noteId": "uuid",
      "title": "Note Title v2",
      "content": "Updated content",
      "version": 2,
      "createdAt": "2023-01-01T01:00:00.000Z",
      "createdById": "uuid",
      "createdBy": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "uuid2",
      "noteId": "uuid",
      "title": "Note Title v1",
      "content": "Original content",
      "version": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "createdById": "uuid",
      "createdBy": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 8. Restore Note Version
**POST** `/notes/{noteId}/versions/{version}/restore`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Restored Note Title",
    "description": "Restored content",
    "visibility": "PRIVATE",
    "tags": ["work"],
    "archived": false,
    "authorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T02:00:00.000Z",
    "author": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "versions": [],
    "sharedWith": []
  }
}
```

## 🔔 Notifications

### 1. Get Notifications
**GET** `/notifications?page=1&limit=20&type=NOTE_SHARED&isRead=false`

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-100, default: 20)
- `type` (optional): NOTE_SHARED, NOTE_UPDATED, SYSTEM
- `isRead` (optional): true/false filter
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc/desc (default: desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "NOTE_SHARED",
        "title": "Note Shared",
        "message": "John Doe shared a note 'My Important Note' with you",
        "metadata": {
          "noteId": "uuid",
          "sharedByUserId": "uuid"
        },
        "read": false,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "user": {
          "id": "uuid",
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### 2. Mark Notification as Read
**POST** `/notifications/{notificationId}/read`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "type": "NOTE_SHARED",
    "title": "Note Shared",
    "message": "John Doe shared a note 'My Important Note' with you",
    "data": {
      "noteId": "uuid",
      "sharedByUserId": "uuid"
    },
    "isRead": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
}
```

### 3. Mark All Notifications as Read
**POST** `/notifications/read-all`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  },
  "message": "All notifications marked as read"
}
```

### 4. Get Unread Count
**GET** `/notifications/unread-count`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### 5. Delete Notification
**DELETE** `/notifications/{notificationId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (204):** No content

## 👑 Admin Endpoints (ADMIN Role Required)

### 1. Get System Statistics
**GET** `/admin/stats`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 140,
      "inactive": 10
    },
    "notes": {
      "total": 500,
      "public": 50,
      "shared": 200,
      "private": 250
    },
    "notifications": {
      "total": 1000,
      "unread": 100,
      "read": 900
    }
  }
}
```

### 2. Get All Users (Admin)
**GET** `/admin/users?page=1&limit=10`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "USER",
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "_count": {
          "notes": 5
        }
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### 3. Toggle User Status
**POST** `/admin/users/{userId}/toggle-status`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T01:00:00.000Z"
  }
}
```

### 4. Change User Role
**POST** `/admin/users/{userId}/change-role`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T01:00:00.000Z"
  }
}
```

### 5. Delete User (Admin)
**DELETE** `/admin/users/{userId}`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (204):** No content

### 6. Get All Notes (Admin)
**GET** `/admin/notes?page=1&limit=10`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Note Title",
        "description": "Note content",
        "visibility": "PRIVATE",
        "tags": ["work"],
        "archived": false,
        "authorId": "uuid",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "author": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "_count": {
          "versions": 1,
          "sharedWith": 0
        }
      }
    ],
    "meta": {
      "total": 500,
      "page": 1,
      "limit": 10,
      "totalPages": 50
    }
  }
}
```

### 7. Delete Note (Admin)
**DELETE** `/admin/notes/{noteId}`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (204):** No content

### 8. Get Recent Activity
**GET** `/admin/activity?limit=10`

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recentNotes": [
      {
        "id": "uuid",
        "title": "Recent Note",
        "description": "Content",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "author": {
          "name": "John Doe"
        }
      }
    ],
    "recentUsers": [
      {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 🏥 Health Check

### Health Status
**GET** `/health`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "uptime": 12345,
    "environment": "development"
  }
}
```

## 🌐 WebSocket Events (Real-time)

**Connection URL:** `ws://localhost:7200/notifications`

**Authentication:** Send JWT token in connection handshake:
```javascript
const socket = io('http://localhost:7200/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events to Listen:
- `connected` - Connection successful
- `notification` - New notification received
- `note-updated` - Note was updated
- `system-message` - System-wide message

### Events to Emit:
- `join-room` - Join specific room
- `leave-room` - Leave specific room

## 🚨 Error Responses

All endpoints return consistent error format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      }
    ]
  },
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "message": "Unauthorized",
    "details": "Invalid or expired token"
  },
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/v1/users/profile"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "statusCode": 403,
    "message": "Forbidden",
    "details": "Insufficient permissions"
  },
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/v1/admin/users"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Not Found",
    "details": "Note not found"
  },
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/v1/notes/invalid-id"
}
```

## 📋 Implementation Notes

### Token Management:
1. Store `accessToken` and `refreshToken` after login
2. Include `Authorization: Bearer {accessToken}` in all protected requests
3. Refresh token when you get 401 response
4. Clear tokens on logout

### Pagination:
- Most list endpoints support pagination with `page` and `limit` parameters
- Response includes `meta` object with pagination info

### File Upload:
- Use `multipart/form-data` for file uploads
- Maximum file size: 5MB
- Allowed types: JPEG, PNG, GIF

### Real-time Features:
- Connect to WebSocket for live notifications
- Handle connection/disconnection events
- Listen for real-time updates

### Error Handling:
- Always check `success` field in response
- Handle different HTTP status codes appropriately
- Display user-friendly error messages

This documentation covers all available endpoints. Use the interactive Swagger documentation at `http://localhost:7200/api/docs` for testing and more details.