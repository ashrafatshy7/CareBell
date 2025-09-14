// root/api/index.js
require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// ─── Route handlers ───────────────────────────────────────────────────────────
try {
  var userRoute          = require('../routes/users');
  var contactRoute       = require('../routes/contacts');
  var foodRoute          = require('../routes/foods');
  var medicationRoute    = require('../routes/medications');
  var bellaReminderRoute = require('../routes/bellaReminders');
  var newsRoute          = require('../routes/news');
  var exercisesRoute     = require('../routes/exercises');
  var reminderRoute      = require('../routes/reminders');
  var roomsRoute         = require('../routes/rooms');
  var ttsRoute           = require('../routes/tts');
} catch (error) {
  console.error('Error loading routes:', error);
}

// ─── App & Server setup ────────────────────────────────────────────────────────
const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"], credentials: false },
  transports: ['websocket','polling']
});
app.set('io', io);


// CORS configuration for both development and production
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // React dev server
    'http://localhost:5000',  // Alternative dev port
    'https://care-bell-10uozhrlo-ashrafs-projects-d4a3a57b.vercel.app', // Production frontend
    // Add your production frontend domain here when deployed
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// ─── MongoDB Connection for Serverless ─────────────────────────────────────────
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10_000, // allow more time for serverless cold starts
  bufferCommands: false,
  maxPoolSize: 1, // minimize connections for serverless
  socketTimeoutMS: 45000, // close sockets after 45 seconds of inactivity
  family: 4 // use IPv4, skip trying IPv6
};

mongoose.set('bufferCommands', false);

// Simple connection for Vercel (no retry logic needed)
let connectionPromise;
if (process.env.MONGODB_URI) {
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
  connectionPromise
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// ─── Middleware to wait for database connection ───────────────────────────────
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

// ─── Socket.IO Integration ────────────────────────────────────────────────────
const setupSockets = require('../sockets');
setupSockets(io);

// ─── Static Resources ─────────────────────────────────────────────────────────
app.use(
  '/resources',
  express.static(path.join(__dirname, '..', 'resources'))
);

// ─── Routes ───────────────────────────────────────────────────────────────────
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

app.get('/', (_req, res) => {
  res.json({
    message: 'API is live! 🚀',
    timestamp: new Date().toISOString(),
    routes: ['/users', '/contacts', '/foods', '/medications', '/bellaReminders', '/news', '/exercises', '/reminders', '/rooms', '/tts']
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ─── Export for Vercel serverless function ──────────────────────────────────
module.exports = app;

// ─── Start server locally for development ────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 4443;

  function startServer() {
    server.listen(PORT);
  }

  server
    .on('listening', () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    })
    .on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} in use, retrying in 5s…`);
        setTimeout(() => {
          server.close();
          startServer();
        }, 5000);
      } else {
        console.error('🔥 Server error:', err);
        process.exit(1);
      }
    });

  startServer();
}
