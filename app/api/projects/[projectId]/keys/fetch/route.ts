import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encryption } from '@/lib/encryption';

// Middleware to check if request is from server
function isServerRequest(req: NextRequest) {
  // This is a simple example - in production, use a more secure method
  // like API keys, shared secrets, or JWT tokens for server-to-server auth
  const serverSecret = req.headers.get('x-server-secret');
  const validSecret = process.env.SERVER_SECRET_KEY;
  
  return serverSecret === validSecret && !!validSecret;
}

// POST /api/projects/[projectId]/keys/fetch - Get the decrypted API key for a specific provider in a project
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  // Only allow this endpoint to be called from server-side code
  if (!isServerRequest(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: This endpoint is for server use only' },
      { status: 401 }
    );
  }
  
  const projectId = params.projectId;
  
  try {
    const body = await req.json();
    const { userId, provider } = body;
    
    if (!userId || !provider) {
      return NextResponse.json(
        { error: 'User ID and provider are required' },
        { status: 400 }
      );
    }
    
    // Verify project ownership
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
    
    if (projectError || !projectData) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Get the encrypted API key
    const { data, error: dbError } = await supabase
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('project_id', projectId)
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