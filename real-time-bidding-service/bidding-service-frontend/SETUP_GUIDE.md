# 🎨 Frontend Setup Guide - Real-Time Bidding Service

## 📋 Overview

This is the **Next.js frontend** for your Real-Time Bidding microservice. It provides a professional web interface for:
- Live auction rooms with real-time bidding
- Bid history and statistics
- Dashboard with active auctions

## 🚀 Quick Start (10 Minutes)

### Step 1: Navigate to Frontend Directory

\`\`\`bash
cd real-time-bidding-service-frontend
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install:
- Next.js 14
- React 18
- Tailwind CSS
- Supabase Client
- Axios for API calls

### Step 3: Setup Environment Variables

Create \`.env.local\` file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\`:

\`\`\`env
# Your backend API
NEXT_PUBLIC_API_URL=http://localhost:3003

# Your Supabase credentials (same as backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### Step 4: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

### Step 5: Open Browser

Visit: **http://localhost:4003**

You should see the dashboard! 🎉

---

## 📁 Project Structure

\`\`\`
bidding-service-frontend/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with nav
│   ├── page.tsx                 # Home page (/)
│   ├── globals.css              # Global styles
│   ├── auction/
│   │   └── [auctionId]/
│   │       └── page.tsx         # Live auction (/auction/test-auction)
│   └── history/
│       └── page.tsx             # Bid history (/history)
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── Dockerfile
└── README.md
\`\`\`

---

## 🎯 Pages You Have

### 1. Dashboard (\`/\`) - Home Page

**Features:**
- Overview statistics (active auctions, total bids, bidders)
- List of active auctions
- Quick navigation to auction rooms

**Try it:**
\`\`\`bash
# Open browser
http://localhost:4003/
\`\`\`

### 2. Live Auction Room (\`/auction/[auctionId]\`)

**Features:**
- Real-time bid display (updates instantly!)
- Bid placement form
- Live bid history
- Auction statistics sidebar
- WebSocket connection via Supabase

**Try it:**
\`\`\`bash
# Open browser
http://localhost:4003/auction/test-auction

# Open in another tab too - watch real-time updates!
\`\`\`

**How to test real-time:**
1. Open \`/auction/test-auction\` in **two browser tabs**
2. Place a bid in one tab
3. Watch it appear **instantly** in the other tab! 🚀

### 3. Bid History (\`/history\`)

**Features:**
- Table of all bids
- Search by auction or bidder ID
- Filter by specific auction
- Summary statistics

**Try it:**
\`\`\`bash
# Open browser
http://localhost:4003/history
\`\`\`

---

## 🔌 API Integration

The frontend talks to your backend on port **3003**.

### API Calls Made:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| \`/api/bids/place\` | POST | Place a new bid |
| \`/api/bids/history/:id\` | GET | Get bid history |
| \`/api/bids/statistics/:id\` | GET | Get stats |
| \`/api/bids/realtime/setup/:id\` | POST | Setup realtime |
| \`/api/bids/recent\` | GET | Recent bids |

**Example API Call (in code):**

\`\`\`typescript
// Place a bid
const response = await axios.post(\`\${API_URL}/api/bids/place\`, {
  auction_id: 'test-auction',
  bidder_id: 'user-123',
  amount: 2000
})
\`\`\`

---

## 🔄 Real-Time Setup

The frontend uses **Supabase Realtime** for instant updates.

### How It Works:

1. User opens auction page
2. Frontend creates a WebSocket channel
3. Backend setups database listeners
4. When someone bids:
   - Database INSERT happens
   - Supabase broadcasts to all connected clients
   - UI updates **instantly** (<100ms)
5. All users see the new bid in real-time!

### Code Example:

\`\`\`typescript
const channel = supabase
  .channel(\`auction:test-auction:bids\`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bids',
    filter: 'auction_id=eq.test-auction'
  }, (payload) => {
    console.log('New bid!', payload.new)
    // Update UI here
  })
  .subscribe()
\`\`\`

---

## 🎨 Styling

Uses **Tailwind CSS** for styling:

- **Primary Color**: Red (#ef4444) - Bhutan theme
- **Responsive**: Works on mobile and desktop
- **Animations**: Custom bid animations
- **Icons**: Lucide React icons

### Custom Animations:

\`\`\`css
/* Pulse animation for "LIVE" indicator */
.animate-bid-pulse { }

/* Success animation when bid is placed */
.animate-bid-success { }
\`\`\`

---

## 🧪 Testing Your Frontend

### Test 1: Basic Navigation

\`\`\`bash
1. Start: npm run dev
2. Open: http://localhost:4003
3. Click: "Join Live Auction"
4. Should see: Auction room
✅ Navigation works!
\`\`\`

### Test 2: Place a Bid

\`\`\`bash
1. Open: http://localhost:4003/auction/test-auction
2. Enter amount: 2000
3. Click: "Place Bid"
4. Should see: Success message
✅ Bidding works!
\`\`\`

### Test 3: Real-Time Updates

\`\`\`bash
1. Open: http://localhost:4003/auction/test-auction (Tab 1)
2. Open: http://localhost:4003/auction/test-auction (Tab 2)
3. In Tab 1: Place a bid (2000)
4. Watch Tab 2: Bid appears instantly!
✅ Real-time works!
\`\`\`

### Test 4: View History

\`\`\`bash
1. Place a few bids
2. Open: http://localhost:4003/history
3. Should see: All your bids
✅ History works!
\`\`\`

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to backend"

**Solution:**
\`\`\`bash
# Check backend is running
curl http://localhost:3003/health

# If not running:
cd ../backend
npm run dev
\`\`\`

### Problem: "Real-time not working"

**Solutions:**
1. Check Supabase Realtime is enabled:
   - Go to Supabase Dashboard
   - Database → Replication
   - Enable for \`bids\` table

2. Check environment variables:
   - \`.env.local\` has correct SUPABASE_URL
   - \`.env.local\` has correct SUPABASE_ANON_KEY

3. Check browser console:
   - F12 → Console
   - Look for WebSocket errors

### Problem: "Page not found"

**Solution:**
\`\`\`bash
# Make sure you're on correct port
http://localhost:4003  ✅
http://localhost:3000  ❌ (wrong port)

# Check dev server is running
npm run dev
\`\`\`

---

## 🔧 Development Commands

\`\`\`bash
# Install dependencies
npm install

# Start development server (port 4003)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint
\`\`\`

---

## 📱 Responsive Design

The app works on all devices:

- **Desktop**: Full layout with sidebar
- **Tablet**: Stacked layout
- **Mobile**: Single column, touch-friendly

Test responsive:
\`\`\`bash
# In browser, press F12
# Click device icon (top-left)
# Select iPhone or Android
# See mobile layout!
\`\`\`

---

## 🎯 Who Works on What?

### Frontend Team
- Create additional pages (optional)
- Improve styling
- Add features (charts, etc.)
- Testing

### Person A (Backend)
- Provides bid placement API
- Provides validation API

### Person B (Backend)
- Provides history API
- Provides statistics API
- Manages Supabase Realtime

### Integration
- Frontend calls backend APIs
- Backend provides data
- Supabase connects both for real-time

---

## 🚀 Deployment

### Using Docker:

\`\`\`bash
# Build image
docker build -t bidding-frontend .

# Run container
docker run -p 4003:4003 \\
  -e NEXT_PUBLIC_API_URL=http://backend:3003 \\
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \\
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \\
  bidding-frontend
\`\`\`

### Using Vercel:

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
\`\`\`

---

## ✅ Success Checklist

Before considering frontend "complete":

- [ ] All pages load without errors
- [ ] Can place bids successfully
- [ ] Real-time updates work (<100ms)
- [ ] Bid history displays correctly
- [ ] Search and filter work
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Professional styling
- [ ] Error messages display properly
- [ ] Loading states implemented

---

## 📚 Code Walkthrough

### Main Files to Understand:

#### 1. \`app/layout.tsx\` - Root Layout
- Contains navigation bar
- Wraps all pages
- Global styles

#### 2. \`app/page.tsx\` - Dashboard
- Shows statistics
- Lists active auctions
- Quick navigation

#### 3. \`app/auction/[auctionId]/page.tsx\` - Auction Room
- **Most important file!**
- Real-time bidding logic
- Supabase integration
- Bid form handling

Key functions:
- \`setupRealtimeChannel()\` - Creates WebSocket
- \`handlePlaceBid()\` - Submits bid
- \`loadAuctionData()\` - Fetches initial data

#### 4. \`app/history/page.tsx\` - History
- Displays all bids
- Search and filter
- Summary stats

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Axios](https://axios-http.com/docs/intro)

---

## 📞 Support

**Need help?**

1. Check this guide
2. Check browser console (F12)
3. Check backend is running
4. Test API with curl
5. Ask your team!

---

## 🎉 You're Ready!

Everything is set up and ready to go!

### Next Steps:

1. ✅ Install dependencies: \`npm install\`
2. ✅ Setup \`.env.local\`
3. ✅ Start dev server: \`npm run dev\`
4. ✅ Open: \`http://localhost:4003\`
5. ✅ Test real-time bidding!

**Your frontend is now COMPLETE!** 🎊

Good luck! 🚀
