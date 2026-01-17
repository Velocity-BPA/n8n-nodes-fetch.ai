#!/bin/bash
set -e

echo "[TEST] Running n8n-nodes-fetchai tests..."

# Run linting
echo "[TEST] Running ESLint..."
npm run lint

# Run unit tests
echo "[TEST] Running unit tests..."
npm test

# Run build to verify compilation
echo "[TEST] Verifying build..."
npm run build

echo "[TEST] All tests passed!"
