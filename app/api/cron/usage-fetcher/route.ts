import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

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
    // Execute the Python script for OpenAI usage fetcher
    const scriptPath = path.resolve(process.cwd(), 'lib/agents/openai-usage-agent/openai_usage_fetcher.py');
    console.log(`Running script: ${scriptPath}`);
    
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`);
    
    if (stderr) {
      console.warn('Script warnings:', stderr);
    }
    
    // Parse the output to extract the metrics stored count
    let metricsStored = 0;
    try {
      const outputLines = stdout.split('\n');
      for (const line of outputLines) {
        if (line.includes('"metrics_stored":')) {
          const match = line.match(/"metrics_stored":\s*(\d+)/);
          if (match && match[1]) {
            metricsStored = parseInt(match[1], 10);
          }
        }
      }
    } catch (parseError) {
      console.error('Error parsing script output:', parseError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'OpenAI usage fetcher completed successfully',
      metrics_stored: metricsStored
    });
  } catch (error: any) {
    console.error('Error in usage fetcher API route:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error in usage fetcher API route',
      error: error.message
    }, { status: 500 });
  }
}

// Helper to make the cron job idempotent - this prevents multiple runs if the job gets triggered multiple times
export const dynamic = 'force-dynamic';
export const revalidate = 0; 