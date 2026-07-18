const fs = require('fs');
try {
  const d = JSON.parse(fs.readFileSync('RAW_RESPONSE.json', 'utf8'));
  const gd = d.horoscope.graha_dashas || {};
  console.log('GRAHA_DASHAS_KEYS:', Object.keys(gd));
  if (gd.yogini) console.log('Yogini Length:', gd.yogini.length);
  if (gd.ashtottari) console.log('Ashtottari Length:', gd.ashtottari.length);
} catch (e) {
  console.error(e);
}
