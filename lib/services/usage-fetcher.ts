import { createClient } from '@supabase/supabase-js';
import OpenAIClient from '../api-clients/openai';
import { encryption } from '../encryption';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface UsageMetric {
  user_id: string;
  api_key_id: string;
  project_id: string | null;
  provider: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_in_usd: number;
  timestamp: string;
  granularity: 'hourly' | 'daily' | 'monthly';
}

// Map OpenAI model names to standardized names
const MODEL_NAME_MAP: Record<string, string> = {
  'gpt-4': 'gpt-4',
  'gpt-4-32k': 'gpt-4-32k',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4-1106-preview': 'gpt-4-turbo',
  'gpt-4-0125-preview': 'gpt-4-turbo',
  'gpt-4-vision-preview': 'gpt-4-vision',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k': 'gpt-3.5-turbo-16k',
  'text-embedding-ada-002': 'text-embedding-ada-002',
  'text-embedding-3-small': 'text-embedding-3-small',
  'text-embedding-3-large': 'text-embedding-3-large',
  'dall-e-2': 'dall-e-2',
  'dall-e-3': 'dall-e-3',
  'whisper-1': 'whisper-1',
  'tts-1': 'tts-1',
  'tts-1-hd': 'tts-1-hd'
};

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to get date range for the last day
function getDateRangeForLastDay(): { startDate: string; endDate: string } {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    startDate: formatDate(yesterday),
    endDate: formatDate(now)
  };
}

// Extract model name from OpenAI's line item description
function extractModelFromLineItem(lineItemName: string): string {
  // Example lineItemName: "GPT-4 (8K context) - Input"
  // Patterns to match common model names
  const patterns = [
    /GPT-4/i,
    /GPT-3.5-Turbo/i,
    /Dall-E/i,
    /Whisper/i,
    /embedding/i,
    /fine-tun/i,
    /TTS/i
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(lineItemName)) {
      // Extract the model part from the line item
      const modelMatch = lineItemName.match(/^(.*?)(?:-\s*(?:Input|Output))?$/i);
      if (modelMatch && modelMatch[1]) {
        const rawModelName = modelMatch[1].trim();
        
        // Map to standardized model name if available
        for (const [key, value] of Object.entries(MODEL_NAME_MAP)) {
          if (rawModelName.toLowerCase().includes(key.toLowerCase())) {
            return value;
          }
        }
        
        // Return cleaned up model name if no mapping found
        return rawModelName;
      }
    }
  }
  
  // Default if no specific model detected
  return "unknown";
}

// Determine if a line item is for input or output tokens
function isInputLineItem(lineItemName: string): boolean {
  return lineItemName.toLowerCase().includes('input');
}

// Main function to fetch and store usage data
export async function fetchAndStoreOpenAIUsage() {
  console.log('Starting OpenAI usage fetching process...');
  
  try {
    // 1. Get all OpenAI API keys from the database
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('user_api_keys')
      .select(`
        id,
        user_id,
        project_id,
        encrypted_key,
        provider
      `)
      .eq('provider', 'openai');
    
    if (apiKeysError) {
      throw new Error(`Error fetching API keys: ${apiKeysError.message}`);
    }
    
    console.log(`Found ${apiKeys.length} OpenAI API keys to process`);
    
    // 2. For each API key, fetch and process usage data
    for (const apiKey of apiKeys) {
      try {
        // Decrypt the API key
        const decryptedKey = encryption.decrypt(apiKey.encrypted_key);
        
        // Create OpenAI client
        const openaiClient = new OpenAIClient(decryptedKey);
        
        // Test connection with the API key
        const isValid = await openaiClient.testConnection();
        if (!isValid) {
          console.warn(`Invalid API key for user ${apiKey.user_id}, skipping...`);
          continue;
        }
        
        // Get date range for the last day
        const { startDate, endDate } = getDateRangeForLastDay();
        
        // Fetch usage data
        const usageData = await openaiClient.getUsage(startDate, endDate);
        
        // Process daily costs
        const usageMetrics: UsageMetric[] = [];
        
        for (const dailyCost of usageData.data.daily_costs) {
          const timestamp = new Date(dailyCost.timestamp * 1000).toISOString();
          
          // Group line items by model
          const modelUsage: Record<string, { input: number; output: number; cost: number }> = {};
          
          // Process each line item
          for (const lineItem of dailyCost.line_items) {
            const model = extractModelFromLineItem(lineItem.name);
            
            if (!modelUsage[model]) {
              modelUsage[model] = { input: 0, output: 0, cost: 0 };
            }
            
            // Update cost
            modelUsage[model].cost += lineItem.cost;
            
            // Update token counts based on whether it's input or output
            if (isInputLineItem(lineItem.name)) {
              // This is a rough estimate since OpenAI doesn't provide exact token counts
              // We're approximating based on cost and known pricing
              modelUsage[model].input += Math.round(lineItem.cost * 1000); // This is an approximation
            } else {
              modelUsage[model].output += Math.round(lineItem.cost * 1000); // This is an approximation
            }
          }
          
          // Create usage metrics entries for each model
          for (const [model, usage] of Object.entries(modelUsage)) {
            usageMetrics.push({
              user_id: apiKey.user_id,
              api_key_id: apiKey.id,
              project_id: apiKey.project_id,
              provider: 'openai',
              model,
              tokens_input: usage.input,
              tokens_output: usage.output,
              cost_in_usd: usage.cost,
              timestamp,
              granularity: 'daily'
            });
          }
        }
        
        // 3. Store usage metrics in the database
        if (usageMetrics.length > 0) {
          const { error: insertError } = await supabase
            .from('usage_metrics')
            .upsert(usageMetrics, {
              onConflict: 'user_id, api_key_id, provider, model, timestamp, granularity'
            });
            
          if (insertError) {
            throw new Error(`Error inserting usage metrics: ${insertError.message}`);
          }
          
          console.log(`Successfully stored ${usageMetrics.length} usage metrics for user ${apiKey.user_id}`);
        } else {
          console.log(`No usage data found for user ${apiKey.user_id} in the specified date range`);
        }
      } catch (error) {
        console.error(`Error processing API key ${apiKey.id}:`, error);
        // Continue with the next API key
      }
    }
    
    console.log('OpenAI usage fetching process completed successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error in fetchAndStoreOpenAIUsage:', error);
    return { success: false, error: error.message };
  }
}

// Function to run the fetcher - this will be called by the cron job
export async function runOpenAIUsageFetcher() {
  try {
    const result = await fetchAndStoreOpenAIUsage();
    return result;
  } catch (error: any) {
    console.error('Error running OpenAI usage fetcher:', error);
    return { success: false, error: error.message };
  }
} 