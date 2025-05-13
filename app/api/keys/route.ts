import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { encryption } from '@/lib/encryption';

// Middleware to check if user is authenticated
async function isAuthenticated(req: NextRequest) {
  const cookieStore = req.cookies;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // This is a read-only context, we don't need to set cookies
        },
        remove(name: string, options: any) {
          // This is a read-only context, we don't need to remove cookies
        },
      },
    }
  );
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    return { authenticated: false, userId: null, error: 'Not authenticated' };
  }
  
  return { authenticated: true, userId: data.session.user.id, error: null };
}

// GET /api/keys - Get all API keys for the authenticated user
export async function GET(req: NextRequest) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  const cookieStore = req.cookies;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // This is a read-only context
        },
        remove(name: string, options: any) {
          // This is a read-only context
        },
      },
    }
  );
  
  const { data, error: dbError } = await supabase
    .from('user_api_keys')
    .select(`
      id, 
      provider, 
      name, 
      created_at, 
      updated_at,
      project_id,
      projects:project_id (
        id,
        name
      )
    `)
    .eq('user_id', userId);
  
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  
  return NextResponse.json({ keys: data });
}

// POST /api/keys - Add a new API key
export async function POST(req: NextRequest) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { provider, key, name, project } = body;
    
    if (!provider || !key) {
      return NextResponse.json({ error: 'Provider and key are required' }, { status: 400 });
    }
    
    // Encrypt the API key
    const encryptedKey = encryption.encrypt(key);
    
    const cookieStore = req.cookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // This is a read-only context
          },
          remove(name: string, options: any) {
            // This is a read-only context
          },
        },
      }
    );
    
    // Save to database
    const { data, error: dbError } = await supabase
      .from('user_api_keys')
      .upsert([
        {
          user_id: userId,
          provider,
          encrypted_key: encryptedKey,
          name: name || provider,
          project_id: project || null
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
    console.error('Error in POST /api/keys:', e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}

// DELETE /api/keys - Delete an API key
export async function DELETE(req: NextRequest) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');
    
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }
    
    const cookieStore = req.cookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // This is a read-only context
          },
          remove(name: string, options: any) {
            // This is a read-only context
          },
        },
      }
    );
    
    // First check if this key belongs to the user
    const { data: keyData } = await supabase
      .from('user_api_keys')
      .select('id')
      .eq('id', keyId)
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
      .eq('user_id', userId);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error in DELETE /api/keys:', e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
} 