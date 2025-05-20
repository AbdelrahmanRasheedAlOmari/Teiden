import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { createServerClient } from '@supabase/ssr';

const execAsync = promisify(exec);

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

// POST endpoint to run a prevention check
export async function POST(req: NextRequest) {
  // Validate that the request is authorized
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    // Parse request body
    const body = await req.json();
    const { project_id, provider, send_notifications = true } = body;
    
    // Build command to run the prevention agent
    const scriptPath = path.resolve(process.cwd(), 'lib/agents/prevention-agent/prevention_agent.py');
    const command = [
      `PYTHONPATH=${process.cwd()} python3`,
      scriptPath,
      `--user_id="${userId}"`,
      project_id ? `--project_id="${project_id}"` : '',
      provider ? `--provider="${provider}"` : '',
      send_notifications ? '--send_notifications=true' : '--send_notifications=false'
    ].filter(Boolean).join(' ');
    
    console.log(`Running prevention check command: ${command}`);
    
    // Execute the Python script
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.warn('Prevention agent warnings:', stderr);
    }
    
    // Parse the output to extract results
    let result;
    try {
      // Find the JSON output in stdout
      const jsonMatch = stdout.match(/({[\s\S]*})/);
      if (jsonMatch && jsonMatch[1]) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('No valid JSON output found');
      }
    } catch (parseError) {
      console.error('Error parsing prevention agent output:', parseError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error parsing prevention agent output',
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Return the prevention check results
    return NextResponse.json({
      success: true,
      message: 'Prevention check completed successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error in prevention check API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error in prevention check API route',
      error: error.message
    }, { status: 500 });
  }
}

// GET endpoint to fetch alerts
export async function GET(req: NextRequest) {
  // Validate that the request is authorized
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');
    const days = parseInt(searchParams.get('days') || '7', 10);
    const severity = searchParams.get('severity'); // 'warning', 'critical', or null for all
    
    // Create Supabase client
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
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Build query for fetching notifications
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('sent_at', startDate.toISOString())
      .lte('sent_at', endDate.toISOString());
    
    // Apply filters if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    if (severity) {
      query = query.eq('severity', severity);
    }
    
    // Order by sent_at descending (newest first)
    query = query.order('sent_at', { ascending: false });
    
    // Execute query
    const { data, error: dbError } = await query;
    
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    
    // Return the alerts
    return NextResponse.json({
      success: true,
      alerts: data || []
    });
  } catch (e) {
    console.error('Error in GET /api/alerts:', e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
} 