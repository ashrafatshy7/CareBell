// Working Vercel serverless function with Express
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://care-bell-10uozhrlo-ashrafs-projects-d4a3a57b.vercel.app'
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB connection (only if URI is provided)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
    maxPoolSize: 1
  }).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });
}

// Load users route if possible
let userRoute;
try {
  userRoute = require('../routes/users');
  if (userRoute) {
    app.use('/users', userRoute);
  }
} catch (error) {
  console.log('Users route not loaded, using fallback');
  // Fallback users route
  app.get('/users', (req, res) => {
    res.json([
      { id: 1, name: 'Test User 1', email: 'test1@example.com' },
      { id: 2, name: 'Test User 2', email: 'test2@example.com' }
    ]);
  });
}

// Basic endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'CareBell API is live! 🚀',
    timestamp: new Date().toISOString(),
    version: '2.0',
    endpoints: ['/users', '/health']
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;