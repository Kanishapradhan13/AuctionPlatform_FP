# Real-Time Bidding Service - Frontend

Next.js frontend application for the Real-Time Bidding microservice.

## 🚀 Features

- **Real-time Bidding Interface** - Live auction room with instant bid updates
- **Bid History** - View all past bids with filtering and search
- **Dashboard** - Overview of active auctions and statistics
- **Responsive Design** - Works on desktop and mobile devices
- **Supabase Realtime** - WebSocket integration for instant updates

## 📋 Prerequisites

- Node.js 18 or higher
- Backend service running on port 3003
- Supabase account with realtime enabled

## 🛠️ Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a \`.env.local\` file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your values:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will start on **http://localhost:4003**

## 📁 Project Structure

\`\`\`
bidding-service-frontend/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Home page / dashboard
│   ├── globals.css             # Global styles
│   ├── auction/
│   │   └── [auctionId]/
│   │       └── page.tsx        # Live auction room
│   └── history/
│       └── page.tsx            # Bid history page
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
\`\`\`

## 🎯 Pages

### 1. Home Page (\`/\`)
- Dashboard with statistics
- Active auctions list
- Quick navigation

### 2. Live Auction Room (\`/auction/[auctionId]\`)
- Real-time bid display
- Bid placement form
- Live bid history
- Auction statistics
- Supabase Realtime integration

### 3. Bid History (\`/history\`)
- All bids across all auctions
- Search and filter functionality
- Summary statistics

## 🔌 API Integration

The frontend connects to the backend API at \`http://localhost:3003\`

### Endpoints Used:

- \`POST /api/bids/place\` - Place a new bid
- \`GET /api/bids/history/:auctionId\` - Get bid history
- \`GET /api/bids/statistics/:auctionId\` - Get auction stats
- \`POST /api/bids/realtime/setup/:auctionId\` - Setup realtime channel
- \`GET /api/bids/recent\` - Get recent bids

## 🔄 Real-Time Features

The application uses **Supabase Realtime** for instant bid updates:

1. When a user joins an auction, a realtime channel is created
2. All bid events are broadcast to connected clients
3. UI updates instantly when new bids are placed
4. No page refresh needed!

### How It Works:

\`\`\`typescript
const channel = supabase
  .channel(\`auction:\${auctionId}:bids\`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bids',
    filter: \`auction_id=eq.\${auctionId}\`
  }, (payload) => {
    // Update UI with new bid
  })
  .subscribe()
\`\`\`

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Responsive design** for all screen sizes
- **Custom animations** for bid updates
- **Primary color**: Red (#ef4444) - Bhutan theme

## 📦 Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 🐳 Docker Deployment

Build the Docker image:

\`\`\`bash
docker build -t bidding-frontend .
\`\`\`

Run the container:

\`\`\`bash
docker run -p 4003:4003 \\
  -e NEXT_PUBLIC_API_URL=http://localhost:3003 \\
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \\
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \\
  bidding-frontend
\`\`\`

## 🧪 Testing

To test the frontend:

1. Start the backend service on port 3003
2. Start the frontend: \`npm run dev\`
3. Open http://localhost:4003
4. Navigate to \`/auction/test-auction\`
5. Place test bids
6. Open the same URL in another browser tab
7. Watch real-time updates! 🎉

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | Yes |

## 🚨 Troubleshooting

### Real-time not working
- Check Supabase Realtime is enabled on \`bids\` table
- Verify environment variables are set correctly
- Check browser console for WebSocket errors

### Backend connection failed
- Ensure backend is running on port 3003
- Check NEXT_PUBLIC_API_URL is correct
- Verify CORS is configured on backend

### Bids not appearing
- Check database has the \`bids\` table
- Verify backend API is responding
- Check browser network tab for API errors

## 👥 Team Members

- **Person A (Pema T)**: Backend bid processing
- **Person B**: Backend realtime & history
- **Frontend Team**: Frontend development

## 📝 Notes for Development

- The frontend uses mock user IDs for demo purposes
- Replace with actual Clerk authentication in production
- Add proper error boundaries for production
- Implement loading states for all API calls
- Add input validation and sanitization

## 🎓 Learning Outcomes

By building this frontend, you learn:
- Next.js 14 App Router
- Real-time WebSocket integration
- REST API consumption
- TypeScript in React
- Tailwind CSS styling
- Responsive design
- State management in React

## 📞 Support

For questions or issues:
1. Check the documentation
2. Review the backend API docs
3. Test API endpoints with curl
4. Check browser console for errors

## ✅ Success Criteria

Frontend is complete when:
- [ ] All pages render correctly
- [ ] Real-time bidding works
- [ ] Bid history displays properly
- [ ] API integration successful
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Professional UI/UX

## 🎉 You're Ready!

Start the development server and begin building!

\`\`\`bash
npm run dev
\`\`\`

Visit: **http://localhost:4003**

Good luck! 🚀
