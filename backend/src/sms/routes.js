// smsRoutes.js - Backend routes for SMS functionality with TextIt API
const express = require('express');
const router = express.Router();
const axios = require('axios');

// TextIt API Configuration
// Store these in environment variables
const TEXTIT_API_URL = process.env.TEXTIT_API_URL || 'https://textit.in/api/v2';
const TEXTIT_API_KEY = process.env.TEXTIT_API_KEY; // Your TextIt API key
const TEXTIT_FLOW_UUID = process.env.TEXTIT_FLOW_UUID; // Your flow UUID for sending messages

/**
 * GET /api/sms/settings
 * Get SMS gateway settings and balance
 */
router.get('/settings', async (req, res) => {
  try {
    // Fetch account balance/credits from TextIt
    const response = await axios.get(`${TEXTIT_API_URL}/credits.json`, {
      headers: {
        'Authorization': `Token ${TEXTIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const credits = response.data;

    res.json({
      balance: credits.credits || 0,
      status: credits.credits > 0 ? 'connected' : 'disconnected',
      provider: 'TextIt',
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching SMS settings:', error.message);
    res.json({
      balance: 0,
      status: 'error',
      provider: 'TextIt',
      error: error.message
    });
  }
});

/**
 * POST /api/sms/send
 * Send SMS to selected customers
 * Body: {
 *   customers: [{id, name, phone}],
 *   message: string
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { customers, message } = req.body;

    // Validate input
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one customer'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Prepare contacts for TextIt
    const contacts = customers.map(customer => ({
      name: customer.name,
      urns: [`tel:${customer.phone.replace(/[^0-9+]/g, '')}`] // Clean phone number
    }));

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    // Send SMS via TextIt Broadcast API
    // TextIt recommends sending in batches for large contact lists
    const batchSize = 100;
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);

      try {
        // Personalize message for each contact
        const urns = batch.map(contact => contact.urns[0]);

        const response = await axios.post(
          `${TEXTIT_API_URL}/broadcasts.json`,
          {
            urns: urns,
            text: message, // TextIt will handle personalization with contact fields
            // Optionally use a flow instead:
            // flow: TEXTIT_FLOW_UUID,
            // params: { message: message }
          },
          {
            headers: {
              'Authorization': `Token ${TEXTIT_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.id) {
          sentCount += batch.length;
        } else {
          failedCount += batch.length;
          errors.push(`Batch ${i / batchSize + 1} failed`);
        }
      } catch (batchError) {
        console.error(`Error sending batch ${i / batchSize + 1}:`, batchError.message);
        failedCount += batch.length;
        errors.push(`Batch ${i / batchSize + 1}: ${batchError.message}`);
      }
    }

    // Log SMS activity to database (optional)
    // await logSMSActivity(customers, message, sentCount, failedCount);

    res.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: customers.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully sent SMS to ${sentCount} customer(s)`
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS',
      error: error.response?.data || error.message
    });
  }
});

/**
 * POST /api/sms/send-individual
 * Send SMS to a single customer
 * Body: {
 *   phone: string,
 *   name: string,
 *   message: string
 * }
 */
router.post('/send-individual', async (req, res) => {
  try {
    const { phone, name, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Personalize message
    const personalizedMessage = message
      .replace(/{name}/g, name || 'Customer')
      .replace(/{phone}/g, phone);

    const response = await axios.post(
      `${TEXTIT_API_URL}/broadcasts.json`,
      {
        urns: [`tel:${cleanPhone}`],
        text: personalizedMessage
      },
      {
        headers: {
          'Authorization': `Token ${TEXTIT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.id) {
      res.json({
        success: true,
        message: 'SMS sent successfully',
        broadcast_id: response.data.id
      });
    } else {
      throw new Error('Failed to send SMS');
    }

  } catch (error) {
    console.error('Error sending individual SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS',
      error: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/sms/templates
 * Get SMS templates
 */
router.get('/templates', async (req, res) => {
  try {
    // You can store templates in database or return predefined ones
    const templates = [
      {
        id: 'maintenance_reminder',
        name: 'Maintenance Reminder',
        message: 'Hi {name}, your vehicle maintenance is due soon. Book your slot today! Call us at {phone}',
        category: 'reminder'
      },
      {
        id: 'booking_confirmation',
        name: 'Booking Confirmation',
        message: 'Hi {name}, your booking for {date} has been confirmed. See you soon!',
        category: 'confirmation'
      },
      {
        id: 'service_complete',
        name: 'Service Complete',
        message: 'Hi {name}, your vehicle service is complete. You can pick it up anytime!',
        category: 'notification'
      },
      {
        id: 'payment_reminder',
        name: 'Payment Reminder',
        message: 'Hi {name}, you have a pending payment of {amount}. Please clear it at your earliest convenience.',
        category: 'payment'
      }
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
});

/**
 * GET /api/sms/webhook-status
 * Check TextIt webhook configuration status
 */
router.get('/webhook-status', async (req, res) => {
  try {
    const response = await axios.get(`${TEXTIT_API_URL}/webhooks.json`, {
      headers: {
        'Authorization': `Token ${TEXTIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      webhooks: response.data.results || [],
      count: response.data.results?.length || 0
    });
  } catch (error) {
    console.error('Error fetching webhook status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch webhook status',
      error: error.message
    });
  }
});

/**
 * POST /api/sms/webhook
 * Webhook endpoint for TextIt to send delivery reports and incoming messages
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('Received webhook from TextIt:', JSON.stringify(webhookData, null, 2));

    // Handle different webhook types
    if (webhookData.type === 'mo_sms') {
      // Incoming SMS
      console.log('Incoming SMS:', {
        from: webhookData.from,
        text: webhookData.text,
        channel: webhookData.channel
      });
      
      // Process incoming message (e.g., auto-reply, log to database)
      // await processIncomingMessage(webhookData);
    } else if (webhookData.type === 'mt_sent') {
      // Message sent confirmation
      console.log('Message sent:', webhookData.id);
      
      // Update delivery status in database
      // await updateMessageStatus(webhookData.id, 'sent');
    } else if (webhookData.type === 'mt_dlvd') {
      // Message delivered confirmation
      console.log('Message delivered:', webhookData.id);
      
      // Update delivery status in database
      // await updateMessageStatus(webhookData.id, 'delivered');
    } else if (webhookData.type === 'mt_fail') {
      // Message failed
      console.log('Message failed:', webhookData.id);
      
      // Update delivery status in database
      // await updateMessageStatus(webhookData.id, 'failed');
    }

    // Always return 200 OK to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to prevent TextIt from retrying
    res.status(200).json({ success: false, error: error.message });
  }
});

module.exports = router;