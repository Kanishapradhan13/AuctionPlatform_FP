const supabase = require('../../src/utils/supabase');

describe('Utility Functions - Unit Tests', () => {
  test('supabase client is properly initialized', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  test('environment variables are set for testing', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.PORT).toBe('3004');
  });

  test('test environment uses mock values', () => {
    expect(process.env.SUPABASE_URL).toBe('https://test-supabase-url.supabase.co');
    expect(process.env.SUPABASE_ANON_KEY).toBe('test-supabase-key');
    expect(process.env.RESEND_API_KEY).toBe('test-resend-key');
  });
});
