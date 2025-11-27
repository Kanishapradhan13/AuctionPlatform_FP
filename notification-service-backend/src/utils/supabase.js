const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rsmfycuyltyqytsqnsnx.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWZ5Y3V5bHR5cXl0c3Fuc254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzI0ODksImV4cCI6MjA3OTc0ODQ4OX0.znT8IFvk-593-2b0YKM-5uwbS4J4fbM1l_P89vMBqbg';

console.log('🔧 Loading Supabase configuration...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Please check your .env file for SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Test connection
async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
  }
}

testConnection();

module.exports = supabase;