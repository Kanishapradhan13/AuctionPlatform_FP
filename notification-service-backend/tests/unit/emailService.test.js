const emailService = require('../../src/services/emailService');

// Mock the supabase dependency properly
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

describe('Email Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generateEmailTemplate returns correct template for BID_PLACED', () => {
    const testData = {
      auctionTitle: 'Beautiful Land in Thimphu',
      bidAmount: 85000
    };

    const template = emailService.generateEmailTemplate('BID_PLACED', testData);

    expect(template).toBeDefined();
    expect(template.subject).toContain('Bid Confirmed');
    expect(template.subject).toContain('Beautiful Land in Thimphu');
    expect(template.html).toContain('85,000'); // Now formatted with commas
    expect(template.text).toContain('Bid Confirmed');
  });

  test('generateEmailTemplate returns correct template for OUTBID', () => {
    const testData = {
      auctionTitle: 'Luxury Vehicle in Paro',
      currentBid: 120000
    };

    const template = emailService.generateEmailTemplate('OUTBID', testData);

    expect(template).toBeDefined();
    expect(template.subject).toContain('Outbid');
    expect(template.subject).toContain('Luxury Vehicle in Paro');
    expect(template.html).toContain('120,000'); // Now formatted with commas
    expect(template.text).toContain('Outbid');
  });

  test('generateEmailTemplate returns correct template for AUCTION_WON', () => {
    const testData = {
      auctionTitle: 'Residential Property',
      winningBid: 95000
    };

    const template = emailService.generateEmailTemplate('AUCTION_WON', testData);

    expect(template).toBeDefined();
    expect(template.subject).toContain('Congratulations');
    expect(template.subject).toContain('Residential Property');
    expect(template.html).toContain('95,000'); // Now formatted with commas
    expect(template.text).toContain('Congratulations');
  });

  test('generateEmailTemplate returns null for unknown event type', () => {
    const template = emailService.generateEmailTemplate('UNKNOWN_EVENT', {});
    
    expect(template).toBeNull();
  });

  // FIXED: Changed from getEmailStatus() to getStatus()
  test('getStatus returns correct status object', () => {
    const status = emailService.getStatus(); // Fixed method name

    expect(status).toHaveProperty('enabled');
    expect(status).toHaveProperty('service');
    expect(status).toHaveProperty('fromEmail');
    expect(status).toHaveProperty('fromName');
    expect(typeof status.enabled).toBe('boolean');
    expect(status.service).toBe('Resend');
  });

  test('email service is properly initialized', () => {
    expect(emailService).toBeDefined();
    expect(emailService.sendEmail).toBeDefined();
    expect(emailService.processNotification).toBeDefined();
  });
});