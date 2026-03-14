#!/bin/bash

echo "🔍 Verifying Wiz AI Installation"
echo "================================="

files=(
    "backend/package.json"
    "backend/server.js"
    "backend/.env"
    "backend/models/User.js"
    "backend/models/Conversation.js"
    "backend/models/QuizQuestion.js"
    "backend/models/QuizProgress.js"
    "backend/models/Leaderboard.js"
    "backend/models/Payment.js"
    "backend/models/AiUsageLog.js"
    "backend/middleware/auth.js"
    "backend/middleware/rateLimiter.js"
    "backend/middleware/upload.js"
    "backend/middleware/checkSubscription.js"
    "backend/services/aiService.js"
    "backend/services/paymentService.js"
    "backend/services/ocrService.js"
    "backend/routes/auth.js"
    "backend/routes/ai.js"
    "backend/routes/conversations.js"
    "backend/routes/imageSolver.js"
    "backend/routes/quiz.js"
    "backend/routes/payment.js"
    "backend/routes/user.js"
    "backend/routes/admin.js"
    "frontend/package.json"
    "frontend/next.config.js"
    "frontend/tailwind.config.js"
    "frontend/postcss.config.js"
    "frontend/styles/globals.css"
    "frontend/services/api.js"
    "frontend/store/useStore.js"
    "frontend/pages/_app.js"
    "frontend/pages/_document.js"
    "frontend/pages/index.js"
    "frontend/pages/login.js"
    "frontend/pages/register.js"
    "frontend/pages/dashboard.js"
    "frontend/pages/tutor.js"
    "frontend/pages/homework.js"
    "frontend/pages/image-solver.js"
    "frontend/pages/quiz.js"
    "frontend/pages/payment/subscribe.js"
    "frontend/pages/payment/verify.js"
    "frontend/public/manifest.json"
    "frontend/public/service-worker.js"
    "admin/index.html"
    "database/seed-quiz.js"
)

missing=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
        missing=$((missing + 1))
    fi
done

echo ""
if [ $missing -eq 0 ]; then
    echo "🎉 All files present! Ready to start."
    echo "Run: ./start.sh all"
else
    echo "⚠️  $missing files missing"
fi
