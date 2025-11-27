# Auction Service - Backend API

Microservice for managing auctions with dedicated rooms for land and vehicles.

## Features

- Create and manage auctions
- Dedicated auction rooms with unique codes
- Support for LAND and VEHICLE items
- RESTful API with full CRUD operations
- Status management (DRAFT → ACTIVE → CLOSED)
- Search and filtering
- Microservices integration ready

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Testing:** Jest + Supertest

## Prerequisites

- Node.js 16+ and npm
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
cd auction-service-backend
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=3002
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
USER_SERVICE_URL=http://localhost:3001
NODE_ENV=development
```

### 3. Setup Database

1. Go to your Supabase project SQL editor
2. Run the SQL from `database-setup.sql`
3. This creates the `auctions`, `auction_items`, and `auction_rooms` tables

### 4. Run the Server

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server runs on http://localhost:3002

### 5. Verify Installation

Visit http://localhost:3002/health

Expected response:
```json
{
  "status": "OK",
  "service": "Auction Management Service",
  "version": "1.0.0"
}
```

## API Endpoints

### Public Endpoints

- `GET /api/auctions` - Get all auctions (with filters)
- `GET /api/auctions/:id` - Get auction by ID
- `GET /api/auctions/room/:roomCode` - Get auction by room code
- `GET /api/auctions/search?q=term` - Search auctions
- `GET /api/auctions/rooms/active` - Get active auction rooms
- `POST /api/auctions/room/:roomCode/join` - Join an auction room

### Protected Endpoints (require x-user-id header)

- `POST /api/auctions` - Create auction
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Cancel auction
- `PUT /api/auctions/:id/status` - Change auction status

### Query Parameters

#### GET /api/auctions
- `status` - Filter by status (DRAFT, ACTIVE, CLOSED)
- `seller_id` - Filter by seller
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Request Examples

**Create Auction:**
```bash
curl -X POST http://localhost:3002/api/auctions \
  -H "Content-Type: application/json" \
  -H "x-user-id: seller-123" \
  -d '{
    "title": "Prime Land in Thimphu",
    "description": "Beautiful land with mountain views",
    "start_time": "2024-12-01T10:00:00Z",
    "end_time": "2024-12-05T10:00:00Z",
    "reserve_price": 5000000,
    "item": {
      "item_type": "LAND",
      "condition": "Vacant",
      "location": "Thimphu, Bhutan",
      "specifications": {
        "land_size": "2.5 acres",
        "land_type": "Residential"
      },
      "image_urls": ["https://placehold.co/600x400"]
    }
  }'
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run with coverage:

```bash
npm test -- --coverage
```

## Project Structure

```
auction-service-backend/
├── src/
│   ├── controllers/
│   │   └── auctionController.js    # Business logic
│   ├── models/
│   │   ├── auctionModel.js         # Database operations
│   │   └── itemModel.js
│   ├── routes/
│   │   └── auctionRoutes.js        # API routes
│   ├── middlewares/
│   │   └── auth.js                 # Authentication
│   ├── utils/
│   │   ├── supabase.js             # Database client
│   │   └── validators.js           # Validation functions
│   └── server.js                   # Express app
├── tests/
│   ├── unit/                       # Unit tests
│   └── integration/                # API tests
├── database-setup.sql              # Database schema
├── package.json
└── .env
```

## Database Schema

### auctions
- id (UUID, PK)
- seller_id (TEXT)
- title (VARCHAR)
- description (TEXT)
- start_time, end_time (TIMESTAMP)
- reserve_price, current_highest_bid (DECIMAL)
- status (VARCHAR)
- room_code (VARCHAR, UNIQUE)
- winner_id (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)

### auction_items
- id (UUID, PK)
- auction_id (UUID, FK)
- item_type (LAND | VEHICLE)
- condition (VARCHAR)
- location (VARCHAR)
- specifications (JSONB)
- image_urls (TEXT[])
- created_at (TIMESTAMP)

### auction_rooms
- id (UUID, PK)
- auction_id (UUID, FK)
- room_code (VARCHAR, UNIQUE)
- active (BOOLEAN)
- participant_count (INTEGER)
- created_at, updated_at (TIMESTAMP)

## Auction Rooms Feature

Each auction automatically gets a unique room code (8 characters) when created. This allows:

- Dedicated spaces for each auction
- Track participant counts
- Organize bidding activities
- Easy room discovery and joining

Room codes are alphanumeric (e.g., "A3X9K2L7") and automatically generated.

## Microservices Integration

This service integrates with:

- **User Service (port 3001):** Validates seller credentials
- **Bidding Service (port 3003):** Provides auction data for bids
- **Notification Service (port 3004):** Sends auction updates

Configure URLs in `.env`:
```env
USER_SERVICE_URL=http://localhost:3001
BIDDING_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
```

## Development

The service uses:
- **Nodemon** for auto-restart during development
- **Express middleware** for CORS, JSON parsing, logging
- **Supabase client** for database operations
- **Environment variables** for configuration

## Troubleshooting

**"Missing Supabase credentials"**
- Check that `.env` file exists and has valid SUPABASE_URL and SUPABASE_ANON_KEY

**"Table does not exist"**
- Run the database-setup.sql in your Supabase SQL editor

**Port 3002 already in use**
- Change PORT in `.env` or kill the process using port 3002

## License

ISC
