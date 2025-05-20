#!/usr/bin/env python3
import os
import json
import time
import datetime
import requests
from typing import Dict, List, Optional, Any, Tuple
from dotenv import load_dotenv
from supabase import create_client, Client
from langgraph.graph import StateGraph, END
import asyncio
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

# Initialize encryption with proper AES-256-CBC implementation to match JS code
class Encryption:
    def __init__(self, key: str):
        # Pad or truncate key to exactly 32 bytes
        self.key = self._get_key(key)
    
    def _get_key(self, key: str) -> bytes:
        key_bytes = key.encode('utf-8')
        if len(key_bytes) == 32:
            return key_bytes
        
        # Pad or truncate to 32 bytes
        padded_key = bytearray(32)
        for i in range(min(len(key_bytes), 32)):
            padded_key[i] = key_bytes[i]
        
        return bytes(padded_key)
    
    def decrypt(self, encrypted_text: str) -> str:
        try:
            # Split IV and encrypted data
            parts = encrypted_text.split(':')
            if len(parts) != 2:
                print(f"Invalid encrypted text format: {encrypted_text[:10]}...")
                return encrypted_text  # Return as-is if format is invalid
            
            # Get IV and encrypted data
            iv = bytes.fromhex(parts[0])
            encrypted_data = bytes.fromhex(parts[1])
            
            # Create cipher and decrypt
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv),
                backend=default_backend()
            )
            decryptor = cipher.decryptor()
            decrypted = decryptor.update(encrypted_data) + decryptor.finalize()
            
            # Remove padding
            padding_length = decrypted[-1]
            if padding_length > len(decrypted):
                # Invalid padding, return encrypted_text
                print("Invalid padding detected")
                return encrypted_text
                
            # Convert bytes to string
            return decrypted[:-padding_length].decode('utf-8')
        except Exception as e:
            print(f"Error decrypting: {e}")
            # Return original text if decryption fails
            return encrypted_text

encryption = Encryption(os.environ.get("ENCRYPTION_KEY", "default-encryption-key-for-development-only"))

# Helper functions
def format_date(date: datetime.datetime) -> str:
    """Format date as YYYY-MM-DD"""
    return date.strftime("%Y-%m-%d")

def get_date_range_for_last_day() -> Tuple[str, str]:
    """Get date range for the last 30 days"""
    now = datetime.datetime.now()
    thirty_days_ago = now - datetime.timedelta(days=30)
    
    start_date = format_date(thirty_days_ago)
    end_date = format_date(now)
    
    print(f"Using date range: {start_date} to {end_date}")
    return start_date, end_date

def extract_model_from_line_item(line_item_name: str) -> str:
    """Extract model name from OpenAI's line item description"""
    # Map OpenAI model names to standardized names
    MODEL_NAME_MAP = {
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
    }

    # Patterns to match common model names
    patterns = [
        "GPT-4", "GPT-3.5-Turbo", "Dall-E", "Whisper", 
        "embedding", "fine-tun", "TTS"
    ]
    
    for pattern in patterns:
        if pattern.lower() in line_item_name.lower():
            # Try to extract the model part
            import re
            model_match = re.match(r'^(.*?)(?:-\s*(?:Input|Output))?$', line_item_name, re.IGNORECASE)
            if model_match and model_match.group(1):
                raw_model_name = model_match.group(1).strip()
                
                # Map to standardized model name if available
                for key, value in MODEL_NAME_MAP.items():
                    if key.lower() in raw_model_name.lower():
                        return value
                
                # Return cleaned up model name if no mapping found
                return raw_model_name
    
    # Default if no specific model detected
    return "unknown"

def is_input_line_item(line_item_name: str) -> bool:
    """Determine if a line item is for input or output tokens"""
    return "input" in line_item_name.lower()

