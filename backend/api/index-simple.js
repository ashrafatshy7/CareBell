// Simplified version for Vercel deployment
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://care-bell-10uozhrlo-ashrafs-projects-d4a3a57b.vercel.app'
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// MongoDB Connection for Serverless
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10_000,
  bufferCommands: false,
  maxPoolSize: 1,
  socketTimeoutMS: 45000,
  family: 4
};

mongoose.set('bufferCommands', false);

let connectionPromise;
if (process.env.MONGODB_URI) {
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
  connectionPromise
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// Database connection middleware
app.use(async (req, res, next) => {
  if (connectionPromise) {
    try {
      await connectionPromise;
    } catch (err) {
      console.error('DB not ready, rejecting request:', err);
      return res.status(503).json({ error: 'Service Unavailable - Database not connected' });
    }
  }
  next();
});

// Load routes with error handling
let userRoute;
try {
  userRoute = require('../routes/users');
} catch (error) {
  console.error('Error loading users route:', error);
}

// Routes
if (userRoute) {
  app.use('/users', userRoute);
}

// Basic endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'API is live! 🚀',
    timestamp: new Date().toISOString(),
    origin: req.get('origin') || 'none',
    routes: ['/users', '/health']
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;