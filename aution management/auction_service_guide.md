# Auction Management Service - Complete Implementation Guide
**Service Owner:** Member (Pema Dolker)

---

## 📋 Table of Contents
1. [Overview & Architecture](#overview)
2. [Database Design](#database)
3. [Backend Implementation](#backend)
4. [Frontend Implementation](#frontend)
5. [Microservices Integration](#microservices)
6. [Testing Strategy](#testing)
7. [Day-by-Day Plan](#timeline)

---

## 1. Overview & Architecture {#overview}

### What This Service Does
- **Create auctions** for land and vehicles
- **List and browse** all auctions with filters
- **Manage auction lifecycle** (draft → active → closed)
- **Handle item specifications** (land/vehicle details)
- **Provide auction data** to other services

### Tech Stack
- **Backend:** Node.js + Express (Port 3002)
- **Frontend:** Next.js 14 with TypeScript (Port 4002)
- **Database:** Supabase PostgreSQL
- **Caching:** Redis (optional for performance)
- **Styling:** Tailwind CSS
- **Testing:** Jest + Supertest

### Service Boundaries
```
┌─────────────────────────────────────────┐
│   Auction Management Service           │
│                                         │
│  ┌─────────────┐    ┌────────────────┐ │
│  │  Frontend   │───▶│    Backend     │ │
│  │  (Next.js)  │    │   (Express)    │ │
│  └─────────────┘    └────────────────┘ │
│         │                    │          │
│         │                    ▼          │
│         │            ┌────────────────┐ │
│         └───────────▶│   Supabase DB  │ │
│                      └────────────────┘ │
└─────────────────────────────────────────┘
         │                    ▲
         │ REST API calls     │
         ▼                    │
  ┌──────────────┐   ┌───────────────┐
  │ User Service │   │ Bidding       │
  │ (port 3001)  │   │ Service       │
  └──────────────┘   │ (port 3003)   │
                     └───────────────┘
```

---

## 2. Database Design {#database}

### Table 1: auctions
```sql
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id TEXT NOT NULL,  -- References user from User Service
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  reserve_price DECIMAL(10,2) NOT NULL,
  current_highest_bid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT, ACTIVE, CLOSED, CANCELLED
  winner_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_auctions_seller ON auctions(seller_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_created ON auctions(created_at DESC);
```

### Table 2: auction_items
```sql
CREATE TABLE auction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,  -- LAND or VEHICLE
  condition VARCHAR(50),
  location VARCHAR(255),
  specifications JSONB,  -- Flexible for land/vehicle fields
  image_urls TEXT[],  -- Array of image URLs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_items_auction ON auction_items(auction_id);
```

### Sample Data Structure

**For Land:**
```json
{
  "item_type": "LAND",
  "condition": "Vacant",
  "location": "Thimphu, Bhutan",
  "specifications": {
    "land_size": "2.5 acres",
    "land_type": "Residential",
    "coordinates": "27.4712° N, 89.6339° E",
    "ownership_doc": "Thram Certificate #12345"
  },
  "image_urls": ["https://placeholder.com/land1.jpg"]
}
```

**For Vehicle:**
```json
{
  "item_type": "VEHICLE",
  "condition": "Good",
  "location": "Phuentsholing",
  "specifications": {
    "make": "Toyota",
    "model": "Land Cruiser",
    "year": 2018,
    "mileage": 45000,
    "engine_type": "Diesel",
    "registration_number": "BP-1-A-1234"
  },
  "image_urls": ["https://placeholder.com/car1.jpg"]
}
```

### Setting Up Supabase

---

## 3. Backend Implementation {#backend}

### Project Structure
```
auction-service-backend/
├── src/
│   ├── controllers/
│   │   ├── auctionController.js
│   │   └── itemController.js
│   ├── routes/
│   │   ├── auctionRoutes.js
│   │   └── itemRoutes.js
│   ├── models/
│   │   ├── auctionModel.js
│   │   └── itemModel.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── supabase.js
│   │   └── validators.js
│   └── server.js
├── tests/
│   ├── unit/
│   │   └── auction.test.js
│   └── integration/
│       └── api.test.js
├── .env
├── package.json
└── README.md
```

### Step 1: Initialize Project
```bash
mkdir auction-service-backend
cd auction-service-backend
npm init -y

# Install dependencies
npm install express cors dotenv @supabase/supabase-js
npm install --save-dev jest supertest nodemon
```

### Step 2: Environment Variables (.env)
```env
PORT=3002
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
USER_SERVICE_URL=http://localhost:3001
NODE_ENV=development
```

### Step 3: Supabase Client (src/utils/supabase.js)
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;
```

### Step 4: Auction Model (src/models/auctionModel.js)


### Step 5: Item Model (src/models/itemModel.js)


### Step 6: Validators (src/utils/validators.js)


### Step 7: Auth Middleware (src/middlewares/auth.js)

### Step 8: Auction Controller (src/controllers/auctionController.js)


### Step 9: Routes (src/routes/auctionRoutes.js)


### Step 10: Server (src/server.js)

### Step 11: Package.json Scripts


---

## 4. Frontend Implementation {#frontend}

### Project Structure
```
auction-service-frontend/
├── app/
│   ├── auctions/
│   │   ├── page.tsx              # List all auctions
│   │   ├── [id]/
│   │   │   └── page.tsx          # Auction detail
│   │   ├── create/
│   │   │   └── page.tsx          # Create auction
│   │   └── edit/
│   │       └── [id]/page.tsx     # Edit auction
│   ├── dashboard/
│   │   └── page.tsx              # Seller dashboard
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuctionCard.tsx
│   ├── AuctionForm.tsx
│   ├── ItemForm.tsx
│   ├── FilterBar.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── api.ts
│   └── types.ts
├── public/
├── .env.local
├── package.json
└── README.md
```

### Step 1: Initialize Next.js
```bash
npx create-next-app@latest auction-service-frontend --typescript --tailwind --app
cd auction-service-frontend

# Install additional packages
npm install axios date-fns
```

### Step 2: Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_USER_ID=test-user-123
```

### Step 3: Types (lib/types.ts)


### Step 4: API Client (lib/api.ts)


### Step 5: Status Badge Component (components/StatusBadge.tsx)


### Step 6: Auction Card Component (components/AuctionCard.tsx)

### Step 7: Auction List Page (app/auctions/page.tsx)


### Step 8: Auction Detail Page (app/auctions/[id]/page.tsx)


### Step 9: Auction Creation Form (app/auctions/create/page.tsx)


### Step 10: Seller Dashboard (app/dashboard/page.tsx)


---

## 5. Microservices Integration {#microservices}

### How Your Service Communicates with Others

#### 1. Calling User Service (Check if seller is verified)
```javascript
// In src/middlewares/auth.js
async function checkSeller(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    
    // Call User Service API
    const response = await fetch(`http://localhost:3001/api/users/${userId}`);
    const user = await response.json();

    if (!user.is_verified || user.role !== 'SELLER') {
      return res.status(403).json({ error: 'Only verified sellers allowed' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Auth check failed' });
  }
}
```

#### 2. Called by Bidding Service (Get auction details)
```javascript
// Bidding Service will call:
// GET http://localhost:3002/api/auctions/{id}

// To check if auction is active and get reserve price
// Your auction service provides this data
```

#### 3. Called by Notification Service (Auction events)
```javascript
// When auction status changes, Notification Service can:
// GET http://localhost:3002/api/auctions/{id}
// To get auction details for sending emails
```

### Service Registry (Simple)
```javascript
// src/utils/services.js
const SERVICES = {
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  BIDDING_SERVICE: process.env.BIDDING_SERVICE_URL || 'http://localhost:3003',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
};

module.exports = SERVICES;
```

---

## 6. Testing Strategy {#testing}

### Unit Tests (tests/unit/auction.test.js)


### Integration Tests (tests/integration/api.test.js)


### Manual Testing Checklist
```markdown
## Manual Testing Checklist

### Backend API Testing (Use Postman)
- [ ] Health check endpoint works
- [ ] Create auction with land item
- [ ] Create auction with vehicle item
- [ ] Get all auctions
- [ ] Get single auction by ID
- [ ] Filter auctions by status
- [ ] Search auctions by keyword
- [ ] Update auction (only DRAFT)
- [ ] Change auction status
- [ ] Delete/cancel auction
- [ ] Test validation errors
- [ ] Test unauthorized access

### Frontend Testing (Use Browser)
- [ ] View auction listing page
- [ ] Search auctions
- [ ] Filter by status
- [ ] View auction detail page
- [ ] Create land auction (all steps)
- [ ] Create vehicle auction (all steps)
- [ ] Edit draft auction
- [ ] Publish auction (change to ACTIVE)
- [ ] Cancel auction
- [ ] View seller dashboard
- [ ] Check stats calculations
- [ ] Test responsive design
- [ ] Test form validations
- [ ] Test error messages

### Integration Testing
- [ ] Create auction and verify in database
- [ ] Update auction and verify changes
- [ ] Check if User Service is called for verification
- [ ] Test with multiple users
- [ ] Test pagination on listing page
- [ ] Test image URLs display correctly
```

---



---

## Quick Start Commands

### Backend
```bash
# Install dependencies
cd auction-service-backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run in development
npm run dev

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### Frontend
```bash
# Install dependencies
cd auction-service-frontend
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with API URL

# Run in development
npm run dev

# Build for production
npm run build
```

---
