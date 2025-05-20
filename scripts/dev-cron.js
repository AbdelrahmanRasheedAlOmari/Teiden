// Development script to simulate cron jobs locally
const cron = require('node-cron');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
require('dotenv').config();

const execAsync = promisify(exec);

// Cron job definitions
const cronJobs = [
  {
    id: 'usage-fetcher',
    schedule: '*/5 * * * *', // Run every 5 minutes for testing
    command: 'python3 lib/agents/openai-usage-agent/openai_usage_fetcher.py'
  },
  {
    id: 'forecast-agent',
    schedule: '*/10 * * * *', // Run every 10 minutes for testing
    command: 'python3 lib/agents/forecasting-agent/forecast_agent.py'
  },
  {
    id: 'prevention-agent',
    schedule: '*/3 * * * *', // Run every 3 minutes for testing
    command: 'python3 lib/agents/prevention-agent/prevention_agent.py'
  }
];

// Create a virtual environment and install dependencies if needed
async function setupEnvironment() {
  console.log('Setting up Python environment and dependencies...');
  
  try {
    // Check if venv exists
    const venvCheck = await execAsync('[ -d "venv" ] && echo "exists" || echo "not exists"');
    const venvExists = venvCheck.stdout.trim() === 'exists';
    
    if (!venvExists) {
      console.log('Creating virtual environment...');
      await execAsync('python3 -m venv venv');
    }
    
    // Install dependencies
    console.log('Installing dependencies...');
    await execAsync('source venv/bin/activate && pip install -r lib/agents/requirements.txt');
    
    console.log('Environment setup completed.');
  } catch (error) {
    console.error('Error setting up environment:', error);
  }
}

// Run a specific cron job manually
async function runJob(jobId) {
  const job = cronJobs.find(job => job.id === jobId);
  
  if (!job) {
    console.error(`Job with ID "${jobId}" not found.`);
    return;
  }
  
  console.log(`Manually running job: ${job.id}`);
  
  try {
    const { stdout, stderr } = await execAsync(job.command);
    console.log(`Output from ${job.id}:`);
    console.log(stdout);
    
    if (stderr) {
      console.warn(`Warnings/errors from ${job.id}:`);
      console.warn(stderr);
    }
  } catch (error) {
    console.error(`Error running job ${job.id}:`, error);
  }
}

// Schedule all cron jobs
function scheduleJobs() {
  cronJobs.forEach(job => {
    console.log(`Scheduling job "${job.id}" with schedule: ${job.schedule}`);
    
    cron.schedule(job.schedule, async () => {
      console.log(`Running cron job: ${job.id} at ${new Date().toISOString()}`);
      
      try {
        const { stdout, stderr } = await execAsync(job.command);
        console.log(`Job ${job.id} completed successfully.`);
        
        if (stdout.trim()) {
          console.log(`Output from ${job.id}:`);
          console.log(stdout.split('\n').slice(0, 5).join('\n') + (stdout.split('\n').length > 5 ? '\n... (truncated)' : ''));
        }
        
        if (stderr) {
          console.warn(`Warnings from ${job.id}:`);
          console.warn(stderr.split('\n').slice(0, 5).join('\n') + (stderr.split('\n').length > 5 ? '\n... (truncated)' : ''));
        }
      } catch (error) {
        console.error(`Error running job ${job.id}:`, error);
      }
    });
  });
  
  console.log('All cron jobs scheduled. Press Ctrl+C to stop.');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Setup environment first
  await setupEnvironment();
  
  if (args.length > 0 && args[0] === 'run') {
    // Run a specific job
    if (args.length < 2) {
      console.error('Please specify a job ID to run.');
      console.log('Available jobs:', cronJobs.map(job => job.id).join(', '));
      return;
    }
    
    await runJob(args[1]);
  } else {
    // Schedule all jobs
    scheduleJobs();
  }
}

main().catch(console.error); 