#!/bin/bash

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
pip install -r scripts/requirements.txt

# Run the OpenAI usage fetcher
echo "Running OpenAI usage fetcher..."
python3 scripts/openai_usage_fetcher.py

# Deactivate virtual environment
deactivate 