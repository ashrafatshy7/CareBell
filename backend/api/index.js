// Minimal API for Vercel deployment debugging
const express = require('express');
const cors = require('cors');

const app = express();

// Simple CORS - allow all for now
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Basic test endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Test User 1', email: 'test1@example.com' },
    { id: 2, name: 'Test User 2', email: 'test2@example.com' }
  ]);
});

// Catch all other routes
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

module.exports = app;