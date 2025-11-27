# Quick Start Guide - Integrated Platform

## Overview
✅ User Management Frontend (Port 3000) - Login with Google OAuth
✅ User Management Backend (Port 3001) - Clerk + Supabase
✅ Auction Management Backend (Port 3002) - Auction API
✅ Auction Management Frontend (Port 4002) - Auction Dashboard

## Setup & Run

### 1. Quick Environment Setup

**User Frontend:**
```bash
cd user/frontend
# Create .env.local from the Clerk keyless config
echo 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWFnaWNhbC1waGVhc2FudC04My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_huh35WHgxCz6nvpSvQMainmM1EO7jUEEFvg7FGiLCf' > .env.local
```

**User Backend:**
```bash
cd user/services/user-service
# Check .env file already exists with your Supabase credentials
```

**Auction Backend:**
```bash
cd "aution management/auction-service-backend"
# .env file already exists
```

**Auction Frontend:**
```bash
cd "aution management/auction-service-frontend"
# .env.local already exists
```

### 2. Start All Services (4 Terminals)

```bash
# Terminal 1 - User Frontend
cd user/frontend
npm run dev

# Terminal 2 - User Backend
cd user/services/user-service
npm run dev

# Terminal 3 - Auction Backend
cd "aution management/auction-service-backend"
npm run dev

# Terminal 4 - Auction Frontend
cd "aution management/auction-service-frontend"
npm run dev
```

## Test the Integration

1. Open browser: **http://localhost:3000**
2. Click **"Sign In"**
3. Login with **Google OAuth** or email/password
4. After login, you'll automatically be redirected to: **http://localhost:4002/dashboard?userId={id}&userEmail={email}**

## How It Works

### Login Flow Diagram
```
User visits localhost:3000
         ↓
Click "Sign In" → Clerk Authentication
         ↓
Google OAuth / Email Login
         ↓
Successful Authentication
         ↓
Redirect to /dashboard
         ↓
Dashboard page detects logged-in user
         ↓
Automatically redirect to:
localhost:4002/dashboard?userId={id}&userEmail={email}
         ↓
Land on Auction Dashboard with user info
```

### Key Implementation

**User Dashboard (`user/frontend/src/app/dashboard/page.tsx`):**
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

  return <div>Redirecting to Auction Platform...</div>;
}
```

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| User Frontend | 3000 | http://localhost:3000 |
| User Backend | 3001 | http://localhost:3001 |
| Auction Backend | 3002 | http://localhost:3002 |
| Auction Frontend | 4002 | http://localhost:4002 |

## Authentication Methods Available

- ✅ Email/Password
- ✅ Google OAuth
- ✅ Any other OAuth providers configured in Clerk

## Troubleshooting

**Issue: Redirect not working**
- Ensure all 4 services are running
- Check browser console for errors
- Verify ports are not already in use

**Issue: Cannot login**
- Check Clerk keys in `.env.local`
- Verify `.clerk/.tmp/keyless.json` exists

**Issue: Auction dashboard 404**
- Verify auction frontend is running on port 4002
- Check auction backend is running on port 3002

## Next Steps

- [ ] Sync user authentication state across both platforms
- [ ] Implement JWT-based authentication for auction API
- [ ] Add user profile synchronization
- [ ] Implement SSO session management

For detailed setup instructions, see `INTEGRATION_SETUP.md`
