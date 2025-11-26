# Real-Time Bidding Service

## What We Have

Complete microservice with:
- Backend (Node.js/Express, Port 3003)
- Frontend (Next.js, Port 4003)  
- Real-time bidding (Supabase WebSocket)



##  Quick Setup 

### Step 1: Backend 

```bash
cd backend

# Install
npm install

# Start Redis
docker run -d -p 6379:6379 --name redis-bidding redis:7-alpine 

# Configure
cp .env.example .env
# Edit .env with Supabase credentials

# Start
npm run dev
```

Test: `curl http://localhost:3003/health`

### Step 2: Frontend 

```bash

cd bidding-service-frontend

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# Start
npm run dev
```

Visit: `http://localhost:4003`

### Step 3: Test Real-Time (5 min)

1. Open: `http://localhost:4003/auction/test-auction` (Tab 1)
2. Open: `http://localhost:4003/auction/test-auction` (Tab 2)
3. Place bid in Tab 1
4. Watch it appear INSTANTLY in Tab 2! 🚀

---

## Success = This Works:

- [ ] Backend running on 3003
- [ ] Frontend running on 4003
- [ ] Dashboard loads
- [ ] Can place bid
- [ ] Real-time updates work (2 tabs test)
- [ ] No errors in console



##  Your Microservice Structure

```
real-time-bidding-service/
├── backend/          (Port 3003)
│   ├── bid-processing files
│   ├── realtime files
│   └── Shared files
└── frontend/         (Port 4003)
    ├── Dashboard
    ├── Auction room
    └── History
```

---

## Ports

- **3003** - backend
- **4003** - frontend
- **6379** - Redis
- **3001** - User service 
- **3002** - Auction service 
- **3004** - Notification service 

---

##  Quick Help

**Backend won't start?**
→ Check Redis is running
→ Check .env has Supabase credentials

**Frontend won't connect?**
→ Check backend is running on 3003
→ Check .env.local has correct API_URL

**Real-time not working?**
→ Enable Realtime in Supabase Dashboard
→ Database → Replication → Enable 'bids' table


---

