# Setting Up the Usage Fetcher Cron Job

This document explains how to set up a cron job to regularly fetch and store API usage data from OpenAI.

## Overview

The Usage Fetcher is designed to collect API token usage data from OpenAI accounts. It runs on a schedule to:

1. Fetch usage data from OpenAI's billing endpoints
2. Process and normalize the data
3. Store it in the `usage_metrics` table in the database

This enables tracking, visualization, and alerting based on API usage patterns.

## Environment Variables

Ensure the following environment variables are set:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-key> # This is different from the anon key
ENCRYPTION_KEY=<your-encryption-key> # Used to decrypt stored API keys
CRON_API_KEY=<your-cron-api-key> # Used to authenticate cron job requests
```

## Setting Up the Cron Job

### Using GitHub Actions (Recommended)

1. Create a new GitHub workflow file at `.github/workflows/usage-fetcher.yml`:

```yaml
name: Usage Fetcher Cron

on:
  schedule:
    # Run every 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  fetch-usage:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Usage Fetcher
        run: |
          curl -X GET \
            -H "x-cron-api-key: ${{ secrets.CRON_API_KEY }}" \
            https://your-app-domain.com/api/cron/usage-fetcher
```

2. Set the `CRON_API_KEY` secret in your GitHub repository settings.

### Using Vercel Cron Jobs (Alternative)

If your application is deployed on Vercel, you can use their built-in Cron Jobs:

1. Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/usage-fetcher",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

2. Ensure you have set the `CRON_API_KEY` in your Vercel environment variables.
3. Deploy your application.

### Using a Traditional Cron Job

If you're running on a server:

```bash
# crontab -e
*/15 * * * * curl -X GET -H "x-cron-api-key: YOUR_CRON_API_KEY" https://your-app-domain.com/api/cron/usage-fetcher
```

## Monitoring

Monitor the execution of the cron job by:

1. Checking the logs in your deployment platform
2. Setting up error notifications (e.g., via Slack, email)
3. Implementing a status dashboard to track successful runs

## Troubleshooting

Common issues:

- **Authentication errors**: Check the `CRON_API_KEY` is correctly set and being passed
- **Database errors**: Verify database connection and Supabase service key
- **API errors**: Ensure OpenAI API keys are valid and have the proper permissions

If you encounter persistent issues, check the application logs for more details.

## Future Enhancements

Planned improvements:

- Support for additional API providers (Anthropic, Mistral, etc.)
- More detailed token usage breakdowns
- Cost forecasting based on usage patterns 