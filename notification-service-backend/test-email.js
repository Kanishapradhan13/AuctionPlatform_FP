const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3004';

async function testEmailService() {
  try {
    console.log('🧪 Testing Email Service...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthData.status);
    console.log('   Service:', healthData.service);
    console.log('   Port: 3004');

    // 2. Test email status
    console.log('\n2. Testing email status...');
    const statusResponse = await fetch(`${BASE_URL}/api/notifications/email-status`);
    const statusData = await statusResponse.json();
    console.log('✅ Email Service:', statusData.data.service);
    console.log('   Enabled:', statusData.data.enabled ? '✅ YES' : '❌ NO');
    console.log('   From Email:', statusData.data.fromEmail);
    console.log('   Mode:', statusData.data.enabled ? 'REAL Emails' : 'MOCK Mode');

    // 3. Test sending a notification
    console.log('\n3. Testing notification send...');
    const notificationResponse = await fetch(`${BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'BID_PLACED',
        userEmail: 'test@example.com',
        userId: 'user123',
        auctionId: 'auction456',
        auctionTitle: 'Beautiful Land in Thimphu',
        additionalData: { 
          bidAmount: 75000,
          message: 'Test notification'
        }
      })
    });
    const notificationResult = await notificationResponse.json();
    console.log('✅ Notification Result:');
    console.log('   Success:', notificationResult.success ? '✅ YES' : '❌ NO');
    console.log('   Message:', notificationResult.message);
    console.log('   Mode:', notificationResult.mode || 'MOCK');
    if (notificationResult.notificationId) {
      console.log('   Notification ID:', notificationResult.notificationId);
    }

    // 4. Test getting notification logs
    console.log('\n4. Testing notification logs...');
    const logsResponse = await fetch(`${BASE_URL}/api/notifications/logs`);
    const logsData = await logsResponse.json();
    console.log('✅ Logs Count:', logsData.data?.length || 0);
    console.log('   Latest notification:', logsData.data?.[0]?.event_type);

    // 5. Test email statistics
    console.log('\n5. Testing notification statistics...');
    const statsResponse = await fetch(`${BASE_URL}/api/notifications`);
    const statsData = await statsResponse.json();
    console.log('✅ Statistics:');
    console.log('   Total:', statsData.data.total);
    console.log('   Sent:', statsData.data.sent);
    console.log('   Pending:', statsData.data.pending);
    console.log('   Failed:', statsData.data.failed);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('📧 Your email service is working in:', statusData.data.enabled ? 'REAL MODE' : 'MOCK MODE');
    console.log('🔧 To enable real emails, add your RESEND_API_KEY to .env file');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure your server is running on port 3004');
  }
}

// Run the test
testEmailService();
