#!/usr/bin/env bash
set -e

# Prepare dependencies
if [ ! -d node_modules ]; then
  if [ -f node_modules.tar.gz ]; then
    echo "Extracting node_modules.tar.gz..."
    tar -xzf node_modules.tar.gz
  else
    echo "Installing dependencies..."
    npm install
  fi
fi

# Start Vite development server
npm run dev
