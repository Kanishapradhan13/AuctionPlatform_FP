# Auction Management Service

Complete microservice for managing auctions with dedicated rooms for land and vehicles in Bhutan.

## Overview

This is a full-stack auction management system that allows sellers to create auctions for land and vehicles, with each auction getting its own dedicated room for organized bidding. Built with a microservices architecture for scalability and maintainability.

## Key Features

- **Dedicated Auction Rooms:** Each auction automatically gets a unique room code
- **Multi-Item Support:** Land and vehicles with type-specific fields
- **Status Management:** DRAFT → ACTIVE → CLOSED workflow
- **Search & Filter:** Find auctions by keyword or status
- **Seller Dashboard:** Manage all your auctions and rooms
- **Real-time Tracking:** Participant counts for each room
- **Microservices Ready:** Integrates with User, Bidding, and Notification services

## Architecture

```
┌─────────────────────────────────────────┐
│   Auction Management Service           │
│                                         │
│  ┌─────────────┐    ┌────────────────┐ │
│  │  Frontend   │───▶│    Backend     │ │
│  │  (Next.js)  │    │   (Express)    │ │
│  │  Port 4002  │    │   Port 3002    │ │
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

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Utilities:** date-fns

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Git

### 1. Clone Repository

```bash
cd "aution management"
```

### 2. Setup Backend

```bash
cd auction-service-backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

Setup database:
1. Go to Supabase SQL editor
2. Run SQL from `database-setup.sql`

Start backend:
```bash
npm run dev
```

Backend runs on http://localhost:3002

### 3. Setup Frontend

```bash
cd ../auction-service-frontend
npm install
# .env.local already exists with default values
```

Start frontend:
```bash
npm run dev
```

Frontend runs on http://localhost:4002

### 4. Verify

- Backend: http://localhost:3002/health
- Frontend: http://localhost:4002

## Project Structure

```
aution management/
├── auction-service-backend/      # Express.js API
│   ├── src/
│   │   ├── controllers/          # Business logic
│   │   ├── models/               # Database operations
│   │   ├── routes/               # API endpoints
│   │   ├── middlewares/          # Auth, validation
│   │   └── utils/                # Helpers
│   ├── tests/                    # Unit & integration tests
│   ├── database-setup.sql        # Database schema
│   └── README.md
│
├── auction-service-frontend/     # Next.js app
│   ├── app/                      # App router pages
│   │   ├── auctions/            # Auction pages
│   │   ├── dashboard/           # Seller dashboard
│   │   └── rooms/               # Auction rooms
│   ├── components/              # Reusable components
│   ├── lib/                     # API client & types
│   └── README.md
│
├── auction_service_guide.md     # Implementation guide
├── CLAUDE.md                    # Development guidance
└── README.md                    # This file
```

## Database Schema

### Core Tables

**auctions**
- Stores auction metadata
- Includes unique `room_code` for each auction
- Tracks status, pricing, and timing

**auction_items**
- Item-specific details (land/vehicle)
- JSONB `specifications` for flexible fields
- Image URLs array

**auction_rooms**
- Room management and tracking
- Participant counts
- Active status

## API Endpoints

### Public
- `GET /api/auctions` - List auctions
- `GET /api/auctions/:id` - Get auction
- `GET /api/auctions/room/:roomCode` - Get by room code
- `GET /api/auctions/rooms/active` - Active rooms
- `POST /api/auctions/room/:roomCode/join` - Join room

### Protected (require x-user-id header)
- `POST /api/auctions` - Create auction
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Cancel auction
- `PUT /api/auctions/:id/status` - Change status

## Frontend Pages

- **/** - Home page
- **/auctions** - Browse auctions
- **/auctions/[id]** - Auction details
- **/auctions/create** - Create auction (4-step wizard)
- **/dashboard** - Seller dashboard
- **/rooms** - Active rooms list
- **/rooms/[roomCode]** - Room detail & bidding

## Auction Room System

### How It Works

1. **Creation:** When a seller creates an auction, a unique 8-character room code is auto-generated (e.g., "A3X9K2L7")

2. **Discovery:** Users can:
   - Browse active rooms at `/rooms`
   - Find room code on auction detail page
   - Search for specific auctions

3. **Joining:** Click "Join Room" to participate in bidding

4. **Tracking:** System tracks participant count for each room

5. **Bidding:** Once in a room, users can place bids on the item

### Room Code Format

- 8 characters
- Alphanumeric (A-Z, 0-9)
- Unique across all auctions
- Automatically generated

## Item Types

### Land Auctions

Required fields:
- Land size (e.g., "2.5 acres")
- Land type (Residential, Commercial, Agricultural)

Optional fields:
- GPS coordinates
- Ownership documents

### Vehicle Auctions

Required fields:
- Make and model
- Year (1990+)
- Mileage (km)
- Engine type
- Registration number

## Status Workflow

```
DRAFT → ACTIVE → CLOSED
  ↓       ↓
CANCELLED
```

- **DRAFT:** Being created, can edit
- **ACTIVE:** Live auction, accepting bids
- **CLOSED:** Auction ended
- **CANCELLED:** Auction cancelled

## Microservices Integration

### User Service (port 3001)
- Validates seller credentials
- Checks user verification status
- Called during auction creation

### Bidding Service (port 3003)
- Retrieves auction details for bid validation
- Updates current highest bid

### Notification Service (port 3004)
- Gets auction data for email notifications
- Sends status change alerts

## Development

### Backend Development

```bash
cd auction-service-backend
npm run dev          # Start with nodemon
npm test             # Run tests
npm test -- --watch  # Watch mode
```

### Frontend Development

```bash
cd auction-service-frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Check linting
```

## Testing

### Backend Tests

```bash
cd auction-service-backend
npm test                    # All tests
npm test -- --coverage      # With coverage
```

### Manual Testing

Use the included Postman collection or:

```bash
# Create auction
curl -X POST http://localhost:3002/api/auctions \
  -H "Content-Type: application/json" \
  -H "x-user-id: seller-123" \
  -d @sample-auction.json

# Get all auctions
curl http://localhost:3002/api/auctions

# Join room
curl -X POST http://localhost:3002/api/auctions/room/A3X9K2L7/join
```

## Deployment

### Backend Deployment

1. Set environment variables
2. Run database migrations
3. Build: `npm run build` (if using TypeScript)
4. Start: `npm start`

### Frontend Deployment

1. Set `NEXT_PUBLIC_API_URL` to production API
2. Build: `npm run build`
3. Start: `npm start`

Recommended platforms:
- Backend: Railway, Render, Fly.io
- Frontend: Vercel, Netlify
- Database: Supabase (already cloud-hosted)

## Environment Variables

### Backend (.env)
```env
PORT=3002
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
USER_SERVICE_URL=http://localhost:3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_USER_ID=test-seller-123
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

ISC

## Support

For issues and questions:
- Check documentation in `auction_service_guide.md`
- Review `CLAUDE.md` for development guidance
- Open an issue on GitHub

## Acknowledgments

- **Service Owner:** Pema Dolker
- **Tech Stack:** Node.js, Next.js, Supabase
- **Design:** Tailwind CSS
