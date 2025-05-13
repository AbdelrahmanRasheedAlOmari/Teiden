// Test script to verify environment variables
console.log('Testing environment variables:');

// Check if Supabase environment variables are available
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined');

// Check security keys
console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? 'defined' : 'undefined');
console.log('SERVER_SECRET_KEY:', process.env.SERVER_SECRET_KEY ? 'defined' : 'undefined'); 