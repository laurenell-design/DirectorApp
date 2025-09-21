const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate environment variables
const requiredEnvVars = ['MAIN_APP_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const MAIN_APP_URL = process.env.MAIN_APP_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug logging middleware
if (DEBUG_MODE) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mainAppUrl: MAIN_APP_URL
  });
});

// Twilio webhook endpoint
app.post('/twilio-webhook', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Extract Twilio webhook data
    const {
      From: from,
      To: to,
      Body: body = '',
      MessageSid: messageId,
      NumMedia: numMedia = '0'
    } = req.body;

    console.log(`📨 Received webhook from ${from} to ${to}`);
    
    // Extract media URLs
    const mediaUrls = [];
    const mediaCount = parseInt(numMedia, 10);
    
    for (let i = 0; i < mediaCount; i++) {
      const mediaUrl = req.body[`MediaUrl${i}`];
      if (mediaUrl) {
        mediaUrls.push(mediaUrl);
      }
    }

    // Respond to Twilio quickly (within 15 seconds)
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');

    // Prepare payload for main app
    const payload = {
      from,
      to,
      body,
      mediaUrls,
      messageId,
      receivedAt: new Date().toISOString()
    };

    console.log(`🚀 Forwarding to main app: ${MAIN_APP_URL}/api/twilio/webhook`);
    
    // Forward to main app asynchronously
    try {
      const forwardResponse = await axios.post(
        `${MAIN_APP_URL}/api/twilio/webhook`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const processingTime = Date.now() - startTime;
      console.log(`✅ Successfully forwarded webhook in ${processingTime}ms`);
      
      if (DEBUG_MODE) {
        console.log('Forward response:', forwardResponse.data);
      }
    } catch (forwardError) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Failed to forward webhook after ${processingTime}ms:`, forwardError.message);
      
      if (forwardError.response) {
        console.error('Response status:', forwardError.response.status);
        console.error('Response data:', forwardError.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // If we haven't responded yet, send error response
    if (!res.headersSent) {
      res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: ['/health', '/twilio-webhook']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: DEBUG_MODE ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Director App running on port ${PORT}`);
  console.log(`📡 Main app URL: ${MAIN_APP_URL}`);
  console.log(`🔧 Debug mode: ${DEBUG_MODE ? 'enabled' : 'disabled'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /twilio-webhook - Twilio webhook handler`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});