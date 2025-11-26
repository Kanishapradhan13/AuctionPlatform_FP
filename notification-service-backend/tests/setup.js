// tests/setup.js - Global test setup
require('dotenv').config();

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-supabase-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.PORT = '3004';

// Mock Supabase client globally
jest.mock('../src/utils/supabase', () => {
  const mockSupabase = {
    from: jest.fn(() => mockSupabase),
    insert: jest.fn(() => mockSupabase),
    update: jest.fn(() => mockSupabase),
    eq: jest.fn(() => mockSupabase),
    select: jest.fn(() => mockSupabase),
    single: jest.fn(() => Promise.resolve({ 
      data: { id: 'test-notification-id', status: 'pending' }, 
      error: null 
    }))
  };
  return mockSupabase;
});

console.log('🧪 Test environment loaded');