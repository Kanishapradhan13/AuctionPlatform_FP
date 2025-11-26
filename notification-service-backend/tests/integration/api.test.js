const emailService = require('../../src/services/emailService');

// Mock Supabase for integration tests
jest.mock('../../src/utils/supabase', () => {
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

describe('Email Service - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processNotification completes full notification flow', async () => {
    const notificationData = {
      eventType: 'BID_PLACED',
      userEmail: 'integration.test@example.com',
      userId: 'integration-user-123',
      auctionId: 'integration-auction-456',
      auctionTitle: 'Integration Test Property',
      bidAmount: 75000 // Added this field for template generation
    };

    const result = await emailService.processNotification(notificationData);

    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.mode).toBeDefined();
  });

  test('email service handles template generation errors gracefully', async () => {
    const invalidNotificationData = {
      eventType: 'INVALID_EVENT_TYPE', // No template exists for this
      userEmail: 'test@example.com',
      auctionTitle: 'Test Property'
    };

    const result = await emailService.processNotification(invalidNotificationData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('No template');
  });

  // FIXED: Changed from getEmailStatus() to getStatus()
  test('email service status reflects current configuration', () => {
    const status = emailService.getStatus(); // Fixed method name

    expect(status).toBeDefined();
    expect(status.enabled).toBe(false); // Should be false in test mode (no valid API key)
    expect(status.service).toBe('Resend');
    expect(status.fromEmail).toBe('onboarding@resend.dev');
  });
});