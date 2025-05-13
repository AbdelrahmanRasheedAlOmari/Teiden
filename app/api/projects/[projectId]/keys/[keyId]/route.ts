import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encryption } from '@/lib/encryption';

// Middleware to check if user is authenticated
async function isAuthenticated(req: NextRequest) {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    return { authenticated: false, userId: null, error: 'Not authenticated' };
  }
  
  return { authenticated: true, userId: data.session.user.id, error: null };
}

// Helper function to mask API key (showing only first 4 and last 4 characters)
function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return '*'.repeat(key.length);
  }
  
  const firstFour = key.substring(0, 4);
  const lastFour = key.substring(key.length - 4);
  const maskedPortion = '*'.repeat(Math.min(key.length - 8, 10));
  
  return `${firstFour}${maskedPortion}${lastFour}`;
}

// GET /api/projects/[projectId]/keys/[keyId] - Get details of a specific API key
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string, keyId: string } }
) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  const { projectId, keyId } = params;
  
  // Verify that the project belongs to the user
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (projectError || !projectData) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
  }
  
  // Get the API key with encrypted value
  const { data, error: dbError } = await supabase
    .from('user_api_keys')
    .select('*')
    .eq('id', keyId)
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  
  if (!data) {
    return NextResponse.json({ error: 'API key not found or unauthorized' }, { status: 404 });
  }
  
  // Decrypt the API key
  try {
    const decryptedKey = encryption.decrypt(data.encrypted_key);
    
    // Never send the actual key to the client (only for server-side use)
    // Here, we return a masked version for display purposes
    const maskedKey = maskApiKey(decryptedKey);
    
    return NextResponse.json({
      key: {
        id: data.id,
        provider: data.provider,
        name: data.name,
        maskedKey,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
  }
}

// PATCH /api/projects/[projectId]/keys/[keyId] - Update a specific API key
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string, keyId: string } }
) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  const { projectId, keyId } = params;
  
  try {
    // Verify that the project belongs to the user
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
    
    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }
    
    const body = await req.json();
    const { name, key } = body;
    
    // First check if this key belongs to the user and project
    const { data: keyData } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('id', keyId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();
    
    if (!keyData) {
      return NextResponse.json({ error: 'Key not found or unauthorized' }, { status: 404 });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (key !== undefined) {
      updateData.encrypted_key = encryption.encrypt(key);
    }
    
    // Update the key
    const { data, error: updateError } = await supabase
      .from('user_api_keys')
      .update(updateData)
      .eq('id', keyId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select('id, provider, name, created_at, updated_at');
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, key: data[0] });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}

// This endpoint checks if a key exists for a specific provider in a project
export async function HEAD(
  req: NextRequest,
  { params }: { params: { projectId: string, keyId: string } }
) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return new Response(null, { status: 401 });
  }
  
  const { projectId } = params;
  const provider = params.keyId; // In this case, keyId is the provider name
  
  // Verify project ownership
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (projectError || !projectData) {
    return new Response(null, { status: 404 });
  }
  
  // Check if a key exists for this provider in this project
  const { data, error: dbError } = await supabase
    .from('user_api_keys')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('provider', provider)
    .single();
  
  if (dbError || !data) {
    return new Response(null, { status: 404 });
  }
  
  // Key exists
  return new Response(null, { status: 200 });
} 