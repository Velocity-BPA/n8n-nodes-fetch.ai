#!/bin/bash
set -e

echo "[BUILD] Building n8n-nodes-fetchai..."

# Clean previous build
rm -rf dist/

# Install dependencies
npm install

# Run build
npm run build

echo "[BUILD] Build complete!"
