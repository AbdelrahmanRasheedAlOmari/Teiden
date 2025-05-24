# Teiden Dashboard

**Teiden** is your all-in-one platform for secure API key management and usage analytics. Effortlessly organize, store, and monitor your API keys—including OpenAI keys—with enterprise-grade encryption, usage tracking, and automated insights.

🚀 **Try it now at [teiden.vercel.app](https://teiden.vercel.app)**

## Why Teiden?

- **Centralized API Key Management**: Manage all your API keys in one secure place.
- **Powerful Analytics**: Visualize API usage and track consumption trends over time.
- **Automated Usage Fetching**: Get up-to-date usage metrics for OpenAI and other providers, powered by intelligent agents.
- **Project Organization**: Group keys by project for better clarity and control.
- **Enterprise-Grade Security**: All keys are encrypted with AES-256, and access is protected by robust authentication and row-level security.
- **Seamless Collaboration**: Built for teams and individuals who need to manage sensitive credentials safely.

## Key Features

- **User Authentication**: Secure email/password login (Supabase Auth)
- **Encrypted API Key Storage**: Your secrets are always protected
- **Usage Tracking**: Automated agents fetch and analyze API usage
- **Dashboard**: Intuitive UI to visualize and manage your API keys
- **Project Organization**: Keep your keys organized by project
- **Open Source & Self-Hostable**: Run Teiden on your own infrastructure if you prefer

## Get Started

You can start using Teiden instantly at [teiden.vercel.app](https://teiden.vercel.app), or self-host your own instance by following the instructions below.

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

## Development & Agents

Teiden includes a Python-based agent that automatically fetches and processes OpenAI usage data. To run the agent locally:

```bash
npm run dev:cron
```

Or run the Python agent directly:

```bash
bash scripts/run-usage-fetcher.sh
```

The agent requires Python 3.9+, LangGraph 0.4.1+, and dependencies listed in `scripts/requirements.txt`. The first run will set up a virtual environment automatically.

## Security Considerations

- Encryption keys should be at least 32 characters and stored securely
- API keys are never exposed in client-side code or logs
- Row-level security ensures data isolation between users

---

**Teiden** is open source and welcomes contributions. For issues, feature requests, or to get involved, open an issue or pull request on GitHub. 