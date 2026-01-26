// smsRoutes.js - Backend routes for TextIt.biz SMS gateway
const express = require('express');
const router = express.Router();
const axios = require('axios');

// TextIt.biz API Configuration from environment
const SMS_BASE_URL = process.env.SMS_BASE_URL || 'https://www.textit.biz/sendmsg';
const SMS_CREDIT_CHECK_URL = 'https://www.textit.biz/creditchk';
const SMS_ACCOUNT_ID = process.env.SMS_ACCOUNT_ID;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

/**
 * GET /api/sms/settings
 * Get SMS gateway settings and status with balance check
 */
router.get('/settings', async (req, res) => {
  try {
    if (!SMS_ENABLED) {
      return res.json({
        balance: 0,
        status: 'disabled',
        provider: 'TextIt.biz',
        message: 'SMS service is disabled'
      });
    }

    if (!SMS_ACCOUNT_ID || !SMS_PASSWORD) {
      return res.json({
        balance: 0,
        status: 'error',
        provider: 'TextIt.biz',
        message: 'SMS credentials not configured'
      });
    }

    // Fetch balance from TextIt.biz credit check API
    try {
      const params = new URLSearchParams({
        id: SMS_ACCOUNT_ID,
        pw: SMS_PASSWORD
      });

      const balanceResponse = await axios.get(`${SMS_CREDIT_CHECK_URL}?${params.toString()}`, {
        timeout: 5000
      });

      // TextIt.biz returns balance as plain text number
      const balance = parseInt(balanceResponse.data.toString().trim()) || 0;

      res.json({
        balance: balance,
        status: balance > 0 ? 'connected' : 'low_balance',
        provider: 'TextIt.biz',
        account_id: SMS_ACCOUNT_ID,
        last_updated: new Date().toISOString()
      });
    } catch (balanceError) {
      console.error('Error fetching balance:', balanceError.message);
      
      // Return connected status even if balance check fails
      res.json({
        balance: 0,
        status: 'connected',
        provider: 'TextIt.biz',
        account_id: SMS_ACCOUNT_ID,
        last_updated: new Date().toISOString(),
        balance_check_error: 'Unable to fetch balance'
      });
    }

  } catch (error) {
    console.error('Error fetching SMS settings:', error.message);
    res.json({
      balance: 0,
      status: 'error',
      provider: 'TextIt.biz',
      error: error.message
    });
  }
});

/**
 * GET /api/sms/balance
 * Get current SMS credit balance from TextIt.biz
 */
router.get('/balance', async (req, res) => {
  try {
    if (!SMS_ENABLED) {
      return res.status(400).json({
        success: false,
        message: 'SMS service is disabled'
      });
    }

    if (!SMS_ACCOUNT_ID || !SMS_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: 'SMS credentials not configured'
      });
    }

    const params = new URLSearchParams({
      id: SMS_ACCOUNT_ID,
      pw: SMS_PASSWORD
    });

    const response = await axios.get(`${SMS_CREDIT_CHECK_URL}?${params.toString()}`, {
      timeout: 5000
    });

    // TextIt.biz returns balance as plain text number
    const balance = parseInt(response.data.toString().trim()) || 0;

    res.json({
      success: true,
      balance: balance,
      credits_remaining: balance,
      status: balance > 0 ? 'active' : 'low_balance',
      warning: balance < 100 ? 'Low balance - please recharge' : null,
      checked_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking balance:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check balance',
      error: error.message
    });
  }
});

/**
 * POST /api/sms/send
 * Send SMS to selected customers via TextIt.biz
 */
