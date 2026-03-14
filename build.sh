#!/bin/bash
echo "Installing backend dependencies..."
cd backend && npm install

echo "Installing frontend dependencies..."
cd ../frontend && npm install

echo "Building frontend for static export..."
npm run build

echo "Build complete! Contents of out directory:"
ls -la out/

echo "Admin directory:"
ls -la public/admin/
