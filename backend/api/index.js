// Working Vercel serverless function with Express
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// More permissive CORS configuration for debugging
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Explicit OPTIONS handling
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
  res.sendStatus(200);
});

app.use(express.json());

// MongoDB connection (only if URI is provided)
let mongoConnected = false;
let connectionPromise = null;

if (process.env.MONGODB_URI) {
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
    maxPoolSize: 1
  });

  connectionPromise
    .then(() => {
      console.log('MongoDB connected');
      mongoConnected = true;
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      mongoConnected = false;
    });
}

// Middleware to ensure DB connection before routes
app.use(async (req, res, next) => {
  if (connectionPromise && !mongoConnected) {
    try {
      await connectionPromise;
      mongoConnected = true;
    } catch (err) {
      console.error('DB connection failed:', err);
      // Continue without DB connection
    }
  }
  next();
});

// Load all routes with error handling
let userRoute, contactRoute, foodRoute, medicationRoute, bellaReminderRoute;
let newsRoute, exercisesRoute, reminderRoute, roomsRoute, ttsRoute;

try {
  userRoute = require('../routes/users');
  contactRoute = require('../routes/contacts');
  foodRoute = require('../routes/foods');
  medicationRoute = require('../routes/medications');
  bellaReminderRoute = require('../routes/bellaReminders');
  newsRoute = require('../routes/news');
  exercisesRoute = require('../routes/exercises');
  reminderRoute = require('../routes/reminders');
  roomsRoute = require('../routes/rooms');
  ttsRoute = require('../routes/tts');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Mount routes
if (userRoute) app.use('/users', userRoute);
if (contactRoute) app.use('/contacts', contactRoute);
if (foodRoute) app.use('/foods', foodRoute);
if (medicationRoute) app.use('/medications', medicationRoute);
if (bellaReminderRoute) app.use('/bellaReminders', bellaReminderRoute);
if (newsRoute) app.use('/news', newsRoute);
if (exercisesRoute) app.use('/exercises', exercisesRoute);
if (reminderRoute) app.use('/reminders', reminderRoute);
if (roomsRoute) app.use('/rooms', roomsRoute);
if (ttsRoute) app.use('/tts', ttsRoute);

// Static resources
app.use('/resources', express.static(path.join(__dirname, '..', 'resources')));

// Basic endpoints
app.get('/', (req, res) => {
  const availableRoutes = [];
  if (userRoute) availableRoutes.push('/users');
  if (contactRoute) availableRoutes.push('/contacts');
  if (foodRoute) availableRoutes.push('/foods');
  if (medicationRoute) availableRoutes.push('/medications');
  if (bellaReminderRoute) availableRoutes.push('/bellaReminders');
  if (newsRoute) availableRoutes.push('/news');
  if (exercisesRoute) availableRoutes.push('/exercises');
  if (reminderRoute) availableRoutes.push('/reminders');
  if (roomsRoute) availableRoutes.push('/rooms');
  if (ttsRoute) availableRoutes.push('/tts');
  availableRoutes.push('/health');

  res.json({
    message: 'CareBell API is live! 🚀',
    timestamp: new Date().toISOString(),
    version: '2.0',
    mongodb: mongoConnected ? 'connected' : 'disconnected',
    endpoints: availableRoutes
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