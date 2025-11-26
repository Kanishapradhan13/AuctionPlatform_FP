// Mock Supabase client for testing
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  insert: jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({
        data: { 
          id: 'mock-notification-id', 
          event_type: 'BID_PLACED',
          user_email: 'test@example.com',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        error: null
      }))
    }))
  })),
  select: jest.fn(() => ({
    order: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({
        data: [
          {
            id: 'mock-1',
            event_type: 'BID_PLACED',
            user_email: 'test1@example.com',
            auction_title: 'Test Property 1',
            status: 'sent',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            event_type: 'OUTBID',
            user_email: 'test2@example.com',
            auction_title: 'Test Property 2',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ],
        error: null
      }))
    }))
  })),
  update: jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { 
            id: 'mock-notification-id', 
            status: 'sent',
            sent_at: new Date().toISOString()
          },
          error: null
        }))
      }))
    }))
  }))
};

module.exports = mockSupabase;
