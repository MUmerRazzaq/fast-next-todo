#!/bin/bash

# This script provides a CLI for seeding the database.
# It supports different environments and an optional database reset.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PYTHON_CMD="python3" # Or just "python" if that's your setup

# --- Functions ---
usage() {
    echo "Usage: $0 <environment> [--reset]"
    echo "Seeds the database with data for a specific environment."
    echo ""
    echo "Arguments:"
    echo "  <environment>   The environment to seed (e.g., dev, test, demo)."
    echo "  --reset         Optional. If provided, resets the database before seeding."
    echo ""
    echo "Example:"
    echo "  $0 dev                # Seeds the dev environment"
    echo "  $0 demo --reset       # Resets the DB and seeds the demo environment"
    exit 1
}

# --- Main Logic ---

# Check for help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    usage
fi

# Check for environment argument
if [ -z "$1" ]; then
    echo "Error: Environment argument is required."
    usage
fi

ENVIRONMENT=$1
RESET_DB=false

# Check for reset flag
if [[ "$2" == "--reset" ]]; then
    RESET_DB=true
fi

echo "--- Seeding Process Started ---"
echo "Environment: $ENVIRONMENT"
echo "Reset Database: $RESET_DB"
echo "------------------------------"

# Activate virtual environment if needed
# TODO: Uncomment and set the correct path if you use a virtual environment.
# if [ -d "venv" ]; then
#     echo "Activating virtual environment..."
#     source venv/bin/activate
# fi

# Reset database if requested
if [ "$RESET_DB" = true ]; then
    echo "STEP 1: Resetting database..."
    $PYTHON_CMD "$SCRIPT_DIR/reset_db.py"
    echo "STEP 1: Finished resetting database."
    echo "------------------------------"
    echo "STEP 2: Seeding database..."
else
    echo "STEP 1: Seeding database (without reset)..."
fi

# Run the seeding script
$PYTHON_CMD "$SCRIPT_DIR/seed.py" "$ENVIRONMENT"

echo "STEP ${RESET_DB:+2:1}: Finished seeding database."
echo "------------------------------"
echo "--- Seeding Process Finished Successfully ---"
