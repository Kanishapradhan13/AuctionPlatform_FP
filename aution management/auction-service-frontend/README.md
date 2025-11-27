# Auction Service - Frontend

Modern Next.js 14 frontend for the Auction Management Service with dedicated auction rooms.

## Features

- Browse and search auctions
- View auction details and room information
- Create auctions with multi-step wizard
- Seller dashboard with room management
- Join and participate in auction rooms
- Responsive design with Tailwind CSS
- Real-time room participant tracking

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Date Utilities:** date-fns

## Prerequisites

- Node.js 16+ and npm
- Backend API running on port 3002

## Setup Instructions

### 1. Install Dependencies

```bash
cd auction-service-frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_USER_ID=test-seller-123
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend runs on http://localhost:4002

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
auction-service-frontend/
├── app/
│   ├── auctions/
│   │   ├── page.tsx                # Auction listing
│   │   ├── [id]/page.tsx          # Auction detail
│   │   └── create/page.tsx        # Create auction form
│   ├── dashboard/
│   │   └── page.tsx               # Seller dashboard
│   ├── rooms/
│   │   ├── page.tsx               # Active rooms listing
│   │   └── [roomCode]/page.tsx   # Room detail & bidding
│   ├── layout.tsx                 # Root layout with nav
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   ├── AuctionCard.tsx            # Auction card component
│   └── StatusBadge.tsx            # Status badge component
├── lib/
│   ├── api.ts                     # API client
│   └── types.ts                   # TypeScript types
├── public/                        # Static assets
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Pages

### Home Page (/)
- Welcome page with service overview
- Quick access to browse and create auctions
- Feature highlights

### Auctions (/auctions)
- Browse all auctions
- Search functionality
- Filter by status (DRAFT, ACTIVE, CLOSED)
- View auction cards with room codes

### Auction Detail (/auctions/[id])
- Full auction information
- Item specifications (land/vehicle)
- Room information and participant count
- Join room button for active auctions
- Seller actions (publish, cancel)

### Create Auction (/auctions/create)
4-step wizard:
1. **Basic Info:** Title, description, dates, reserve price
2. **Item Type:** Land or Vehicle selection, condition, location
3. **Specifications:** Type-specific fields
4. **Images & Preview:** Image URLs and final review

### Dashboard (/dashboard)
- View all your auctions
- Statistics (total, draft, active, closed)
- Filter by status
- Quick access to auction details and rooms
- Participant count for each room

### Rooms (/rooms)
- Browse active auction rooms
- See participant counts
- Current bid information
- Join room functionality

### Room Detail (/rooms/[roomCode])
- Dedicated auction room view
- Real-time participant count
- Place bids (when joined)
- Auction countdown timer
- Recent activity feed

## Key Features

### Auction Rooms

Each auction has a dedicated room with:
- **Unique Code:** 8-character alphanumeric code
- **Participant Tracking:** Real-time count of joined users
- **Room Status:** Active/inactive indication
- **Easy Access:** Join via room code or auction page

### Multi-Step Auction Creation

The creation wizard guides users through:
1. Auction basics (timing, pricing)
2. Item details (type, condition, location)
3. Specifications (land/vehicle specific fields)
4. Images and final review

Auto-generates unique room code on creation.

### Type-Specific Forms

**Land Auctions:**
- Land size (e.g., "2.5 acres")
- Land type (Residential, Commercial, Agricultural)
- GPS coordinates (optional)
- Ownership documents (optional)

**Vehicle Auctions:**
- Make and model
- Year (1990 or later)
- Mileage
- Engine type
- Registration number

## Components

### AuctionCard
Displays auction preview with:
- Image
- Title and description
- Status badge
- Room code
- Current bid
- Time remaining
- Participant count

### StatusBadge
Color-coded status indicators:
- **DRAFT:** Gray
- **ACTIVE:** Green
- **CLOSED:** Blue
- **CANCELLED:** Red

## API Integration

The frontend communicates with the backend API using Axios.

### API Client (`lib/api.ts`)

```typescript
import { auctionAPI } from '@/lib/api';

// Get all auctions
const auctions = await auctionAPI.getAll({ status: 'ACTIVE' });

// Create auction
const auction = await auctionAPI.create(auctionData);

// Join room
await auctionAPI.joinRoom('A3X9K2L7');
```

### Available Methods

- `getAll(filters)` - Get auctions with filtering
- `getById(id)` - Get specific auction
- `getByRoomCode(code)` - Get auction by room code
- `create(data)` - Create new auction
- `update(id, data)` - Update auction
- `delete(id)` - Cancel auction
- `updateStatus(id, status)` - Change status
- `search(query)` - Search auctions
- `getActiveRooms()` - Get active rooms
- `joinRoom(roomCode)` - Join auction room

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with:
- Responsive design (mobile-first)
- Custom color palette
- Utility-first approach
- Component-based styling

### Color Scheme

- **Primary:** Blue (#3b82f6)
- **Success:** Green (#10b981)
- **Danger:** Red (#ef4444)
- **Gray Scale:** For text and backgrounds

## Development Tips

### Adding New Pages

1. Create file in `app/` directory
2. Use `'use client'` for client components
3. Import types from `@/lib/types`
4. Use API client from `@/lib/api`

### Adding Components

1. Create in `components/` directory
2. Export as default
3. Import with `@/components/...`

### State Management

Uses React hooks:
- `useState` for local state
- `useEffect` for data fetching
- `useRouter` for navigation
- `useParams` for route parameters

## Common Tasks

### Adding a New Auction Field

1. Update types in `lib/types.ts`
2. Update API request structure
3. Add form field in `create/page.tsx`
4. Update display in detail page

### Customizing Styles

Edit `tailwind.config.js` for theme changes:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* custom colors */ }
    }
  }
}
```

## Troubleshooting

**"Failed to fetch auctions"**
- Ensure backend is running on port 3002
- Check NEXT_PUBLIC_API_URL in `.env.local`

**TypeScript errors**
- Run `npm run build` to check for type errors
- Ensure all types are imported from `@/lib/types`

**Styles not applying**
- Check Tailwind classes are correct
- Restart dev server after config changes

**Navigation not working**
- Use `<Link>` from `next/link`
- Check route paths match file structure

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

ISC
