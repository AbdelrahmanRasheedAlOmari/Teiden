import { NextResponse } from 'next/server';

export async function GET() {
  // Check environment variables
  const envStatus = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'defined' : 'undefined',
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'defined' : 'undefined',
    encryption_key: process.env.ENCRYPTION_KEY ? 'defined' : 'undefined',
    server_secret_key: process.env.SERVER_SECRET_KEY ? 'defined' : 'undefined',
  };
  
  return NextResponse.json({ 
    message: 'Environment variable status', 
    env_status: envStatus 
  });
} 