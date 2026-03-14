const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Debug: log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// CORS - allow all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/image-solver', require('./routes/imageSolver'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from frontend/out
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '../frontend/public/admin')));

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// All other routes -> serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Wiz AI Server Running
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📅 ${new Date().toLocaleString()}
  `);
});
