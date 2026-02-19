// Quick test script to create a user directly in Supabase
// Run with: node scripts/create-test-user.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jaijvjtmnzxhfeaivluz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaWp2anRtbnp4aGZlYWl2bHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODg4ODMsImV4cCI6MjA4Njc2NDg4M30.bgCqBEcUiZPKxcWuU2Yhs-rfsG88NJ9i29pfWI0EMfg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'test123456';

  console.log('Creating test user...');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('✓ Auth user created:', authData.user.id);

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: 'Test User',
        email: testEmail,
        branch: 'Army',
        mos: '25B',
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      return;
    }

    console.log('✓ Profile created');
    console.log('\nYou can now login with:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
  } catch (err) {
    console.error('Error:', err);
  }
}

createTestUser();
