#!/bin/bash

# Script to clean Next.js cache and fix common development issues

echo "🧹 Cleaning Next.js cache..."

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "node.*next"

# Remove Next.js cache folders
echo "Removing .next directory..."
rm -rf .next

echo "Removing node_modules/.cache..."
rm -rf node_modules/.cache

# Optional: Clean up node_modules (uncommenting may require a full npm install after)
# echo "Removing node_modules (this will require npm install after)..."
# rm -rf node_modules
# npm install

echo "✅ Cache cleaning complete!"
echo "You can now restart your development server:"
echo "npm run dev:fast" 