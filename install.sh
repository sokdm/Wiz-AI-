#!/bin/bash

echo "🚀 Wiz AI Installation Script"
echo "=============================="

# Check if running in Termux
if [ -n "$TERMUX_VERSION" ]; then
    echo "✅ Termux detected"
else
    echo "⚠️  Warning: Not running in Termux"
fi

# Update packages
echo "📦 Updating packages..."
pkg update -y && pkg upgrade -y

# Install dependencies
echo "📦 Installing Node.js and Git..."
pkg install nodejs git yarn -y

# Verify installations
echo "✅ Verifying installations..."
node -v
npm -v

# Create directories
echo "📁 Creating project structure..."
mkdir -p backend/{config,routes,models,middleware,services}
mkdir -p frontend/{pages,payment,components,services,public,styles,store}
mkdir -p admin database

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your API keys"
echo "2. Run: cd backend && node server.js"
echo "3. In new terminal: cd frontend && npm run dev"
echo ""
