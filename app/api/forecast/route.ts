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

export async function POST(req: NextRequest) {
  // Validate that the request is authorized
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    // Parse request body
    const body = await req.json();
    const { 
      project_id, 
      provider,
      timeframe = '30d',
      forecast_horizon = '14d',
      forecast_model = 'ensemble' 
    } = body;
    
    // Validate inputs
    const validTimeframes = ['7d', '14d', '30d', '90d'];
    const validForecastHorizons = ['7d', '14d', '30d', '90d'];
    const validForecastModels = ['statistical', 'prophet', 'ensemble', 'llm'];
    
    if (timeframe && !validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be one of: 7d, 14d, 30d, 90d' },
        { status: 400 }
      );
    }
    
    if (forecast_horizon && !validForecastHorizons.includes(forecast_horizon)) {
      return NextResponse.json(
        { error: 'Invalid forecast_horizon. Must be one of: 7d, 14d, 30d, 90d' },
        { status: 400 }
      );
    }
    
    if (forecast_model && !validForecastModels.includes(forecast_model)) {
      return NextResponse.json(
        { error: 'Invalid forecast_model. Must be one of: statistical, prophet, ensemble, llm' },
        { status: 400 }
      );
    }
    
    // Build command to run the forecasting agent with the specified parameters
    const scriptPath = path.resolve(process.cwd(), 'lib/agents/forecasting-agent/forecast_agent.py');
    const command = [
      `PYTHONPATH=${process.cwd()} python3`,
      scriptPath,
      `--user_id="${userId}"`,
      project_id ? `--project_id="${project_id}"` : '',
      provider ? `--provider="${provider}"` : '',
      `--timeframe="${timeframe}"`,
      `--forecast_horizon="${forecast_horizon}"`,
      `--forecast_model="${forecast_model}"`
    ].filter(Boolean).join(' ');
    
    console.log(`Running forecasting command: ${command}`);
    
    // Execute the Python script
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.warn('Forecasting script warnings:', stderr);
    }
    
    // Parse the output to extract forecasts
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
      console.error('Error parsing forecasting output:', parseError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error parsing forecasting output',
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Return the forecasting results
    return NextResponse.json({
      success: true,
      message: 'Forecasting completed successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error in forecasting API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error in forecasting API route',
      error: error.message
    }, { status: 500 });
  }
}

// GET endpoint to fetch the latest forecasts
export async function GET(req: NextRequest) {
  // Validate that the request is authorized
  const { authenticated, userId, error } = await isAuthenticated(req);
  
  if (!authenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');
    const provider = searchParams.get('provider');
    const model = searchParams.get('model');
    const isLatest = searchParams.get('is_latest') !== 'false'; // Default to true
    
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
    
    // Build query for fetching forecasts
    let query = supabase
      .from('forecasts')
      .select('*')
      .eq('user_id', userId);
    
    // Apply filters if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    if (provider) {
      query = query.eq('provider', provider);
    }
    
    if (model) {
      query = query.eq('model', model);
    }
    
    if (isLatest) {
      query = query.eq('is_latest', true);
    }
    
    // Order by forecast date
    query = query.order('forecast_date', { ascending: true });
    
    // Execute query
    const { data, error: dbError } = await query;
    
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    
    // Process and group the forecasts by model
    const groupedForecasts: any = {};
    
    data?.forEach(forecast => {
      const model = forecast.model;
      
      if (!groupedForecasts[model]) {
        groupedForecasts[model] = {
          model,
          provider: forecast.provider,
          dates: [],
          tokens_input: [],
          tokens_output: [],
          cost_in_usd: []
        };
      }
      
      groupedForecasts[model].dates.push(forecast.forecast_date);
      groupedForecasts[model].tokens_input.push(forecast.tokens_input_forecast);
      groupedForecasts[model].tokens_output.push(forecast.tokens_output_forecast);
      groupedForecasts[model].cost_in_usd.push(forecast.cost_forecast);
    });
    
    // Convert to array for easier consumption by frontend
    const forecasts = Object.values(groupedForecasts);
    
    return NextResponse.json({
      success: true,
      forecasts
    });
  } catch (e) {
    console.error('Error in GET /api/forecast:', e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
} 