const express = require('express');
const axios = require('axios');

const router = express.Router();

const API_KEY = '01fb15e1884a7312084fe121ec6af5c2';

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