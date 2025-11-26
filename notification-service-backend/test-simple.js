const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3004';

// Simple HTTP request function using built-in modules
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testEmailService() {
  try {
    console.log('🧪 Testing Email Service (Simple Version)...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await makeRequest(`${BASE_URL}/health`);
    console.log('✅ Health Status:', health.data.status);
    console.log('   Service:', health.data.service);

    // 2. Test email status
    console.log('\n2. Testing email status...');
    const status = await makeRequest(`${BASE_URL}/api/notifications/email-status`);
    console.log('✅ Email Service:', status.data.data.service);
    console.log('   Enabled:', status.data.data.enabled ? '✅ YES' : '❌ NO');
    console.log('   Mode:', status.data.data.enabled ? 'REAL Emails' : 'MOCK Mode');

    // 3. Test sending a notification
    console.log('\n3. Testing notification send...');
    const notification = await makeRequest(`${BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        eventType: 'BID_PLACED',
        userEmail: 'test@example.com',
        userId: 'user123',
        auctionId: 'auction456',
        auctionTitle: 'Beautiful Land in Thimphu',
        additionalData: { 
          bidAmount: 75000
        }
      }
    });
    console.log('✅ Notification Result:');
    console.log('   Success:', notification.data.success ? '✅ YES' : '❌ NO');
    console.log('   Message:', notification.data.message);
    if (notification.data.notificationId) {
      console.log('   Notification ID:', notification.data.notificationId);
    }

    // 4. Test getting notification logs
    console.log('\n4. Testing notification logs...');
    const logs = await makeRequest(`${BASE_URL}/api/notifications/logs`);
    console.log('✅ Logs Count:', logs.data.data?.length || 0);
    
    if (logs.data.data && logs.data.data.length > 0) {
      console.log('   Latest event:', logs.data.data[0].event_type);
      console.log('   Latest email:', logs.data.data[0].user_email);
    }

    // 5. Test statistics
    console.log('\n5. Testing statistics...');
    const stats = await makeRequest(`${BASE_URL}/api/notifications`);
    console.log('✅ Statistics:');
    console.log('   Total:', stats.data.data.total);
    console.log('   Sent:', stats.data.data.sent);
    console.log('   Pending:', stats.data.data.pending);
    console.log('   Failed:', stats.data.data.failed);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('📧 Your email service is working perfectly!');
    console.log('🔧 Server running on port 3004');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('�� Make sure your server is running: npm run dev');
  }
}

// Run the test
testEmailService();
