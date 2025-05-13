// This file simulates cron jobs during development
require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

console.log('Starting development cron jobs...');

// Get cron API key from env
const cronApiKey = process.env.CRON_API_KEY;
if (!cronApiKey) {
  console.error('No CRON_API_KEY found in environment. Please set this in your .env file.');
  process.exit(1);
}

// Base URL for API calls
const baseUrl = 'http://localhost:3000/api';

// Helper function to call API endpoints
async function callEndpoint(endpoint) {
  try {
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers: {
        'x-cron-api-key': cronApiKey
      }
    });
    console.log(`✅ [${new Date().toISOString()}] Successfully called ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error calling ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to run shell scripts
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.resolve(__dirname, scriptPath);
    console.log(`🔄 [${new Date().toISOString()}] Running script: ${fullPath}`);
    
    exec(`bash ${fullPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ [${new Date().toISOString()}] Error running script:`, error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`⚠️ [${new Date().toISOString()}] Script warnings:`, stderr);
      }
      
      console.log(`✅ [${new Date().toISOString()}] Script output:`, stdout);
      resolve(stdout);
    });
  });
}

// Schedule OpenAI usage fetcher to run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log(`🕒 [${new Date().toISOString()}] Running OpenAI usage fetcher...`);
  try {
    await runScript('./run-usage-fetcher.sh');
    console.log(`✅ [${new Date().toISOString()}] OpenAI usage fetcher completed successfully`);
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error running OpenAI usage fetcher:`, error);
  }
});

// Add any other cron jobs here

console.log('Development cron jobs have been scheduled.');
console.log('Press Ctrl+C to stop.'); 