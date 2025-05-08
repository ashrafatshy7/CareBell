const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');


router.get('/', async (req, res) =>{
    const contacts = await Contact.find();
    res.json(contacts);
});


router.get('/:userId', async (req, res) => {
    try {
        const contact = await Contact.findOne({ id: req.params.userId });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/getAll/:userId', async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.params.userId });

        if (!contacts.length) {
            return res.status(404).json({ message: 'No contacts found for this user' });
        }

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




router.post('/addContact', async (req, res) => {
    try {
        const { userId, fullName, phoneNumber, relationship } = req.body;

        const newContact = new Contact({
            userId,
            fullName,
            phoneNumber,
            relationship
        });

        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;