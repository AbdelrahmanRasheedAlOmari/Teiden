import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

// GET /api/projects - Get all projects for the authenticated user
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
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  
  return NextResponse.json({ projects: data });
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
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
      .from('projects')
      .insert([
        {
          user_id: userId,
          name,
          description: description || null
        }
      ])
      .select();
    
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      project: data[0]
    });
  } catch (e) {
    console.error('Error in POST /api/projects:', e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}

// DELETE /api/projects - Delete a project
export async function DELETE(req: NextRequest) {
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
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
    
    // First check if this project belongs to the user
    const { data: projectData } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
    
    if (!projectData) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }
    
    // Delete the project (related API keys will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error in DELETE /api/projects:', e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
} 