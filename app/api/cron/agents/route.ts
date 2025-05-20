import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { createServerClient } from '@supabase/ssr';

const execAsync = promisify(exec);

// Simple API key validation for cron jobs
const validateApiKey = (request: NextRequest): boolean => {
  const apiKey = request.headers.get('x-cron-api-key');
  return apiKey === process.env.CRON_API_KEY;
};

export async function GET(request: NextRequest) {
  // Validate that the request is authorized
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get agent type from query params
    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get('type');
    
    if (!['forecast', 'prevention', 'all'].includes(agentType || '')) {
      return NextResponse.json(
        { 
          error: 'Invalid agent type. Must be one of: forecast, prevention, all' 
        }, 
        { status: 400 }
      );
    }
    
    // Get last run time for this agent type
    const lastRunKey = `last_run_${agentType || 'all'}`;
    const now = new Date();
    
    // Execute the appropriate agent(s)
    let forecastResult, preventionResult;
    
    // Run forecasting agent if requested
    if (agentType === 'forecast' || agentType === 'all') {
      const forecastScriptPath = path.resolve(process.cwd(), 'lib/agents/forecasting-agent/forecast_agent.py');
      console.log(`Running forecasting agent: ${forecastScriptPath}`);
      
      try {
        const { stdout, stderr } = await execAsync(`python3 ${forecastScriptPath}`);
        
        if (stderr) {
          console.warn('Forecasting agent warnings:', stderr);
        }
        
        // Try to parse JSON output
        const jsonMatch = stdout.match(/({[\s\S]*})/);
        
        if (jsonMatch && jsonMatch[1]) {
          forecastResult = JSON.parse(jsonMatch[1]);
        } else {
          forecastResult = { 
            success: true, 
            message: 'Forecasting agent completed but no structured output was provided',
            raw_output: stdout.substring(0, 1000) // Truncate long output
          };
        }
      } catch (forecastError) {
        forecastResult = { 
          success: false, 
          error: forecastError instanceof Error ? forecastError.message : 'Unknown error'
        };
      }
    }
    
    // Run prevention agent if requested
    if (agentType === 'prevention' || agentType === 'all') {
      const preventionScriptPath = path.resolve(process.cwd(), 'lib/agents/prevention-agent/prevention_agent.py');
      console.log(`Running prevention agent: ${preventionScriptPath}`);
      
      try {
        const { stdout, stderr } = await execAsync(`python3 ${preventionScriptPath}`);
        
        if (stderr) {
          console.warn('Prevention agent warnings:', stderr);
        }
        
        // Try to parse JSON output
        const jsonMatch = stdout.match(/({[\s\S]*})/);
        
        if (jsonMatch && jsonMatch[1]) {
          preventionResult = JSON.parse(jsonMatch[1]);
        } else {
          preventionResult = { 
            success: true, 
            message: 'Prevention agent completed but no structured output was provided',
            raw_output: stdout.substring(0, 1000) // Truncate long output
          };
        }
      } catch (preventionError) {
        preventionResult = { 
          success: false, 
          error: preventionError instanceof Error ? preventionError.message : 'Unknown error'
        };
      }
    }
    
    // Log this run time
    const cookieStore = request.cookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    
    // Log this run in the agent_runs table
    try {
      await supabase.from('agent_runs').insert([
        {
          agent_type: agentType || 'all',
          run_at: now.toISOString(),
          forecast_result: forecastResult ? JSON.stringify(forecastResult) : null,
          prevention_result: preventionResult ? JSON.stringify(preventionResult) : null,
        }
      ]);
    } catch (logError) {
      console.error('Error logging agent run:', logError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Agent(s) run completed: ${agentType || 'all'}`,
      run_at: now.toISOString(),
      forecast: forecastResult,
      prevention: preventionResult
    });
  } catch (error: any) {
    console.error('Error in agent cron API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error in agent cron API route',
      error: error.message
    }, { status: 500 });
  }
}

// Helper to make the cron job idempotent
export const dynamic = 'force-dynamic';
export const revalidate = 0; 