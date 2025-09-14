// Simple test endpoint for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://care-bell-10uozhrlo-ashrafs-projects-d4a3a57b.vercel.app'
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    origin: req.get('origin') || 'none'
  });
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Test User 1' },
    { id: 2, name: 'Test User 2' }
  ]);
});

module.exports = app;