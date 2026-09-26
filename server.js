import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory cached exchange rate
let cachedRate = {
  rate: 0.621,
  inverseRate: 1.6103,
  updatedAt: new Date().toUTCString(),
  source: 'market'
};
let lastFetchTime = 0;

app.get('/api/rates', async (req, res) => {
  const now = Date.now();
  // Cache for 30 minutes
  if (now - lastFetchTime > 30 * 60 * 1000) {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/AUD');
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates && data.rates.EUR) {
          const eurRate = Number(data.rates.EUR);
          cachedRate = {
            rate: eurRate,
            inverseRate: Number((1 / eurRate).toFixed(4)),
            updatedAt: data.time_last_update_utc || new Date().toUTCString(),
            source: 'live'
          };
          lastFetchTime = now;
        }
      }
    } catch (err) {
      console.warn('Currency rate fetch error, using cached rate:', err.message);
    }
  }
  res.json(cachedRate);
});

// Serve static assets from the current directory
app.use(express.static(__dirname));

// Fallback to index.html for root or any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Australien Roadtrip app running on http://0.0.0.0:${PORT}`);
});