# OpenAI client for API calls
class OpenAIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1"
    
    def get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def check_key_format(self) -> bool:
        """Check if the key appears to have valid format (starts with sk-)"""
        # API keys should start with 'sk-' and be of appropriate length
        if not self.api_key or not isinstance(self.api_key, str):
            return False
            
        # Check if this is a valid OpenAI API key format
        if self.api_key.startswith("sk-"):
            # Typical API key is at least 30 characters
            if len(self.api_key) >= 30:
                return True
        
        return False
    
    def test_connection(self) -> bool:
        """Test the API key with organization endpoint which many keys can access"""
        if not self.check_key_format():
            print("API key has invalid format (doesn't start with 'sk-')")
            return False
            
        try:
            print(f"Testing API key connectivity to OpenAI API...")
            
            # Try the organization endpoint - many API keys can access this even with restrictions
            response = requests.get(
                f"{self.base_url}/organizations",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                print(f"API key is valid! Successfully connected to OpenAI API.")
                return True
            else:
                print(f"Error with API key - Status code: {response.status_code}")
                print(f"Error details: {response.text}")
                
                # Check if this is just a permissions issue but the key might still be valid
                if response.status_code in [401, 403] and "insufficient permissions" in response.text.lower():
                    print("This appears to be a valid but highly restricted API key.")
                    return True
                    
                return False
        except Exception as e:
            print(f"Exception during API key testing: {str(e)}")
            return False
    
    def get_completions_usage(self, start_time: int, end_time: int) -> Dict[str, Any]:
        """Fetch completions usage data using the new Usage API"""
        try:
            print(f"Requesting completions usage data for time range: {start_time} to {end_time}")
            url = f"{self.base_url}/organization/usage/completions"
            params = {
                "start_time": start_time,
                "end_time": end_time,
                "limit": 31,  # Maximum allowed for daily buckets
                "bucket_width": "1d",
                "group_by": ["model"]  # Group by model to get model-specific data
            }
            print(f"Request URL: {url}")
            print(f"Request params: {params}")
            
            response = requests.get(
                url,
                params=params,
                headers=self.get_headers()
            )
            
            print(f"Response status code: {response.status_code}")
            if response.status_code != 200:
                print(f"Error response: {response.text}")
            else:
                print("Successfully retrieved completions usage data")
                data = response.json()
                
                # Display summary of the data
                if "data" in data and len(data["data"]) > 0:
                    print(f"Received data for {len(data['data'])} time buckets")
                    for bucket in data["data"]:
                        results = bucket.get("results", [])
                        if results:
                            print(f"  Bucket {bucket.get('start_time')} to {bucket.get('end_time')} has {len(results)} results")
                            # Show first result as example
                            if len(results) > 0:
                                print(f"  Sample result: {json.dumps(results[0], indent=2)}")
                else:
                    print("No data returned from API - empty response")
                    print(f"Full response: {json.dumps(data, indent=2)}")
                
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching OpenAI completions usage: {e}")
            raise
    
    def get_embeddings_usage(self, start_time: int, end_time: int) -> Dict[str, Any]:
        """Fetch embeddings usage data using the new Usage API"""
        try:
            print(f"Requesting embeddings usage data for time range: {start_time} to {end_time}")
            response = requests.get(
                f"{self.base_url}/organization/usage/embeddings",
                params={
                    "start_time": start_time,
                    "end_time": end_time,
                    "limit": 31,  # Maximum allowed for daily buckets
                    "bucket_width": "1d",
                    "group_by": ["model"]  # Group by model to get model-specific data
                },
                headers=self.get_headers()
            )
            print(f"Embeddings response status code: {response.status_code}")
            if response.status_code != 200:
                print(f"Error response: {response.text}")
            else:
                print("Successfully retrieved embeddings usage data")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching OpenAI embeddings usage: {e}")
            raise
    
    def get_costs(self, start_time: int, end_time: int) -> Dict[str, Any]:
        """Fetch cost data using the new Costs API"""
        try:
            print(f"Requesting costs data for time range: {start_time} to {end_time}")
            response = requests.get(
                f"{self.base_url}/organization/costs",
                params={
                    "start_time": start_time,
                    "end_time": end_time,
                    "limit": 31,  # Maximum allowed
                    "group_by": ["line_item"]  # Group by line item to get model-specific costs
                },
                headers=self.get_headers()
            )
            print(f"Costs response status code: {response.status_code}")
            if response.status_code != 200:
                print(f"Error response: {response.text}")
            else:
                print("Successfully retrieved costs data")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching OpenAI costs: {e}")
            raise
    
    def get_all_usage(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """Fetch all usage data including completions, embeddings, and costs"""
        # Convert dates to Unix timestamps
        start_timestamp = int(datetime.datetime.strptime(start_date, "%Y-%m-%d").timestamp())
        end_timestamp = int(datetime.datetime.strptime(end_date, "%Y-%m-%d").timestamp())
        
        result = {
            "completions": {"data": []},
            "embeddings": {"data": []},
            "moderations": {"data": []},
            "images": {"data": []},
            "audio_speeches": {"data": []},
            "audio_transcriptions": {"data": []},
            "vector_stores": {"data": []},
            "code_interpreter_sessions": {"data": []},
            "costs": {"data": []}
        }
        
        # Try all usage endpoints available
        endpoints = [
            ("completions", "/organization/usage/completions"),
            ("embeddings", "/organization/usage/embeddings"),
            ("moderations", "/organization/usage/moderations"),
            ("images", "/organization/usage/images"),
            ("audio_speeches", "/organization/usage/audio_speeches"),
            ("audio_transcriptions", "/organization/usage/audio_transcriptions"),
            ("vector_stores", "/organization/usage/vector_stores"),
            ("code_interpreter_sessions", "/organization/usage/code_interpreter_sessions")
        ]
        
        for name, endpoint in endpoints:
            try:
                print(f"Requesting {name} usage data...")
                response = requests.get(
                    f"{self.base_url}{endpoint}",
                    params={
                        "start_time": start_timestamp,
                        "end_time": end_timestamp,
                        "limit": 31,
                        "bucket_width": "1d",
                        "group_by": ["model"] 
                    },
                    headers=self.get_headers()
                )
                
                if response.status_code == 200:
                    result[name] = response.json()
                    print(f"✅ Successfully retrieved {name} usage data")
                    
                    # Show a sample of the data
                    data = response.json()
                    if "data" in data and data["data"] and len(data["data"]) > 0:
                        bucket = data["data"][0]
                        if "results" in bucket and bucket["results"]:
                            print(f"  Sample: {json.dumps(bucket['results'][0], indent=2)}")
                else:
                    print(f"❌ Failed to get {name} usage data: {response.status_code}")
                    if response.status_code != 404:  # Don't show error details for 404 (endpoint not found)
                        print(f"  Error: {response.text}")
            except Exception as e:
                print(f"❌ Error fetching {name} usage: {e}")
        
        # Get costs data (separate from usage data)
        try:
            print(f"Requesting costs data...")
            response = requests.get(
                f"{self.base_url}/organization/costs",
                params={
                    "start_time": start_timestamp,
                    "end_time": end_timestamp,
                    "limit": 31,
                    "group_by": ["line_item"]
                },
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                result["costs"] = response.json()
                print(f"✅ Successfully retrieved costs data")
                
                # Show a sample of the data
                data = response.json()
                if "data" in data and data["data"] and len(data["data"]) > 0:
                    bucket = data["data"][0]
                    if "results" in bucket and bucket["results"]:
                        print(f"  Sample: {json.dumps(bucket['results'][0], indent=2)}")
            else:
                print(f"❌ Failed to get costs data: {response.status_code}")
                print(f"  Error: {response.text}")
        except Exception as e:
            print(f"❌ Error fetching costs data: {e}")
        
        return result

# Define the state type
class State(dict):
    """State for the workflow"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.setdefault("keys", [])
        self.setdefault("current_index", 0)
        self.setdefault("total_metrics_stored", 0)

# Define node functions for the graph
async def fetch_api_keys(state: State) -> State:
    """Fetch OpenAI API keys from database"""
    print("Fetching OpenAI API keys from database...")
    
    try:
        response = supabase.table("user_api_keys").select(
            "id, user_id, project_id, encrypted_key, provider"
        ).eq("provider", "openai").execute()
        
        api_keys = response.data
        print(f"Found {len(api_keys)} OpenAI API keys to process")
        
        # Update state with keys
        state = state.copy()
        state["keys"] = api_keys
        state["current_index"] = 0
        state["total_metrics_stored"] = 0
        
        return state
    except Exception as e:
        print(f"Error fetching API keys: {e}")
        state = state.copy()
        state["keys"] = []
        return state

async def process_key(state: State) -> State:
    """Process and decrypt a key"""
    if not state["keys"] or state["current_index"] >= len(state["keys"]):
        # No keys or index out of bounds
        return state
    
    current_key = state["keys"][state["current_index"]]
    user_id = current_key.get("user_id")
    print(f"Processing API key for user {user_id}...")
    
    try:
        # Decrypt the API key
        encrypted_key = current_key["encrypted_key"]
        print(f"Encrypted key: {encrypted_key[:5]}...{encrypted_key[-5:] if encrypted_key else ''}")
        
        decrypted_key = encryption.decrypt(encrypted_key)
        # Print first and last 5 characters of the decrypted key
        print(f"Decrypted key: {decrypted_key[:5]}...{decrypted_key[-5:] if decrypted_key else ''}")
        
        # Validate OpenAI API key format (should start with sk-)
        if not decrypted_key.startswith("sk-"):
            print(f"Invalid OpenAI API key format for user {user_id}. Key should start with 'sk-'")
            # Skip to next key
            state = state.copy()
            state["current_index"] += 1
            return state
        
        # Update the current key in state
        state = state.copy()
        state["current_key"] = {**current_key, "decrypted_key": decrypted_key}
        
        return state
    except Exception as e:
        print(f"Error processing API key {current_key.get('id')}: {e}")
        # Skip to next key
        state = state.copy()
        state["current_index"] += 1
        return state

async def fetch_usage_data(state: State) -> State:
    """Fetch usage data using the decrypted key"""
    if "current_key" not in state:
        # No current key, move to next key
        state = state.copy()
        state["current_index"] += 1
        return state
    
    current_key = state["current_key"]
    user_id = current_key.get("user_id")
    print(f"Fetching usage data for user {user_id}...")
    
    try:
        # Create OpenAI client
        openai_client = OpenAIClient(current_key["decrypted_key"])
        
        # Check if the key has valid format regardless of permissions
        if not openai_client.check_key_format():
            print(f"Invalid API key format for user {user_id}, skipping...")
            # Skip to next key
            state = state.copy()
            state["current_index"] += 1
            return state
        
        # Test connection with the API key
        is_valid = openai_client.test_connection()
        if not is_valid:
            print(f"Invalid API key for user {user_id}, skipping...")
            # Skip to next key
            state = state.copy()
            state["current_index"] += 1
            return state
        
        # Get date range for the last day
        start_date, end_date = get_date_range_for_last_day()
        
        try:
            # Fetch usage data using the new Usage API
            # Note: This requires an admin-level API key with organization access
            print(f"Attempting to fetch usage data via Usage API...")
            usage_data = openai_client.get_all_usage(start_date, end_date)
            
            # Update state with usage data
            state = state.copy()
            state["usage_data"] = usage_data
            state["key_details"] = {
                "id": current_key["id"],
                "user_id": current_key["user_id"],
                "project_id": current_key.get("project_id")
            }
            
            return state
        except requests.exceptions.HTTPError as e:
            if e.response.status_code in [401, 403, 404]:
                print(f"The API key doesn't have administrative access to the Usage API.")
                print(f"Note: The OpenAI Usage API requires an admin-level API key with organization-wide permissions.")
                print(f"Your API key appears valid but doesn't have sufficient permissions for usage data.")
                print(f"Consider using the OpenAI dashboard directly to view usage information.")
                
                # Create an empty usage data structure to avoid errors
                state = state.copy()
                state["usage_data"] = {"completions": {"data": []}, "embeddings": {"data": []}, "costs": {"data": []}}
                state["key_details"] = {
                    "id": current_key["id"],
                    "user_id": current_key["user_id"],
                    "project_id": current_key.get("project_id")
                }
                
                # Continue processing but with empty data
                print(f"Continuing with empty usage data to avoid errors.")
                return state
            raise e
            
    except Exception as e:
        print(f"Error fetching usage data for user {user_id}: {e}")
        # Skip to next key
        state = state.copy()
        state["current_index"] += 1
        return state

async def store_usage_data(state: State) -> State:
    """Process and store the usage data"""
    global total_metrics_stored_globally
    
    if "usage_data" not in state or "key_details" not in state:
        # No usage data, move to next key
        state = state.copy()
        state["current_index"] += 1
        return state
    
    key_details = state["key_details"]
    usage_data = state["usage_data"]
    user_id = key_details["user_id"]
    print(f"Processing and storing usage data for user {user_id}...")
    
    try:
        # Initialize to store metrics
        usage_metrics = []
        
        # Process completions data
        completions_data = usage_data.get("completions", {}).get("data", [])
        for bucket in completions_data:
            bucket_start_time = bucket.get("start_time")
            
            if not bucket_start_time:
                continue
                
            # Convert Unix timestamp to ISO format
            timestamp = datetime.datetime.fromtimestamp(bucket_start_time).isoformat()
            
            # Process each result in the bucket
            for result in bucket.get("results", []):
                # Get actual model from the result
                model = result.get("model")
                
                # Skip if no model information (don't create placeholder entries)
                if not model:
                    print(f"Skipping entry with no model information: {result}")
                    continue
                
                # Create usage metrics entry with actual data
                usage_metrics.append({
                    "user_id": key_details["user_id"],
                    "api_key_id": key_details["id"],
                    "project_id": key_details["project_id"],
                    "provider": "openai",
                    "model": model,
                    "tokens_input": result.get("input_tokens", 0),
                    "tokens_output": result.get("output_tokens", 0),
                    "cost_in_usd": 0,  # Will update from costs data
                    "timestamp": timestamp,
                    "granularity": "daily"
                })
        
        # Process embeddings data
        embeddings_data = usage_data.get("embeddings", {}).get("data", [])
        for bucket in embeddings_data:
            bucket_start_time = bucket.get("start_time")
            
            if not bucket_start_time:
                continue
                
            # Convert Unix timestamp to ISO format
            timestamp = datetime.datetime.fromtimestamp(bucket_start_time).isoformat()
            
            # Process each result in the bucket
            for result in bucket.get("results", []):
                # Get actual model from the result
                model = result.get("model")
                
                # Skip if no model information (don't create placeholder entries)
                if not model:
                    print(f"Skipping embedding entry with no model information: {result}")
                    continue
                
                # Create usage metrics entry with actual data
                usage_metrics.append({
                    "user_id": key_details["user_id"],
                    "api_key_id": key_details["id"],
                    "project_id": key_details["project_id"],
                    "provider": "openai",
                    "model": model,
                    "tokens_input": result.get("input_tokens", 0),
                    "tokens_output": 0,  # Embeddings don't have output tokens
                    "cost_in_usd": 0,  # Will update from costs data
                    "timestamp": timestamp,
                    "granularity": "daily"
                })
        
        # Process costs data for all entries
        costs_data = usage_data.get("costs", {}).get("data", [])
        for bucket in costs_data:
            bucket_start_time = bucket.get("start_time")
            
            if not bucket_start_time:
                continue
                
            # Convert Unix timestamp to ISO format
            timestamp = datetime.datetime.fromtimestamp(bucket_start_time).isoformat()
            
            # Process each result in the bucket
            for result in bucket.get("results", []):
                line_item = result.get("line_item", "")
                amount = result.get("amount", {}).get("value", 0)
                
                if not line_item:
                    continue
                
                # Extract model from line item using the existing function
                model = extract_model_from_line_item(line_item)
                
                # Match with a metrics entry if possible to update cost
                updated = False
                for metric in usage_metrics:
                    if (metric["timestamp"] == timestamp and 
                        metric["model"] == model):
                        metric["cost_in_usd"] += amount
                        updated = True
                        break
                
                # If no matching metric found and we have a valid model name,
                # create a cost-only entry
                if not updated and model:
                    usage_metrics.append({
                        "user_id": key_details["user_id"],
                        "api_key_id": key_details["id"],
                        "project_id": key_details["project_id"],
                        "provider": "openai",
                        "model": model,
                        "tokens_input": 0,
                        "tokens_output": 0,
                        "cost_in_usd": amount,
                        "timestamp": timestamp,
                        "granularity": "daily"
                    })
        
        # Filter out any entries with "unknown" or empty model names
        usage_metrics = [metric for metric in usage_metrics if metric["model"] and metric["model"] != "unknown"]
        
        # Store usage metrics in the database
        metrics_stored = 0
        if usage_metrics:
            try:
                # Try to use insert instead of upsert since we don't have the right constraints
                print(f"Inserting {len(usage_metrics)} usage metrics...")
                
                # First, delete existing metrics for the same time range to avoid duplicates
                # This mimics an upsert operation
                for metric in usage_metrics:
                    supabase.table("usage_metrics").delete() \
                        .eq("user_id", metric["user_id"]) \
                        .eq("api_key_id", metric["api_key_id"]) \
                        .eq("provider", metric["provider"]) \
                        .eq("model", metric["model"]) \
                        .eq("timestamp", metric["timestamp"]) \
                        .eq("granularity", metric["granularity"]) \
                        .execute()
                
                # Then insert the new metrics
                response = supabase.table("usage_metrics").insert(usage_metrics).execute()
                
                metrics_stored = len(usage_metrics)
                total_metrics_stored_globally += metrics_stored  # Update global counter
                print(f"Successfully stored {metrics_stored} usage metrics for user {user_id}")
            except Exception as insert_error:
                print(f"Error inserting metrics: {insert_error}")
        else:
            print(f"No usage metrics to store for user {user_id}")
        
        # Update state with metrics stored and move to next key
        state = state.copy()
        state["current_index"] += 1
        state["total_metrics_stored"] = state.get("total_metrics_stored", 0) + metrics_stored
        
        return state
    except Exception as e:
        print(f"Error storing usage data for user {user_id}: {e}")
        # Skip to next key
        state = state.copy()
        state["current_index"] += 1
        return state

async def should_continue(state: State) -> str:
    """Decide whether to continue processing keys or end"""
    if state["current_index"] < len(state["keys"]):
        return "process_key"
    else:
        return END

# Create the LangGraph for the OpenAI usage fetcher
def create_openai_usage_agent() -> StateGraph:
    """Create the OpenAI usage fetcher agent workflow"""
    workflow = StateGraph(State)
    
    # Add nodes
    workflow.add_node("fetch_api_keys", fetch_api_keys)
    workflow.add_node("process_key", process_key)
    workflow.add_node("fetch_usage_data", fetch_usage_data)
    workflow.add_node("store_usage_data", store_usage_data)
    workflow.add_node("should_continue", should_continue)
    
    # Connect the nodes
    workflow.add_edge("fetch_api_keys", "process_key")
    workflow.add_edge("process_key", "fetch_usage_data")
    workflow.add_edge("fetch_usage_data", "store_usage_data")
    workflow.add_edge("store_usage_data", "should_continue")
    
    # Add conditional edges based on should_continue return value
    workflow.add_conditional_edges(
        "should_continue",
        lambda x: x,
        {
            "process_key": "process_key",
            END: END
        }
    )
    
    # Set the entry point
    workflow.set_entry_point("fetch_api_keys")
    
    return workflow.compile()

async def run_openai_usage_agent() -> Dict[str, Any]:
    """Run the OpenAI usage agent"""
    print("Starting OpenAI usage agent...")
    
    try:
        agent = create_openai_usage_agent()
        
        # Initialize the state
        initial_state = State()
        initial_state["total_metrics_stored"] = 0
        
        # Run the agent
        final_state = await agent.ainvoke(initial_state)
        
        print("OpenAI usage agent completed successfully")
        
        # For debugging
        print(f"Final state type: {type(final_state)}")
        
        # Use global variable to track metrics since the state isn't being preserved
        # between node transitions in LangGraph
        global total_metrics_stored_globally
        
        # The result will be the string "__end__" if everything completes
        print(f"Total metrics stored: {total_metrics_stored_globally}")
        return {
            "success": True,
            "metrics_stored": total_metrics_stored_globally
        }
    except Exception as e:
        print(f"Error running OpenAI usage agent: {e}")
        return {"success": False, "error": str(e)}

# Create a global counter to track metrics across state changes
total_metrics_stored_globally = 0

# Main function to run the agent
if __name__ == "__main__":
    # Run the agent
    result = asyncio.run(run_openai_usage_agent())
    print(json.dumps(result, indent=2)) 