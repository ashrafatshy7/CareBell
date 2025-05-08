const express = require('express');
const router = express.Router();
const BellaReminder = require('../models/bellaReminder');

router.post('/addReminder', async (req, res) => {
    try {
        const { userId, title, description, reminderTime, isImportant } = req.body;

        const newReminder = new BellaReminder({
            userId,
            title,
            description,
            reminderTime,
            isImportant
        });

        const savedReminder = await newReminder.save();
        res.status(201).json(savedReminder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const reminders = await BellaReminder.find({ userId: req.params.userId });

        if (!reminders || reminders.length === 0) {
            return res.status(404).json({ message: 'No reminders found for this user' });
        }

        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
