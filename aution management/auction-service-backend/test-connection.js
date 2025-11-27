// Test Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase Connection...\n');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    // Try to query auctions table
    const { data, error } = await supabase
      .from('auctions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('\n❌ Error connecting to database:');
      console.error(error.message);
      console.error('\nThis likely means:');
      console.error('1. The tables have not been created yet (run database-setup.sql)');
      console.error('2. Or your Supabase credentials are incorrect');
    } else {
      console.log('\n✅ Successfully connected to Supabase!');
      console.log('Tables exist and are accessible.');
    }
  } catch (err) {
    console.error('\n❌ Connection failed:');
    console.error(err.message);
  }
}

testConnection();
