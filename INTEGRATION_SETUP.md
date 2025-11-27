# User Management & Auction Platform Integration Guide

This guide explains how to set up and run the integrated platform with user authentication redirecting to the auction management system.

## Architecture Overview

### Services & Ports

1. **User Management Frontend** (Port 3000)
   - Next.js application with Clerk authentication
   - Handles user login (Email/Password, Google OAuth, etc.)
   - Automatically redirects to auction dashboard after login

2. **User Management Backend** (Port 3001)
   - Express.js API with Clerk integration
   - Manages user profiles and authentication
   - Stores user data in Supabase

3. **Auction Management Backend** (Port 3002)
   - Express.js API for auction operations
   - Handles auctions, bids, and items
   - Uses Supabase for data storage

4. **Auction Management Frontend** (Port 4002)
   - Next.js application for auction platform
   - Displays auctions, bidding interface, and rooms
   - Receives user info from login redirect

## Setup Instructions

### 1. Install Dependencies

```bash
# Install User Frontend dependencies
cd user/frontend
npm install

# Install User Backend dependencies
cd ../services/user-service
npm install

# Install Auction Backend dependencies
cd ../../../"aution management"/auction-service-backend
npm install

# Install Auction Frontend dependencies
cd ../auction-service-frontend
npm install
```

### 2. Configure Environment Variables

#### User Frontend (.env.local)
```bash
cd user/frontend
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- `CLERK_SECRET_KEY` - From Clerk Dashboard

#### User Backend (.env)
```bash
cd user/services/user-service
cp .env.example .env
# Edit .env with your configuration
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- `CLERK_SECRET_KEY` - From Clerk Dashboard

#### Auction Backend (.env)
```bash
cd "aution management"/auction-service-backend
# Check if .env exists, or create from .env.example
```

Required variables:
- `PORT=3002`
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

#### Auction Frontend (.env.local)
```bash
cd "aution management"/auction-service-frontend
# Edit .env.local
```

Should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_USER_ID=test-seller-123
```

### 3. Start All Services

You'll need 4 terminal windows:

#### Terminal 1: User Frontend
```bash
cd user/frontend
npm run dev
# Runs on http://localhost:3000
```

#### Terminal 2: User Backend
```bash
cd user/services/user-service
npm run dev
# Runs on http://localhost:3001
```

#### Terminal 3: Auction Backend
```bash
cd "aution management"/auction-service-backend
npm run dev
# Runs on http://localhost:3002
```

#### Terminal 4: Auction Frontend
```bash
cd "aution management"/auction-service-frontend
npm run dev
# Runs on http://localhost:4002
```

## How the Integration Works

### Login Flow

1. User visits `http://localhost:3000`
2. Clicks "Sign In" and authenticates via Clerk (Email/Password or Google OAuth)
3. After successful authentication, user is redirected to `/dashboard`
4. The dashboard page automatically redirects to: `http://localhost:4002/dashboard?userId={userId}&userEmail={email}`
5. User lands on the auction platform dashboard with their user info

### Code Implementation

The redirect is implemented in `user/frontend/src/app/dashboard/page.tsx`:

```typescript
export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const auctionDashboardUrl = new URL("http://localhost:4002/dashboard");
      auctionDashboardUrl.searchParams.set("userId", user.id);
      auctionDashboardUrl.searchParams.set("userEmail", user.primaryEmailAddress?.emailAddress || "");
      window.location.href = auctionDashboardUrl.toString();
    }
  }, [isLoaded, user]);

  return (
    <div>Redirecting to Auction Platform...</div>
  );
}
```

## Testing the Integration

1. **Start all 4 services** as described above
2. **Open browser** to `http://localhost:3000`
3. **Click "Sign In"** or "Get Started"
4. **Log in** using:
   - Email/Password (if registered)
   - Google OAuth
   - Other OAuth providers configured in Clerk
5. **Verify redirect** - You should be automatically redirected to `http://localhost:4002/dashboard`
6. **Check URL parameters** - The URL should contain userId and userEmail

## Troubleshooting

### Redirect not working
- Verify User Frontend is running on port 3000
- Verify Auction Frontend is running on port 4002
- Check browser console for errors
- Ensure Clerk is properly configured

### Authentication fails
- Check Clerk keys in `.env.local`
- Verify Clerk dashboard configuration
- Check User Backend is running on port 3001

### Auction dashboard not loading
- Verify Auction Frontend is running on port 4002
- Check Auction Backend is running on port 3002
- Verify .env files are correctly configured

## Production Considerations

For production deployment:

1. Update URLs in redirect code to use production domains
2. Configure proper CORS settings in both backends
3. Use environment variables for all URLs
4. Enable HTTPS for all services
5. Configure proper Clerk production environment
6. Set up proper database connections

## Next Steps

- Implement user session sharing between services
- Add JWT token validation in auction service
- Create unified user profile management
- Implement role-based access control across platforms
