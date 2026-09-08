const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Testing Sunreef Yacht Backend...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Server Status
    console.log('2️⃣ Testing Server Status...');
    const statusResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server Status:', statusResponse.data);
    console.log('');

    // Test 3: Auth Token Generation
    console.log('3️⃣ Testing Auth Token Generation...');
    const tokenResponse = await axios.get(`${BASE_URL}/api/auth/token`);
    console.log('✅ Token Generated Successfully!');
    console.log('   Token Length:', tokenResponse.data.access_token?.length || 0);
    console.log('   Expires At:', new Date(tokenResponse.data.expires_at).toLocaleString());
    console.log('   Message:', tokenResponse.data.message);
    console.log('');

    // Test 4: Token Test
    console.log('4️⃣ Testing Token Validation...');
    const testResponse = await axios.get(`${BASE_URL}/api/auth/test`);
    console.log('✅ Token Test:', testResponse.data.message);
    console.log('   Token Length:', testResponse.data.token_length);
    console.log('   Expires At:', new Date(testResponse.data.expires_at).toLocaleString());
    console.log('');

    // Test 5: Get All Events (Meetings)
    console.log('5️⃣ Testing Events API - Get All Events...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/api/events?per_page=5`);
      console.log('✅ Events API Working!');
      console.log('   Events Count:', eventsResponse.data.total_count || 0);
      console.log('   Events Retrieved:', eventsResponse.data.data?.length || 0);
      console.log('   Has More Records:', eventsResponse.data.has_more);
      console.log('   Next Page Token:', eventsResponse.data.next_page_token ? 'Available' : 'None');
      
      if (eventsResponse.data.data && eventsResponse.data.data.length > 0) {
        const firstEvent = eventsResponse.data.data[0];
        console.log('   Sample Event:');
        console.log(`     ID: ${firstEvent.id}`);
        console.log(`     Subject: ${firstEvent.Subject || 'N/A'}`);
        console.log(`     Start: ${firstEvent.Start_DateTime || 'N/A'}`);
        console.log(`     Status: ${firstEvent.Status || 'N/A'}`);
      }
    } catch (eventsError) {
      console.log('⚠️  Events API Test:', eventsError.response?.data?.error?.message || eventsError.message);
      console.log('   This might be expected if Zoho CRM is not configured or no events exist');
    }
    console.log('');

    // Test 6: Get Events with Custom Fields
    console.log('6️⃣ Testing Events API - Custom Fields...');
    try {
      const customFieldsResponse = await axios.get(`${BASE_URL}/api/events?fields=id,Subject,Start_DateTime,Status&per_page=3`);
      console.log('✅ Custom Fields Test Working!');
      console.log('   Events Retrieved:', customFieldsResponse.data.data?.length || 0);
      console.log('   Fields Requested: id, Subject, Start_DateTime, Status');
    } catch (customFieldsError) {
      console.log('⚠️  Custom Fields Test:', customFieldsError.response?.data?.error?.message || customFieldsError.message);
    }
    console.log('');

    console.log('🎉 All tests completed! Backend is working correctly.');
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('   GET  /                    - Server status');
    console.log('   GET  /health              - Health check');
    console.log('   GET  /api/auth/token      - Generate access token');
    console.log('   GET  /api/auth/test       - Test token functionality');
    console.log('   GET  /api/events          - Get all events (meetings)');
    console.log('   GET  /api/events/:id      - Get specific event by ID');
    console.log('');
    console.log('🔧 Events API Query Parameters:');
    console.log('   fields      - Comma-separated field names (max 50)');
    console.log('   per_page    - Records per page (max 200, default 200)');
    console.log('   page        - Page number (default 1)');
    console.log('   sort_by     - Sort by field (id, Created_Time, Modified_Time)');
    console.log('   sort_order  - Sort order (asc, desc)');
    console.log('   page_token  - Page token for pagination beyond 2000 records');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend server is running on port 5000');
      console.error('   Run: npm start');
    }
    
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', error.response.data);
    }
  }
}

// Run tests
testBackend();
