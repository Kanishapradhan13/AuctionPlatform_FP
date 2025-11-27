import express, { Request } from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import Redis from "ioredis";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "user-service" });
});

// Get user profile
app.get("/api/users/me", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update user profile
app.post("/api/users/profile", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    const { firstName, lastName, userType, phone, address } = req.body;

    if (!firstName || !lastName || !userType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user email from Clerk
    const response = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const clerkUser = await response.json();
    const email = clerkUser.email_addresses[0]?.email_address;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    let user;
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
          phone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", clerkId)
        .select()
        .single();

      if (error) throw error;
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([{
          clerk_id: clerkId,
          email,
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
          phone,
          address,
          seller_verified: false,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    res.json(user);
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// Update user profile
app.put("/api/users/profile", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.clerk_id;
    delete updates.seller_verified;
    delete updates.id;

    const { data: user, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_id", clerkId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User profile not found" });
      }
      throw error;
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Request seller verification
app.post("/api/users/request-seller-verification", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    const { businessLicense, taxId, bankAccountDetails } = req.body;

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.user_type !== 'seller') {
      return res.status(400).json({ error: "Only sellers can request verification" });
    }

    // Create verification request
    const { data: verificationRequest, error } = await supabase
      .from("seller_verification_requests")
      .insert([{
        user_id: user.id,
        business_license: businessLicense,
        tax_id: taxId,
        bank_account_details: bankAccountDetails,
        status: 'pending',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: "Verification request submitted successfully",
      request: verificationRequest 
    });
  } catch (error) {
    console.error("Error submitting verification request:", error);
    res.status(500).json({ error: "Failed to submit verification request" });
  }
});

// Get user verification status
app.get("/api/users/verification-status", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, seller_verified, user_type")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get latest verification request if exists
    const { data: verificationRequest } = await supabase
      .from("seller_verification_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    res.json({
      seller_verified: user.seller_verified,
      user_type: user.user_type,
      verification_request: verificationRequest || null,
    });
  } catch (error) {
    console.error("Error getting verification status:", error);
    res.status(500).json({ error: "Failed to get verification status" });
  }
});

// Get user by ID (for internal service communication)
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register new user (called during Clerk webhook or first login)
app.post("/api/users/register", async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, userType = 'buyer' } = req.body;

    if (!clerkId || !email || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: "User already registered" });
    }

    // Create new user
    const { data: user, error } = await supabase
      .from("users")
      .insert([{
        clerk_id: clerkId,
        email,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        seller_verified: false,
        isVerified: false, // Email verification status
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Cache user data in Redis
    try {
      await redis.setex(`user:${clerkId}`, 3600, JSON.stringify(user));
    } catch (cacheError) {
      console.warn("Redis caching failed:", cacheError);
    }

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login user (validate and return user data)
app.post("/api/users/login", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);

    // Try to get from cache first
    try {
      const cachedUser = await redis.get(`user:${clerkId}`);
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
            isVerified: user.isVerified,
            sellerVerified: user.seller_verified,
          }
        });
      }
    } catch (cacheError) {
      console.warn("Redis cache read failed:", cacheError);
    }

    // Get from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        error: "User not found. Please complete registration." 
      });
    }

    // Update cache
    try {
      await redis.setex(`user:${clerkId}`, 3600, JSON.stringify(user));
    } catch (cacheError) {
      console.warn("Redis caching failed:", cacheError);
    }

    // Update last login time
    await supabase
      .from("users")
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq("clerk_id", clerkId);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isVerified: user.isVerified,
        sellerVerified: user.seller_verified,
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify user account (email verification)
app.post("/api/users/verify-account", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    const { verificationCode } = req.body;

    // In a real system, you'd validate the verification code
    // For now, we'll just mark the user as verified
    const { data: user, error } = await supabase
      .from("users")
      .update({ 
        isVerified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq("clerk_id", clerkId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "User not found" });
      }
      throw error;
    }

    // Clear cache to force refresh
    try {
      await redis.del(`user:${clerkId}`);
    } catch (cacheError) {
      console.warn("Redis cache clear failed:", cacheError);
    }

    res.json({
      message: "Account verified successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error("Error verifying account:", error);
    res.status(500).json({ error: "Failed to verify account" });
  }
});

// Get user role and permissions
app.get("/api/users/role", requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);

    const { data: user, error } = await supabase
      .from("users")
      .select("user_type, seller_verified, isVerified")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const permissions = [];
    
    // Basic user permissions
    if (user.isVerified) {
      permissions.push("bid_on_auctions", "view_auctions");
    }

    // Seller permissions
    if (user.user_type === 'seller') {
      permissions.push("create_auctions");
      if (user.seller_verified) {
        permissions.push("publish_auctions", "manage_auctions");
      }
    }

    // Admin permissions (you can extend this)
    if (user.user_type === 'admin') {
      permissions.push("manage_users", "verify_sellers", "moderate_auctions");
    }

    res.json({
      role: user.user_type,
      isVerified: user.isVerified,
      sellerVerified: user.seller_verified,
      permissions
    });
  } catch (error) {
    console.error("Error getting user role:", error);
    res.status(500).json({ error: "Failed to get user role" });
  }
});

// Admin: Approve seller verification
app.post("/api/admin/approve-seller/:userId", requireAuth(), async (req, res) => {
  try {
    const { userId: adminClerkId } = getAuth(req);
    const { userId } = req.params;
    const { approved, notes } = req.body;

    // Verify admin permissions (you might want to add admin role check)
    const { data: admin } = await supabase
      .from("users")
      .select("id, user_type")
      .eq("clerk_id", adminClerkId)
      .single();

    if (!admin || admin.user_type !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Update seller verification status
    const { data: user, error } = await supabase
      .from("users")
      .update({ 
        seller_verified: approved,
        updated_at: new Date().toISOString() 
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    // Update verification request
    await supabase
      .from("seller_verification_requests")
      .update({
        status: approved ? 'approved' : 'rejected',
        admin_notes: notes,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    res.json({
      message: `Seller verification ${approved ? 'approved' : 'rejected'}`,
      user
    });
  } catch (error) {
    console.error("Error processing seller verification:", error);
    res.status(500).json({ error: "Failed to process verification" });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
