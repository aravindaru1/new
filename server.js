const express = require('express');

const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Add this line to parse JSON request bodies
app.use(cors());

let previousMinNewsId = null; // store the previous min news id

app.get('/news', async (req, res) => {
  try {
    const url = `${process.env.API}&cache_bust=` + Date.now();
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    const data = response.data;
    previousMinNewsId = data.data.min_news_id; // store the initial min news id
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Inshorts API:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
app.post('/news-more', async (req, res) => {
  try {
    console.log('Received POST request to /scrape-more');
    const minNewsId = req.body.minNewsId;
    console.log(`minNewsId: ${minNewsId}`);
    const url = `${process.env.API}&news_offset=${minNewsId}`;
    console.log(`Fetching news from: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    console.log('Response received from Inshorts API');
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Error fetching more data from Inshorts API:', error);
    res.status(500).json({ error: 'Failed to fetch more data' });
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
