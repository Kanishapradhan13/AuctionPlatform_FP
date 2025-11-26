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

    if (error) {
      throw error;
    }

    const notifications = data || [];
    
    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'sent').length,
      pending: notifications.filter(n => n.status === 'pending').length,
      failed: notifications.filter(n => n.status === 'failed').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch notification statistics'
    });
  }
});

// Send notification endpoint
router.post('/send', async (req, res) => {
  try {
    const { eventType, userEmail, userId, auctionId, auctionTitle, additionalData } = req.body;

    // Validate required fields
    if (!eventType || !userEmail || !auctionTitle) {
      return res.status(400).json({
        error: 'Missing required fields: eventType, userEmail, auctionTitle'
      });
    }

    const result = await emailService.processNotification({
      eventType,
      userEmail,
      userId,
      auctionId,
      auctionTitle,
      additionalData
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        notificationId: result.notificationId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get notification logs
router.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching notification logs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch notification logs'
    });
  }
});

module.exports = router;