# Microservices Integration Guide

This guide explains how to integrate your Auction Service with other team services.

## 🎯 Services Overview

| Service | Port | Owner | Provides |
|---------|------|-------|----------|
| User Management | 3001 | Friend 1 | User auth, seller verification |
| Auction Service | 3002 | **You** | Auctions, rooms, items |
| Bidding Service | 3003 | Friend 2 | Real-time bidding |
| Notification Service | 3004 | Friend 3 | Push notifications |
| Email Service | 3005 | Friend 4 | Email alerts |

## 🔌 Integration Methods

### Method 1: Direct Service-to-Service (Current)

Each service calls others directly via HTTP.

**Pros:**
- Simple to implement
- Already working in your code
- No additional setup

**Cons:**
- Need to know all service URLs
- Services must all be running

**Your .env file:**
```env
USER_SERVICE_URL=http://localhost:3001
BIDDING_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
EMAIL_SERVICE_URL=http://localhost:3005
```

### Method 2: API Gateway (Recommended)

Single entry point that routes to all services.

**Create gateway at port 8000:**

```javascript
// gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Route to services
app.use('/api/users', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

app.use('/api/auctions', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

app.use('/api/bids', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true
}));

app.use('/api/notifications', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true
}));

app.use('/api/emails', createProxyMiddleware({
  target: 'http://localhost:3005',
  changeOrigin: true
}));

app.listen(8000, () => {
  console.log('API Gateway running on port 8000');
});
```

**Frontend now only needs:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📡 API Contracts (What Each Service Needs)

### 1. User Service → Auction Service

**What Auction Service needs from User Service:**

```javascript
// GET /api/users/:userId
// Response:
{
  "id": "user-123",
  "email": "seller@example.com",
  "role": "SELLER",
  "is_verified": true,
  "name": "John Doe"
}
```

**Used in:** `auction-service-backend/src/middlewares/auth.js:48`

### 2. Auction Service → Bidding Service

**What Bidding Service needs from Auction Service:**

```javascript
// GET /api/auctions/:id
// Response:
{
  "id": "auction-123",
  "status": "ACTIVE",
  "current_highest_bid": 5000,
  "reserve_price": 10000,
  "room_code": "A3X9K2L7",
  "seller_id": "user-123"
}

// GET /api/auctions/room/:roomCode
// Same response as above
```

**Bidding Service can:**
- Check if auction is ACTIVE before accepting bids
- Validate bid amounts against current_highest_bid
- Update auction via: `PUT /api/auctions/:id { current_highest_bid: 6000 }`

### 3. Auction Service → Notification Service

**When to notify:**

```javascript
// When auction status changes
POST /api/notifications
{
  "type": "AUCTION_STATUS_CHANGE",
  "auction_id": "auction-123",
  "status": "ACTIVE",
  "seller_id": "user-123",
  "message": "Your auction is now live!"
}

// When auction gets a new bid
POST /api/notifications
{
  "type": "NEW_BID",
  "auction_id": "auction-123",
  "room_code": "A3X9K2L7",
  "bid_amount": 6000,
  "seller_id": "user-123"
}
```

### 4. Notification Service → Email Service

```javascript
// Send email notification
POST /api/emails/send
{
  "to": "seller@example.com",
  "subject": "New bid on your auction!",
  "template": "new_bid",
  "data": {
    "auction_title": "Prime Land in Thimphu",
    "bid_amount": 6000,
    "room_code": "A3X9K2L7"
  }
}
```

## 🛠️ Integration Steps

### Step 1: Ensure All Services Run

Each friend runs their service:

```bash
# Friend 1 - User Service
cd user-service && npm run dev  # Port 3001

# You - Auction Service
cd auction-service-backend && npm run dev  # Port 3002

# Friend 2 - Bidding Service
cd bidding-service && npm run dev  # Port 3003

# Friend 3 - Notification Service
cd notification-service && npm run dev  # Port 3004

# Friend 4 - Email Service
cd email-service && npm run dev  # Port 3005
```

### Step 2: Configure URLs

**Your auction service `.env`:**
```env
PORT=3002
USER_SERVICE_URL=http://localhost:3001
BIDDING_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
EMAIL_SERVICE_URL=http://localhost:3005
```

**Other services need:**
```env
AUCTION_SERVICE_URL=http://localhost:3002
```

### Step 3: Test Integration

**Test User → Auction:**
```bash
# 1. Create user (User Service)
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com", "role":"SELLER"}'

# 2. Create auction (Your service checks user)
curl -X POST http://localhost:3002/api/auctions \
  -H "x-user-id: user-123" \
  -d '{"title":"Test Auction",...}'
```

**Test Auction → Bidding:**
```bash
# 1. Bidding service gets auction
curl http://localhost:3002/api/auctions/abc123

# 2. Bidding service places bid
curl -X POST http://localhost:3003/api/bids \
  -d '{"auction_id":"abc123", "amount":5000}'

# 3. Bidding service updates auction
curl -X PUT http://localhost:3002/api/auctions/abc123 \
  -d '{"current_highest_bid":5000}'
```

