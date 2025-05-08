const express = require('express');
const router = express.Router();
const User = require('../models/user');


router.get('/', async (req, res) =>{
    const users = await User.find();
    res.json(users);
});


router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/addUser', async (req, res)=>{
    const { id, fullName, phoneNumber, address, dateOfBirth, gender, allergies } = req.body;

        const newUser = new User({
            id,
            fullName,
            phoneNumber,
            address,
            dateOfBirth,
            gender,
            allergies
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
})


module.exports = router;