router.post('/send', async (req, res) => {
  try {
    if (!SMS_ENABLED) {
      return res.status(400).json({
        success: false,
        message: 'SMS service is disabled'
      });
    }

    const { customers, message } = req.body;

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

    if (!SMS_ACCOUNT_ID || !SMS_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: 'SMS credentials not configured'
      });
    }

    // Check balance before sending
    try {
      const balanceParams = new URLSearchParams({
        id: SMS_ACCOUNT_ID,
        pw: SMS_PASSWORD
      });
      
      const balanceResponse = await axios.get(`${SMS_CREDIT_CHECK_URL}?${balanceParams.toString()}`, {
        timeout: 5000
      });
      
      const balance = parseInt(balanceResponse.data.toString().trim()) || 0;
      
      if (balance < customers.length) {
        return res.status(400).json({
          success: false,
          message: `Insufficient SMS credits. Available: ${balance}, Required: ${customers.length}`,
          balance: balance,
          required: customers.length
        });
      }
    } catch (balanceError) {
      console.warn('Could not check balance before sending:', balanceError.message);
      // Continue anyway - let the send attempt fail if insufficient credits
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors = [];

    // Send SMS to each customer
    for (const customer of customers) {
      try {
        // Clean and format phone number for Sri Lanka
        let cleanPhone = customer.phone.replace(/[\s\-()]/g, '');
        
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '94' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('7')) {
          cleanPhone = '94' + cleanPhone;
        }
        cleanPhone = cleanPhone.replace(/^\+/, '');

        // Personalize message
        const personalizedMessage = message.replace(/{name}/g, customer.name);

        // TextIt.biz API call
        const params = new URLSearchParams({
          id: SMS_ACCOUNT_ID,
          pw: SMS_PASSWORD,
          to: cleanPhone,
          text: personalizedMessage
        });

        console.log(`Sending SMS to ${customer.name} (${cleanPhone})`);

        const response = await axios.get(`${SMS_BASE_URL}?${params.toString()}`, {
          timeout: 10000
        });

        const responseText = response.data.toString().trim();
        
        if (responseText === '0' || responseText.toLowerCase().includes('ok') || responseText.toLowerCase().includes('success')) {
          sentCount++;
        } else {
          failedCount++;
          errors.push({
            customer_id: customer.id,
            name: customer.name,
            phone: cleanPhone,
            error: responseText
          });
        }

      } catch (smsError) {
        failedCount++;
        errors.push({
          customer_id: customer.id,
          name: customer.name,
          phone: customer.phone,
          error: smsError.message
        });
      }

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: customers.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully sent SMS to ${sentCount} of ${customers.length} customer(s)`
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS'
    });
  }
});

/**
 * POST /api/sms/send-individual
 * Send SMS to a single customer
 */
router.post('/send-individual', async (req, res) => {
  try {
    if (!SMS_ENABLED) {
      return res.status(400).json({
        success: false,
        message: 'SMS service is disabled'
      });
    }

    const { phone, name, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    // Clean and format phone number
    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = '94' + cleanPhone;
    }
    cleanPhone = cleanPhone.replace(/^\+/, '');

    // Personalize message
    const personalizedMessage = message.replace(/{name}/g, name || 'Customer');

    const params = new URLSearchParams({
      id: SMS_ACCOUNT_ID,
      pw: SMS_PASSWORD,
      to: cleanPhone,
      text: personalizedMessage
    });

    const response = await axios.get(`${SMS_BASE_URL}?${params.toString()}`, {
      timeout: 10000
    });

    const responseText = response.data.toString().trim();

    if (responseText === '0' || responseText.toLowerCase().includes('ok')) {
      res.json({
        success: true,
        message: 'SMS sent successfully',
        phone: cleanPhone
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send SMS',
        error: responseText
      });
    }

  } catch (error) {
    console.error('Error sending individual SMS:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS'
    });
  }
});

/**
 * POST /api/sms/test
 * Test SMS configuration
 */
router.post('/test', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.substring(1);
    }
    cleanPhone = cleanPhone.replace(/^\+/, '');

    const testMessage = 'Test message from your booking system. SMS is working!';

    const params = new URLSearchParams({
      id: SMS_ACCOUNT_ID,
      pw: SMS_PASSWORD,
      to: cleanPhone,
      text: testMessage
    });

    const response = await axios.get(`${SMS_BASE_URL}?${params.toString()}`, {
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'Test SMS sent',
      phone: cleanPhone,
      response: response.data.toString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test SMS failed',
      error: error.message
    });
  }
});

/**
 * GET /api/sms/templates
 * Get SMS templates
 */
router.get('/templates', async (req, res) => {
  const templates = [
    {
      id: 'maintenance_reminder',
      name: 'Maintenance Reminder',
      message: 'Hi {name}, your vehicle maintenance is due soon. Book your slot today!',
      category: 'reminder'
    },
    {
      id: 'booking_confirmation',
      name: 'Booking Confirmation',
      message: 'Hi {name}, your booking has been confirmed. We look forward to seeing you!',
      category: 'confirmation'
    },
    {
      id: 'service_complete',
      name: 'Service Complete',
      message: 'Hi {name}, your vehicle service is complete. You can pick it up anytime.',
      category: 'notification'
    },
    {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      message: 'Hi {name}, you have a pending payment. Please clear it soon.',
      category: 'payment'
    },
    {
      id: 'thank_you',
      name: 'Thank You',
      message: 'Thank you {name} for choosing our service! We appreciate your business.',
      category: 'customer_care'
    },
    {
      id: 'custom',
      name: 'Custom Message',
      message: '',
      category: 'custom'
    }
  ];

  res.json({ success: true, templates });
});

module.exports = router;