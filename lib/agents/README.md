# Teiden AI Agents

This directory contains the AI agents used in the Teiden dashboard for various automation tasks.

## Agent Structure

Each agent is organized in its own subdirectory:

- **openai-usage-agent/**: Fetches API usage data from OpenAI and stores it in the database
- **forecasting-agent/**: Predicts future API token usage based on historical patterns
- **prevention-agent/**: Monitors usage metrics, detects threshold crossings, and sends alerts

## Common Requirements

All agents share common dependencies listed in `requirements.txt`. To install:

```bash
pip install -r lib/agents/requirements.txt
```

## Running Agents

You can run the agents directly from their directories, but it's recommended to use the provided scripts:

- OpenAI Usage Agent: `scripts/run-usage-fetcher.sh`
- All Agents: `scripts/run_agents.sh`

## Automated Execution

These agents are automatically executed via:

1. Cron jobs defined in `vercel.json`
2. API endpoints:
   - `/api/cron/usage-fetcher`
   - `/api/cron/agents?type=forecast`
   - `/api/cron/agents?type=prevention`

## Development

When developing new agents, follow these conventions:

1. Create a new directory under `lib/agents/<agent-name>/`
2. Use LangGraph for agent workflow orchestration
3. Implement an entry point script that can be run directly
4. Add any agent-specific dependencies to the main `requirements.txt` 