const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');

// Your routes
const userRoute = require('./routes/users');
const contactRoute = require('./routes/contacts');
const foodRoute = require('./routes/foods');
const medicationRoute = require('./routes/medications');
const bellaReminderRoute = require('./routes/bellaReminders');
const newsRoute = require('./routes/news');

const app = express();
const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/carebell.online/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/carebell.online/fullchain.pem')
}, app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

io.on('connection_error', (err) => {
  console.log(`Connection error: ${err.message}`);
});

const PORT = 443;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/CareBell')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

app.use('/users', userRoute);
app.use('/contacts', contactRoute);
app.use('/foods', foodRoute);
app.use('/medications', medicationRoute);
app.use('/bellaReminders', bellaReminderRoute);
app.use('/news', newsRoute);

app.get('/', (req, res) =>{
    res.send('asdfsfd');
});

require('./sockets')(io);

server.listen(PORT, () => {
  console.log('HTTPS server started on https://carebell.online');
});
