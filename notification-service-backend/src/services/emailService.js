const { Resend } = require('resend');
const supabase = require('../utils/supabase');
// ADDED: WebSocket import
const websocketServer = require('../websocket/websocketServer');

// Safe Resend initialization
let resend;
let emailEnabled = false;

try {
  const apiKey = process.env.RESEND_API_KEY;
  
  // Check if we have a valid API key (not placeholder)
  if (apiKey && !apiKey.includes('your_resend_api_key') && apiKey.length > 20) {
    resend = new Resend(apiKey);
    emailEnabled = true;
    console.log('Resend email service ENABLED');
  } else {
    console.log('Resend email service in MOCK mode (no valid API key)');
  }
} catch (error) {
  console.log('Resend initialization failed, using MOCK mode:', error.message);
}

// Helper function to format numbers with commas
const formatNumber = (num) => {
  if (!num && num !== 0) return 'N/A';
  return new Intl.NumberFormat().format(Number(num));
};

class EmailService {
  constructor() {
    this.resend = resend;
    this.emailEnabled = emailEnabled;
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    this.fromName = process.env.FROM_NAME || 'Bhutan Auction Platform';
  }

  // Store notification in database
  async logNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging notification:', error);
      throw error;
    }
  }

  // Update notification status
  async updateNotificationStatus(notificationId, status, errorMessage = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { data, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification status:', error);
      throw error;
    }
  }

  // Send email (automatically falls back to mock if needed)
  async sendEmail(emailData) {
    try {
      const { to, subject, html, text } = emailData;

      console.log(`📧 ${this.emailEnabled ? 'REAL' : 'MOCK'} Email to:`, to);
      
      if (this.emailEnabled && this.resend) {
        // Send REAL email via Resend
        const result = await this.resend.emails.send({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: to,
          subject: subject,
          html: html,
          text: text,
        });

        console.log('REAL email sent via Resend');
        
        return {
          success: true,
          data: result,
          message: 'Email sent successfully via Resend',
          mode: 'REAL'
        };
      } else {
        // MOCK email (no API key or Resend not available)
        console.log('MOCK email sent (no Resend API key)');
        
        return {
          success: true,
          data: { id: 'mock_email_' + Date.now() },
          message: 'Mock email sent (configure RESEND_API_KEY for real emails)',
          mode: 'MOCK'
        };
      }
    } catch (error) {
      console.error('Email sending failed:', error.message);
      
      // Fallback to mock mode
      console.log('Falling back to MOCK email');
      return {
        success: true,
        data: { id: 'mock_fallback_' + Date.now() },
        message: 'Email sent in mock mode (Resend service unavailable)',
        mode: 'MOCK_FALLBACK'
      };
    }
  }

  // Simple email templates
  generateEmailTemplate(eventType, data) {
    const templates = {
      'BID_PLACED': {
        subject: `Bid Confirmed - ${data.auctionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2c5aa0;">Bhutan Auction Platform</h2>
            <h3>Bid Confirmation</h3>
            <p>Your bid has been successfully placed!</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Auction:</strong> ${data.auctionTitle}</p>
              <p><strong>Your Bid:</strong> Nu. ${formatNumber(data.bidAmount)}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
        text: `Bid Confirmed - ${data.auctionTitle}\nYour bid: Nu. ${formatNumber(data.bidAmount)}\nTime: ${new Date().toLocaleString()}`
      },
      'OUTBID': {
        subject: `You've Been Outbid - ${data.auctionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #d9534f;">Bhutan Auction Platform</h2>
            <h3>You've Been Outbid!</h3>
            <p>Someone placed a higher bid on your auction.</p>
            <div style="background: #fff5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Auction:</strong> ${data.auctionTitle}</p>
              <p><strong>Current Bid:</strong> Nu. ${formatNumber(data.currentBid)}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
        text: `Outbid - ${data.auctionTitle}\nCurrent bid: Nu. ${formatNumber(data.currentBid)}\nTime: ${new Date().toLocaleString()}`
      },
      'AUCTION_WON': {
        subject: `Congratulations! You Won - ${data.auctionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #5cb85c;">Bhutan Auction Platform</h2>
            <h3>Congratulations! You Won!</h3>
            <p>You have won the auction!</p>
            <div style="background: #f5fff5; padding: 15px; border-radius: 5px;">
              <p><strong>Auction:</strong> ${data.auctionTitle}</p>
              <p><strong>Winning Bid:</strong> Nu. ${formatNumber(data.winningBid)}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
        text: `Congratulations! You won - ${data.auctionTitle} with a bid of Nu. ${formatNumber(data.winningBid)}.`
      }
    };

    return templates[eventType] || null;
  }

  // ADDED: Helper method for real-time notifications
  getNotificationMessage(eventType) {
    const messages = {
      'BID_PLACED': 'Your bid was placed successfully!',
      'OUTBID': 'You have been outbid! Place a new bid to stay in the competition.',
      'AUCTION_WON': 'Congratulations! You won the auction!',
      'AUCTION_ENDING': 'Auction is ending soon!',
      'NEW_BID': 'New bid placed on your auction!'
    };
    return messages[eventType] || 'New notification from Bhutan Auction Platform';
  }

  // Main method to process notifications
  async processNotification(notificationData) {
    let loggedNotification;

    try {
      console.log('Processing notification:', notificationData.eventType);

      // 1. Log the notification in database
      loggedNotification = await this.logNotification({
        event_type: notificationData.eventType,
        user_email: notificationData.userEmail,
        user_id: notificationData.userId,
        auction_id: notificationData.auctionId,
        auction_title: notificationData.auctionTitle,
        additional_data: notificationData.additionalData || {},
        status: 'pending'
      });

      // ✅ ADDED: REAL-TIME WEBSOCKET NOTIFICATION
      if (notificationData.userId) {
        try {
          websocketServer.sendToUser(notificationData.userId, {
            type: 'NEW_NOTIFICATION',
            data: {
              id: loggedNotification.id,
              eventType: notificationData.eventType,
              auctionTitle: notificationData.auctionTitle,
              message: this.getNotificationMessage(notificationData.eventType),
              timestamp: new Date().toISOString(),
              read: false
            }
          });
          console.log('📡 Real-time WebSocket notification sent to user:', notificationData.userId);
        } catch (wsError) {
          console.error('❌ WebSocket broadcast failed:', wsError.message);
          // Don't fail the whole process if WebSocket fails
        }
      }

      // 2. Generate email template
      const template = this.generateEmailTemplate(notificationData.eventType, notificationData);

      if (!template) {
        throw new Error(`No template for event: ${notificationData.eventType}`);
      }

      // 3. Send email (auto-handles real/mock mode)
      const emailResult = await this.sendEmail({
        to: notificationData.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      // 4. Update notification status
      if (emailResult.success) {
        await this.updateNotificationStatus(loggedNotification.id, 'sent');
        return {
          success: true,
          notificationId: loggedNotification.id,
          message: emailResult.message,
          mode: emailResult.mode
        };
      } else {
        await this.updateNotificationStatus(loggedNotification.id, 'failed', emailResult.error);
        return {
          success: false,
          notificationId: loggedNotification.id,
          error: emailResult.error
        };
      }

    } catch (error) {
      console.error('Notification processing failed:', error.message);

      if (loggedNotification) {
        await this.updateNotificationStatus(loggedNotification.id, 'failed', error.message);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check email service status
  getStatus() {
    return {
      enabled: this.emailEnabled,
      service: 'Resend',
      fromEmail: this.fromEmail,
      fromName: this.fromName
    };
  }
}

module.exports = new EmailService();