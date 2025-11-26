const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const supabase = require('../utils/supabase');

// Get notification statistics
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      sent: data?.filter(n => n.status === 'sent').length || 0,
      pending: data?.filter(n => n.status === 'pending').length || 0,
      failed: data?.filter(n => n.status === 'failed').length || 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send notification endpoint
router.post('/send', async (req, res) => {
  try {
    const { eventType, userEmail, userId, auctionId, auctionTitle, additionalData } = req.body;

    // Validate required fields
    if (!eventType || !userEmail || !auctionTitle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventType, userEmail, auctionTitle'
      });
    }

    const result = await emailService.processNotification({
      eventType,
      userEmail,
      userId,
      auctionId,
      auctionTitle,
      additionalData: additionalData || {}
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notification logs
router.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email service status - FIXED METHOD NAME
router.get('/email-status', (req, res) => {
  try {
    const status = emailService.getStatus(); // Changed from getEmailStatus() to getStatus()
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await emailService.sendEmail({
      to: email,
      subject: 'Test Email - Bhutan Auction Platform',
      html: '<h2>Test Email</h2><p>Your email service is working!</p>',
      text: 'Test Email - Your email service is working!'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;