## 🔄 Event Flow Examples

### Example 1: User Creates Auction

```
1. Frontend → Auction Service (POST /api/auctions)
2. Auction Service → User Service (GET /api/users/:id - verify seller)
3. User Service → Auction Service (response: verified)
4. Auction Service → Database (create auction + room)
5. Auction Service → Frontend (success + room_code)
```

### Example 2: User Places Bid

```
1. Frontend → Bidding Service (POST /api/bids)
2. Bidding Service → Auction Service (GET /api/auctions/:id - validate)
3. Auction Service → Bidding Service (auction details)
4. Bidding Service → Database (save bid)
5. Bidding Service → Auction Service (PUT - update current_highest_bid)
6. Bidding Service → Notification Service (POST - notify seller)
7. Notification Service → Email Service (POST - send email)
8. Bidding Service → Frontend (success)
```

### Example 3: Auction Status Change

```
1. Frontend → Auction Service (PUT /api/auctions/:id/status)
2. Auction Service → Database (update status to ACTIVE)
3. Auction Service → Notification Service (auction now active)
4. Notification Service → Email Service (notify subscribers)
5. Email Service → SMTP (send emails)
6. Auction Service → Frontend (success)
```

## 🚀 Deployment Together

### Option 1: Same Server, Different Ports

All services on one machine:
```
Server: yourserver.com
- User Service: yourserver.com:3001
- Auction Service: yourserver.com:3002
- Bidding Service: yourserver.com:3003
- Notification Service: yourserver.com:3004
- Email Service: yourserver.com:3005
- Frontend: yourserver.com:4002
```

### Option 2: Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  user-service:
    build: ./user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=...

  auction-service:
    build: ./auction-service-backend
    ports:
      - "3002:3002"
    environment:
      - USER_SERVICE_URL=http://user-service:3001
      - SUPABASE_URL=...
    depends_on:
      - user-service

  bidding-service:
    build: ./bidding-service
    ports:
      - "3003:3003"
    environment:
      - AUCTION_SERVICE_URL=http://auction-service:3002
    depends_on:
      - auction-service

  notification-service:
    build: ./notification-service
    ports:
      - "3004:3004"

  email-service:
    build: ./email-service
    ports:
      - "3005:3005"

  frontend:
    build: ./auction-service-frontend
    ports:
      - "4002:4002"
    environment:
      - NEXT_PUBLIC_API_URL=http://auction-service:3002
```

**Run everything:**
```bash
docker-compose up
```

### Option 3: Cloud Deployment

Each service can be deployed separately:

- **Railway.app** (Free tier available)
- **Render.com** (Free tier available)
- **Fly.io** (Free tier available)
- **Vercel** (Frontend - Free)

**Environment variables become:**
```env
USER_SERVICE_URL=https://user-service.railway.app
AUCTION_SERVICE_URL=https://auction-service.railway.app
BIDDING_SERVICE_URL=https://bidding-service.railway.app
```

## 📝 What You Need to Share with Friends

### Share with ALL friends:

1. **Your API Documentation:**
   - Endpoints: GET /api/auctions, POST /api/auctions, etc.
   - Request/Response formats
   - Authentication (x-user-id header)

2. **Your Base URL:**
   - Development: `http://localhost:3002`
   - Production: `https://your-auction-service.com`

3. **Database Schema:**
   - What data you store
   - Room codes format
   - Status values (DRAFT, ACTIVE, CLOSED)

### Request from friends:

1. **User Service (Friend 1):**
   - GET /api/users/:id endpoint
   - Response format with role and is_verified

2. **Bidding Service (Friend 2):**
   - Will they update current_highest_bid?
   - Or should your service have a webhook?

3. **Notification Service (Friend 3):**
   - POST /api/notifications endpoint
   - What event types to send

4. **Email Service (Friend 4):**
   - Will Notification Service call it?
   - Or should your service call directly?

## 🧪 Testing Integration

Create integration tests:

```javascript
// test-integration.js
const axios = require('axios');

async function testFullFlow() {
  // 1. Create user
  const user = await axios.post('http://localhost:3001/api/users', {
    email: 'test@test.com',
    role: 'SELLER'
  });

  // 2. Create auction
  const auction = await axios.post('http://localhost:3002/api/auctions', {
    title: 'Test Auction',
    // ... other fields
  }, {
    headers: { 'x-user-id': user.data.id }
  });

  // 3. Place bid
  const bid = await axios.post('http://localhost:3003/api/bids', {
    auction_id: auction.data.id,
    amount: 5000
  });

  console.log('✅ Integration test passed!');
}

testFullFlow();
```

## 🎯 Summary

**YES, you can absolutely integrate!** Your auction service is **ready to work** with other services. You just need to:

1. ✅ All run services on agreed ports
2. ✅ Share API documentation
3. ✅ Configure environment variables
4. ✅ Test integration points
5. ✅ Deploy together (Docker Compose or Cloud)

Your **auction service is already built for integration** - the auth middleware, environment variables, and API structure are all microservices-ready! 🚀
