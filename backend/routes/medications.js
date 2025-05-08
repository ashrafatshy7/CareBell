const express = require('express');
const router = express.Router();
const Medication = require('../models/medication'); // Adjust path as needed

router.get('/', async (req, res) => {
    try {
        const meds = await Medication.find();
        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const meds = await Medication.find({ userId: req.params.userId });

        if (!meds.length) {
            return res.status(404).json({ message: 'No medications found for this user' });
        }

        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.get('/getAll/:userId', async (req, res) => {
    try {
        const medications = await Medication.find({ userId: req.params.userId });

        if (!medications.length) {
            return res.status(404).json({ message: 'No medications found for this user' });
        }

        res.json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/addMedication', async (req, res) => {
    try {
        const { userId, name, dosage, frequency, lastTaken, nextDue } = req.body;

        const newMedication = new Medication({
            userId,
            name,
            dosage,
            frequency,
            lastTaken,
            nextDue
        });

        const savedMedication = await newMedication.save();
        res.status(201).json(savedMedication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
