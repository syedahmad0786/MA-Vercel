// GHL API Configuration
module.exports = {
  API_KEY: process.env.GHL_API_KEY || 'pit-a9b33eeb-a4e9-4e44-ae86-df39e9c2beb4',
  LOCATION_ID: process.env.GHL_LOCATION_ID || 'YVCbAcynbqk61ZCxX3ep',
  BASE_URL: 'https://services.leadconnectorhq.com',
  API_VERSION: '2021-07-28',
  RATE_LIMIT_DELAY: 120, // ms between requests to stay under 100/10s burst limit
};
