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

// GET /api/projects/[projectId]/keys - Get all API keys for a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  const projectId = params.projectId;
  
  // First verify that the project belongs to the user
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (projectError || !projectData) {
    return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
  }
  
  // Get API keys for this project
  const { data, error: dbError } = await supabase
    .from('user_api_keys')
    .select('id, provider, name, created_at, updated_at')
    .eq('project_id', projectId)
    .eq('user_id', userId);
  
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  
  return NextResponse.json({ keys: data });
}

// POST /api/projects/[projectId]/keys - Add a new API key to a project
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  const projectId = params.projectId;
  
  try {
    // First verify that the project belongs to the user
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
    const { provider, key, name } = body;
    
    if (!provider || !key) {
      return NextResponse.json({ error: 'Provider and key are required' }, { status: 400 });
    }
    
    // Encrypt the API key
    const encryptedKey = encryption.encrypt(key);
    
    // Save to database
    const { data, error: dbError } = await supabase
      .from('user_api_keys')
      .upsert([
        {
          user_id: userId,
          project_id: projectId,
          provider,
          encrypted_key: encryptedKey,
          name: name || provider
        }
      ])
      .select();
    
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      key: {
        id: data[0].id,
        provider: data[0].provider,
        name: data[0].name,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at
      } 
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}

// DELETE /api/projects/[projectId]/keys - Delete an API key from a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  const projectId = params.projectId;
  
  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');
    
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }
    
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
    
    // Delete the key
    const { error: deleteError } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('id', keyId)
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
} 