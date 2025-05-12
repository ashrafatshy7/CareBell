const express = require('express');
const router = express.Router();
const Food = require('../models/food');


router.get('/', async (req, res) =>{
    const foods = await Food.find();
    res.json(foods);
});


router.get('/:barcode', async (req, res) => {
    try {
        const food = await Food.findOne({ barcode: req.params.barcode });


        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.json(food);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/addFood', async (req, res) => {
    try {
        const { barcode, name, description, ingredients } = req.body;

        const newFood = new Food({
            barcode,
            name,
            description,
            ingredients
        });

        const savedFood = await newFood.save();
        res.status(201).json(savedFood);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;