const express = require('express');
const axios = require('axios');

const router = express.Router();

const API_KEY = '3961d9e23ad18277e538286ba21780a5';

router.get('/todays-news', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get('http://api.mediastack.com/v1/news', {
            params: {
                access_key: API_KEY,
                date: today,
                languages: 'de',
                countries: 'de',
            },
        });

        res.json(response.data.data);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

module.exports = router;
