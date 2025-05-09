const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const userRoute = require('./routes/users');
const contactRoute = require('./routes/contacts');
const foodRoute = require('./routes/foods');
const medicationRoute = require('./routes/medications');
const bellaReminderRoute = require('./routes/bellaReminders');
const newsRoute = require('./routes/news');


const app = express();
const PORT = 3000;


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


app.listen(PORT, () =>{
    console.log("server started");
});