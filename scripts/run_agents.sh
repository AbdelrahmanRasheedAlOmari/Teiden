#!/bin/bash

# Run Teiden AI Agents (Forecasting & Prevention)
# This script runs both the forecasting agent to predict future usage and
# the prevention agent to check thresholds and send alerts

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r lib/agents/requirements.txt

# Create log directory if it doesn't exist
mkdir -p logs

# Set timestamp for log files
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "== Running Forecasting Agent =="
# Run the forecasting agent
python3 lib/agents/forecasting-agent/forecast_agent.py > "logs/forecast_${TIMESTAMP}.log" 2>&1
FORECAST_EXIT_CODE=$?

echo "== Running Prevention Agent =="
# Run the prevention agent
python3 lib/agents/prevention-agent/prevention_agent.py > "logs/prevention_${TIMESTAMP}.log" 2>&1
PREVENTION_EXIT_CODE=$?

# Check results
if [ $FORECAST_EXIT_CODE -eq 0 ] && [ $PREVENTION_EXIT_CODE -eq 0 ]; then
  echo "✅ Both agents completed successfully"
  echo "  Forecast log: logs/forecast_${TIMESTAMP}.log"
  echo "  Prevention log: logs/prevention_${TIMESTAMP}.log"
else
  echo "❌ One or more agents failed"
  if [ $FORECAST_EXIT_CODE -ne 0 ]; then
    echo "  ❌ Forecasting agent failed with exit code $FORECAST_EXIT_CODE"
    echo "  Log: logs/forecast_${TIMESTAMP}.log"
    tail -n 20 "logs/forecast_${TIMESTAMP}.log"
  fi
  if [ $PREVENTION_EXIT_CODE -ne 0 ]; then
    echo "  ❌ Prevention agent failed with exit code $PREVENTION_EXIT_CODE"
    echo "  Log: logs/prevention_${TIMESTAMP}.log"
    tail -n 20 "logs/prevention_${TIMESTAMP}.log"
  fi
fi

# Deactivate virtual environment
deactivate 