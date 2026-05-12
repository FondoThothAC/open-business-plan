#!/bin/bash
# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "Starting OpenPlan V2 - Industrial Edition (Mac/Linux)..."
echo "Directory: $DIR"
echo "Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Launching OpenPlan (Frontend + Backend)..."
npm run start
