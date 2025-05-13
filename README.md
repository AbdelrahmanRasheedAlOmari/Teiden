# Kyto Dashboard Backend

This repository contains the code for the Kyto Dashboard backend, focusing on user authentication and secure API key storage.

## Features

- **User Authentication**: Email/password authentication using Supabase Auth
- **Secure API Key Storage**: AES-256 encryption for all stored API keys
- **Row-Level Security**: Ensures users can only access their own data
- **Private API Access**: Backend-only endpoints for secure API key retrieval
- **Dashboard to visualize API usage**
- **Ability to add and manage API keys**
- **Projects to organize API keys**
- **Usage tracking for OpenAI API keys**

## OpenAI Usage Fetcher Agent

The application includes an automated agent that fetches usage data from the OpenAI API for all stored API keys. This feature:

- Fetches usage data from OpenAI's dashboard endpoints
- Processes and stores the data in the database
- Runs every 15 minutes via a scheduled cron job
- Uses LangGraph (Python) for the agent workflow implementation

### How the Agent Works

1. Retrieves all OpenAI API keys from the database
2. For each key:
   - Decrypts the API key
   - Tests the connection to ensure the key is valid
   - Fetches usage data for the last day from OpenAI's dashboard API
   - Processes the data and categorizes it by model
   - Stores the metrics in the usage_metrics table

### Python Implementation

The OpenAI usage fetcher is implemented in Python using LangGraph, which provides robust agent orchestration capabilities. The Python implementation:

- Runs as a separate process from the Next.js application
- Directly connects to Supabase for database operations
- Utilizes LangGraph's StateGraph for workflow orchestration
- Handles error recovery and state management

### Development

To run the cron jobs locally during development:

```bash
npm run dev:cron
```

This will simulate the production cron jobs on your local environment, including running the Python-based OpenAI usage fetcher.

You can also run the Python agent directly:

```bash
bash scripts/run-usage-fetcher.sh
```

### Requirements

The Python agent requires the following:
- Python 3.9+
- LangGraph 0.4.1+
- Python libraries listed in `scripts/requirements.txt`

The first time you run the agent, it will set up a Python virtual environment and install the necessary dependencies automatically.

## Technical Architecture

### Authentication Flow

1. Users sign up or log in using email/password through Supabase Auth
2. Upon successful authentication, the user receives a session token
3. Protected routes and API endpoints verify the session token before granting access

### API Key Security

- **Encryption**: All API keys are encrypted using AES-256-CBC before storage
- **Masking**: When displaying API keys in the UI, only masked versions are shown
- **Secure Retrieval**: Full decrypted keys are only accessible to authorized backend services

### Database Schema

The database uses the following schema:

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  encrypted_key TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);
```

### API Endpoints

- `GET /api/keys` - List all API keys for the authenticated user
- `POST /api/keys` - Add a new API key (encrypts before storing)
- `DELETE /api/keys?id=<key_id>` - Delete an API key
- `GET /api/keys/[id]` - Get details of a specific API key (with masked value)
- `PATCH /api/keys/[id]` - Update a specific API key
- `POST /api/keys/fetch` - Backend-only endpoint to securely retrieve decrypted API keys

## Setup Instructions

### Prerequisites

- Node.js 14+
- Supabase account

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Security keys
ENCRYPTION_KEY=your-32-character-encryption-key
SERVER_SECRET_KEY=your-server-secret-key
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL script in `db/schema.sql` to set up the required tables and policies

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### Production Deployment

```bash
# Build the application
npm run build

# Start the server
npm start
```

## Security Considerations

- The encryption key should be at least 32 characters long and stored securely
- Server-to-server authentication uses a separate secret key
- API keys are never exposed in client-side code or logs
- Row-level security ensures data isolation between users 