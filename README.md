# User Context Platform

A complete **User Management System** implementing the User Context from the domain design. This platform handles user registration, authentication, profile management, and seller verification workflows.

## Project Scope

This project focuses **exclusively on the User Context** as defined in the domain design:
-  User registration and authentication
-  User profile management  
-  Role-based access control (BUYER, SELLER, ADMIN)
-  Seller verification workflow
-  Account verification and management

**Note:** Other contexts (Auction, Bidding, Notification) are intentionally **not included** in this implementation.

## Architecture

```
User Platform Architecture
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend          │    │   User Service      │    │   Database          │
│   (Next.js)         │◄──►│   (Express.js)      │◄──►│   (Supabase)        │
│   Port: 3001        │    │   Port: 3001        │    │   (PostgreSQL)      │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
         │                           │
         │                  ┌─────────────────────┐
         └─────────────────►│   Clerk Auth        │
                           │   (Cloud Service)    │
                           └─────────────────────┘
```

## Features Implemented

### User Entity (from Domain Design)
-  `userId: String` - Unique user identifier
-  `email: String` - User email address
-  `name: String` - User full name
-  `role: UserRole` - BUYER, SELLER, ADMIN roles
-  `isVerified: Boolean` - Account verification status

### User Methods (from Domain Design)
-  `register()` - User registration endpoint
-  `login()` - User login and authentication
-  `verifyAccount()` - Email/account verification

### Additional Features
-  **Profile Management** - Complete CRUD operations
-  **Seller Verification** - Business verification workflow
-  **Role-Based Permissions** - Access control system
-  **Admin Operations** - Seller approval system
-  **Caching** - Redis integration for performance

## Technology Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Clerk** - Authentication provider

### Backend
- **Node.js + Express.js** - REST API server
- **TypeScript** - Type-safe server development
- **Supabase** - PostgreSQL database with Row Level Security
- **Redis** - Caching and session management
- **Clerk** - Authentication integration

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Clerk account
- Redis (optional, for caching)

### 1. Database Setup
```bash
# Run the schema in your Supabase SQL editor
cat services/user-service/database/schema.sql
```

### 2. Environment Configuration

**Frontend (.env.local):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**User Service (.env):**
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
CLERK_SECRET_KEY=your_clerk_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3001
```

### 3. Installation & Startup

**Terminal 1 - User Service:**
```bash
cd services/user-service
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:3001
- **User Service API:** http://localhost:3001 (same port)
- **Health Check:** http://localhost:3001/health

## PI Endpoints

### Authentication & Registration
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/verify-account` - Verify account
- `GET /api/users/role` - Get user role and permissions

### Profile Management
- `GET /api/users/me` - Get current user profile
- `POST /api/users/profile` - Create/update user profile
- `PUT /api/users/profile` - Update user profile

### Seller Verification
- `POST /api/users/request-seller-verification` - Request seller verification
- `GET /api/users/verification-status` - Get verification status

### Admin Operations
- `POST /api/admin/approve-seller/:userId` - Approve/reject seller

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Register user (example)
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"clerkId":"clerk_123","email":"user@example.com","firstName":"John","lastName":"Doe"}'
```