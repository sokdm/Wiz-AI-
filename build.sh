#!/bin/bash
set -e

echo "=== Wiz AI Build Process ==="

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend

# Create .babelrc to force Babel instead of SWC (fixes Render build)
if [ ! -f .babelrc ]; then
  echo '{"presets": ["next/babel"]}' > .babelrc
  echo "✅ Created .babelrc to disable SWC"
fi

# Install dependencies
npm install

# Build frontend with Babel instead of SWC
echo "🔨 Building frontend..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 || {
  echo "❌ Build failed, trying with more memory..."
  NODE_OPTIONS="--max-old-space-size=8192" npm run build
}

cd ..

echo "=== Build Complete ==="
echo "📁 Frontend build contents:"
ls -la frontend/out/ 2>/dev/null || echo "❌ frontend/out/ NOT FOUND"
echo ""
echo "📁 Admin directory:"
ls -la frontend/public/admin/ 2>/dev/null || ls -la admin/ 2>/dev/null || echo "❌ Admin not found"
