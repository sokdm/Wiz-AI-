#!/bin/bash

echo "🧙‍♂️ Wiz AI Complete Setup"
echo "========================"

# Create directories
mkdir -p backend/{config,routes,models,middleware,services}
mkdir -p frontend/{pages/payment,components,services,public,styles,store}
mkdir -p admin database

echo "✅ Directories created"

# Check if running in Termux
if [ -n "$TERMUX_VERSION" ]; then
    echo "📱 Termux detected"
    pkg update -y && pkg install nodejs git -y
fi

# Install backend
echo "📦 Installing backend dependencies..."
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken axios multer tesseract.js express-rate-limit helmet express-validator node-cron compression morgan flutterwave-node-v3 nodemon --save
cd ..

# Install frontend  
echo "📦 Installing frontend dependencies..."
cd frontend
npm init -y
npm install next@14.0.0 react@18.2.0 react-dom@18.2.0 axios tailwindcss postcss autoprefixer @heroicons/react react-hot-toast zustand react-markdown recharts --save
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy all backend code files"
echo "2. Copy all frontend code files"  
echo "3. Edit backend/.env with your API keys"
echo "4. Seed database: cd database && node seed-quiz.js"
echo "5. Start backend: cd backend && node server.js"
echo "6. Start frontend: cd frontend && npm run dev"
echo ""
echo "📍 Access points:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo "   - Admin: Open admin/index.html in browser"
