import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encryption } from '@/lib/encryption';

// This endpoint is for internal/backend use only
// It should only be called from server-side code

// Middleware to check if request is from server
function isServerRequest(req: NextRequest) {
  // This is a simple example - in production, you should use a more secure method
  // like API keys, shared secrets, or JWT tokens for server-to-server auth
  const serverSecret = req.headers.get('x-server-secret');
  const validSecret = process.env.SERVER_SECRET_KEY;
  
  return serverSecret === validSecret && !!validSecret;
}

// POST /api/keys/fetch - Get the decrypted API key for a specific provider
export async function POST(req: NextRequest) {
  // Only allow this endpoint to be called from server-side code
  if (!isServerRequest(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: This endpoint is for server use only' },
      { status: 401 }
    );
  }
  
  try {
    const body = await req.json();
    const { userId, provider } = body;
    
    if (!userId || !provider) {
      return NextResponse.json(
        { error: 'User ID and provider are required' },
        { status: 400 }
      );
    }
    
    // Get the encrypted API key
    const { data, error: dbError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();
    
    if (dbError || !data) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }
    
    // Decrypt the API key
    try {
      const apiKey = encryption.decrypt(data.encrypted_key);
      
      // Return the decrypted API key
      return NextResponse.json({ apiKey });
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to decrypt API key' },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 400 }
    );
  }
} 