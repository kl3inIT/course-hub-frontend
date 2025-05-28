# Mock API Setup and Usage Guide

This document provides comprehensive instructions for setting up and using the mock API system for the learning platform.

## Overview

The mock API system simulates a complete backend for the learning platform, providing:

- User authentication and management
- Course catalog and enrollment
- Transaction processing
- Analytics and reporting
- Notifications system
- Certificate management

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Ensure the following variables are set:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENABLE_MOCK_API=true
ENABLE_REAL_API=false
\`\`\`

### 2. Install Dependencies

The mock API uses only built-in Next.js features and doesn't require additional dependencies.

### 3. Start the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

The mock API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify authentication token

### Users

- `GET /api/users` - Get all users (with filters)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Courses

- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/[id]` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course
- `POST /api/courses/[id]/enroll` - Enroll in course

### Transactions

- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `POST /api/transactions/[id]/refund` - Process refund

### Analytics

- `GET /api/analytics` - Get analytics data
  - Query params: `type` (overview, user-growth, revenue, popular-courses, categories)
  - Query params: `period` (7d, 30d, 90d, 1y)

### Enrollments

- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments/[id]/progress` - Update lesson progress

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/[id]/read` - Mark notification as read

### Certificates

- `GET /api/certificates` - Get user certificates

## Demo Data

### Demo Accounts

The mock API includes the following demo accounts:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123` (or any 3+ characters)
- Role: Admin
- Access: Full system access

**Manager Account:**
- Email: `manager@example.com`
- Password: `manager123` (or any 3+ characters)
- Role: Manager
- Access: Course creation, student management, analytics

**Learner Account:**
- Email: `learner@example.com`
- Password: `learner123` (or any 3+ characters)
- Role: Learner
- Access: Course enrollment, learning materials

### Sample Courses

The mock API includes 6 sample courses:

1. React.js Fundamentals (Beginner, $99.99)
2. Advanced JavaScript Concepts (Advanced, $149.99)
3. UI/UX Design Fundamentals (Intermediate, $79.99)
4. Node.js Backend Development (Intermediate, $199.99)
5. Python for Data Science (Beginner, $129.99)
6. Mobile App Development with Flutter (Intermediate, $179.99)

### Sample Data Features

- Realistic user profiles with stats
- Course modules and lessons structure
- Transaction history with different statuses
- User enrollments with progress tracking
- Certificates for completed courses
- Notifications system
- Comprehensive analytics data

## Using the API Client

The project includes an API client (`lib/api-client.ts`) that provides a convenient interface:

\`\`\`typescript
import { apiClient } from '@/lib/api-client'

// Login
const result = await apiClient.login('admin@example.com', 'admin123')

// Get courses
const courses = await apiClient.getCourses({ category: 'Web Development' })

// Enroll in course
await apiClient.enrollInCourse('course-id', 'user-id')

// Get analytics
const analytics = await apiClient.getAnalytics('overview', '30d')
\`\`\`

## Testing the Mock API

### 1. Authentication Flow

\`\`\`bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Verify token (check cookies)
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Cookie: auth-token=mock-jwt-token-admin-1"
\`\`\`

### 2. Course Management

\`\`\`bash
# Get all courses
curl http://localhost:3000/api/courses

# Get course by ID
curl http://localhost:3000/api/courses/1

# Create new course
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"New Course","description":"Course description","price":99.99}'
\`\`\`

### 3. User Management

\`\`\`bash
# Get all users
curl http://localhost:3000/api/users

# Get users with filters
curl "http://localhost:3000/api/users?role=learner&search=john"
\`\`\`

## Switching to Real API

When you're ready to switch to a real backend API:

### 1. Update Environment Variables

\`\`\`env
ENABLE_MOCK_API=false
ENABLE_REAL_API=true
NEXT_PUBLIC_API_URL=https://your-real-api.com/api
\`\`\`

### 2. Update API Client

Modify `lib/api-client.ts` to:

- Add authentication headers (JWT tokens)
- Handle real error responses
- Add request/response interceptors
- Implement retry logic

### 3. Replace Mock API Routes

- Remove all files in `app/api/` directory
- Or conditionally disable them based on environment variables

### 4. Update Data Types

The TypeScript interfaces in `lib/mock-api/types.ts` can be reused with your real API, ensuring type safety during the transition.

## Troubleshooting

### Common Issues

1. **CORS Errors**: The mock API runs on the same domain, so CORS shouldn't be an issue. If you encounter CORS errors, check your API client configuration.

2. **Cookie Issues**: Make sure cookies are enabled in your browser for authentication to work properly.

3. **Data Persistence**: The mock API stores data in memory, so data will be lost when the server restarts. This is expected behavior for a mock API.

4. **Performance**: The mock API includes artificial delays to simulate real network conditions. You can adjust these in `lib/mock-api/api.ts`.

### Debug Mode

To enable debug logging, add this to your environment:

\`\`\`env
DEBUG=true
\`\`\`

This will log all API requests and responses to the console.

## Migration Path

The mock API is designed to be easily replaceable:

1. **Phase 1**: Use mock API for development and testing
2. **Phase 2**: Implement real backend API with same endpoints
3. **Phase 3**: Switch environment variables to use real API
4. **Phase 4**: Remove mock API files

The TypeScript interfaces and API client structure ensure a smooth transition between mock and real APIs.
