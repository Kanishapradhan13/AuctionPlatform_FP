const { Resend } = require('resend');
const supabase = require('../config/supabase');

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  constructor() {
    this.resend = resend;
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

  // Send email with Resend (MOCK MODE)
  async sendEmail(emailData) {
    try {
      const { to, subject, html, text } = emailData;

      // MOCK MODE - No real emails sent
      console.log('📧 [MOCK MODE] Email would be sent:', { to, subject });
      return {
        success: true,
        data: { id: 'mock_email_id' },
        message: 'Mock email sent successfully'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  // Generate email templates
  generateEmailTemplate(eventType, data) {
    const templates = {
      'BID_PLACED': {
        subject: `Your Bid Was Placed - ${data.auctionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2c5aa0; color: white; padding: 20px; text-align: center;">
              <h1>🇧🇹 Bhutan Online Auction Platform</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Bid Confirmation</h2>
              <p>Hello,</p>
              <p>Your bid has been successfully placed!</p>
              <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2c5aa0;">
                <strong>Auction:</strong> ${data.auctionTitle}<br>
                <strong>Your Bid:</strong> Nu. ${data.bidAmount}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </div>
              <p>You will be notified if someone outbids you.</p>
            </div>
          </div>
        `,
        text: `Bid Confirmation - Your bid of Nu. ${data.bidAmount} on ${data.auctionTitle} was placed successfully.`
      },

      'OUTBID': {
        subject: `You've Been Outbid - ${data.auctionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #d9534f; color: white; padding: 20px; text-align: center;">
              <h1>🇧🇹 Bhutan Online Auction Platform</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>You've Been Outbid!</h2>
              <p>Hello,</p>
              <p>Someone has placed a higher bid on an auction you're participating in.</p>
              <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d9534f;">
                <strong>Auction:</strong> ${data.auctionTitle}<br>
                <strong>Current Highest Bid:</strong> Nu. ${data.currentBid}<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </div>
              <p>Place a new bid to stay in the competition!</p>
            </div>
          </div>
        `,
        text: `Outbid Notification - Current bid on ${data.auctionTitle} is now Nu. ${data.currentBid}.`
      }
    };

    return templates[eventType] || null;
  }

  // Main method to process notifications
  async processNotification(notificationData) {
    let loggedNotification;

    try {
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

      // 2. Generate email template
      const template = this.generateEmailTemplate(notificationData.eventType, notificationData);

      if (!template) {
        throw new Error(`No template found for event type: ${notificationData.eventType}`);
      }

      // 3. Send email (MOCK MODE)
      const emailResult = await this.sendEmail({
        to: notificationData.userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      // 4. Update notification status based on result
      if (emailResult.success) {
        await this.updateNotificationStatus(loggedNotification.id, 'sent');
        return {
          success: true,
          notificationId: loggedNotification.id,
          message: 'Notification sent successfully'
        };
      } else {
        await this.updateNotificationStatus(
          loggedNotification.id, 
          'failed', 
          emailResult.error
        );
        return {
          success: false,
          notificationId: loggedNotification.id,
          error: emailResult.error,
          message: 'Failed to send notification'
        };
      }

    } catch (error) {
      console.error('Error processing notification:', error);

      if (loggedNotification) {
        await this.updateNotificationStatus(
          loggedNotification.id, 
          'failed', 
          error.message
        );
      }

      return {
        success: false,
        error: error.message,
        message: 'Failed to process notification'
      };
    }
  }
}

module.exports = new EmailService();