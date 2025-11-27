# User Service

The User Service handles all user-related operations in the auction platform, including user registration, profile management, and seller verification.

## Features (Based on Domain Design)

- ✅ **User Registration & Authentication**
  - User registration via `register()`
  - User login via `login()`
  - Account verification via `verifyAccount()`
  
- ✅ **User Role Management** 
  - UserRole enum: BUYER, SELLER, ADMIN
  - Role-based permissions system
  - User type validation

- ✅ **User Profile Management**
  - Complete profile CRUD operations
  - Profile validation and updates
  
- ✅ **Seller Verification Workflow**
  - Seller verification requests
  - Admin approval system
  - Business document handling
  
- ✅ **Integration & Performance**
  - Clerk authentication integration
  - Supabase database with RLS
  - Redis caching for performance

## API Endpoints

### Authentication & Registration
- `POST /api/users/register` - Register new user (register())
- `POST /api/users/login` - User login (login())  
- `POST /api/users/verify-account` - Verify account (verifyAccount())
- `GET /api/users/role` - Get user role and permissions

### User Profile Management
- `GET /api/users/me` - Get current user profile
- `POST /api/users/profile` - Create/update user profile
- `PUT /api/users/profile` - Update user profile

### Seller Verification
- `POST /api/users/request-seller-verification` - Submit seller verification request
- `GET /api/users/verification-status` - Get verification status

### Admin Operations
- `POST /api/admin/approve-seller/:userId` - Approve/reject seller verification

### Internal APIs

- `GET /api/users/:id` - Get user by ID (for service-to-service communication)

## Setup

### 1. Database Setup

Run the SQL schema in your Supabase project:

```bash
# Apply the schema
cat database/schema.sql | supabase db reset --db-url="your-supabase-url"
```

### 2. Environment Variables

Create `.env` file:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
CLERK_SECRET_KEY=your_clerk_secret
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3001
```

### 3. Install & Run

```bash
npm install
npm run dev
```

## Service Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───►│   User Service   │───►│   Supabase      │
│   (Clerk Auth)  │    │   (Express.js)   │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐
                       │   Redis Cache    │
                       │   (Optional)     │
                       └──────────────────┘
```

## Data Models

### User

```typescript
interface User {
  id: number;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "buyer" | "seller";
  phone?: string;
  address?: string;
  seller_verified: boolean;
  created_at: string;
  updated_at: string;
}
```

### Seller Verification Request

```typescript
interface VerificationRequest {
  id: number;
  user_id: number;
  business_license: string;
  tax_id: string;
  bank_account_details: object;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}
```

## Next Steps

This User Service is now **complete** and ready for:

1. **Testing**: All endpoints are implemented
2. **Integration**: Ready to integrate with other services
3. **Production**: Can be deployed independently

### Upcoming Services to Build:

1. **Auction Service** - Manage auctions and items
2. **Bidding Service** - Handle real-time bidding
3. **Notification Service** - Send notifications
4. **Payment Service** - Process payments

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Create user profile (requires auth)
curl -X POST http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer your_clerk_token" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","userType":"seller"}'
```
