const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

// Only log in non-test environments
if (process.env.NODE_ENV !== 'test') {
  console.log('🔗 Connecting to Supabase...');
  console.log('URL:', supabaseUrl.replace(/\.co.*$/, '.co')); // Hide full URL for security
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection (only in non-test environments)
async function testConnection() {
  if (process.env.NODE_ENV === 'test') {
    return; // Skip connection test in test environment
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('⚠️  Notifications table might not exist yet. Run database-setup.sql');
    } else {
      console.log('✅ Successfully connected to Supabase');
    }
  } catch (err) {
    console.log('⚠️  Supabase connection test:', err.message);
  }
}

testConnection();

module.exports = supabase;