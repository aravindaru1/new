const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();
const app = express();
const PORT = process.env.PORT;

const Algorithm = process.env.ALGORITHM;
const apiKey = process.env.ENCRYPTION_KEY;

app.use(express.json());
app.use(cors());

let previousMinNewsId = null;

app.get('/news', async (req, res) => {
  try {
    const url = `${process.env.API}&cache_bust=` + Date.now();
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    const data = JSON.stringify(response.data); // Ensure the data is a string
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv(Algorithm, Buffer.from(apiKey, 'utf-8'), iv);
    let encryptedData = cipher.update(data, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    previousMinNewsId = response.data.data.min_news_id;

    res.json({
      data: encryptedData,
      iv: iv.toString('hex') // Return the IV as a hex string
    });
  } catch (error) {
    console.error('Error fetching data from Inshorts API:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/news-more', async (req, res) => {
  try {
    const minNewsId = req.body.minNewsId;
    const url = `${process.env.API}&news_offset=${minNewsId}`;
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    const data = JSON.stringify(response.data); // Ensure the data is a string
    const iv = crypto.randomBytes(16); // Generate a random IV
    const cipher = crypto.createCipheriv(Algorithm, Buffer.from(apiKey, 'utf-8'), iv);
    let encryptedData = cipher.update(data, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');

    res.json({
      data: encryptedData,
      iv: iv.toString('hex') // Return the IV as a hex string
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch more data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
