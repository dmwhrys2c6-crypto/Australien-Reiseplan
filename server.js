import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const AUTH_CODE = 'AUSROA';
const PROTECTED_RESOURCES = {
  splitwise: 'https://secure.splitwise.com/#/groups/101615495',
  photos: 'https://photos.app.goo.gl/c8Bkr97b1hc8QrKP7'
};

app.post('/api/verify-auth', (req, res) => {
  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Kein Code übergeben' });
  }
  if (code.trim().toUpperCase() === AUTH_CODE) {
    return res.json({
      success: true,
      authenticated: true,
      resources: PROTECTED_RESOURCES
    });
  }
  return res.status(403).json({
    success: false,
    authenticated: false,
    message: 'Ungültiger Sicherheitscode. Zugriff verweigert.'
  });
});

// In-memory cached exchange rate
let cachedRate = {
  rate: 0.621,
  inverseRate: 1.6103,
  updatedAt: new Date().toUTCString(),
  source: 'market'
};
let lastFetchTime = 0;

// In-memory cached weather data for Sydney, Brisbane, Melbourne
let cachedWeather = null;
let lastWeatherFetch = 0;

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

app.get('/api/weather', async (req, res) => {
  const now = Date.now();
  // Cache for 10 minutes
  if (!cachedWeather || (now - lastWeatherFetch > 10 * 60 * 1000)) {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-33.8688,-27.4698,-37.8136&longitude=151.2093,153.0251,144.9631&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto'
      );
      if (response.ok) {
        const raw = await response.json();
        if (Array.isArray(raw) && raw.length === 3) {
          cachedWeather = {
            sydney: {
              city: 'Sydney',
              state: 'NSW',
              temp: raw[0].current.temperature_2m,
              apparentTemp: raw[0].current.apparent_temperature,
              weatherCode: raw[0].current.weather_code,
              windSpeed: raw[0].current.wind_speed_10m,
              humidity: raw[0].current.relative_humidity_2m,
              time: raw[0].current.time
            },
            brisbane: {
              city: 'Brisbane',
              state: 'QLD',
              temp: raw[1].current.temperature_2m,
              apparentTemp: raw[1].current.apparent_temperature,
              weatherCode: raw[1].current.weather_code,
              windSpeed: raw[1].current.wind_speed_10m,
              humidity: raw[1].current.relative_humidity_2m,
              time: raw[1].current.time
            },
            melbourne: {
              city: 'Melbourne',
              state: 'VIC',
              temp: raw[2].current.temperature_2m,
              apparentTemp: raw[2].current.apparent_temperature,
              weatherCode: raw[2].current.weather_code,
              windSpeed: raw[2].current.wind_speed_10m,
              humidity: raw[2].current.relative_humidity_2m,
              time: raw[2].current.time
            },
            updatedAt: new Date().toISOString()
          };
          lastWeatherFetch = now;
        }
      }
    } catch (err) {
      console.warn('Weather API fetch error:', err.message);
    }
  }
  res.json(cachedWeather || {});
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
