-- User Service Database Schema
-- This should be run in your Supabase SQL editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'admin')),
    phone VARCHAR(50),
    address TEXT,
    seller_verified BOOLEAN DEFAULT FALSE,
    isVerified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller verification requests table
CREATE TABLE IF NOT EXISTS seller_verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_license TEXT,
    tax_id VARCHAR(255),
    bank_account_details JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON seller_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON seller_verification_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can see their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Service role can access all data (for inter-service communication)
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role verification access" ON seller_verification_requests
    FOR ALL USING (auth.role() = 'service_role');
