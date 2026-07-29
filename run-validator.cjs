const { validateChartData } = require('./chart-data-validator.cjs');

const defaultProfileData = {
  birthDetails: {
    name: "Nitin Jain",
    date: "1976-01-06",
    time: "18:40:00",
    latitude: 30.3165,
    longitude: 78.0322,
    timezone: 5.5,
    location: "Dehradun, India",
    lagna: "Cancer"
  },
  ascendant: {
    sign: "Cancer",
    degree: 7.3,
    signIndex: 3
  },
  planets: [
    { name: "Sun", sign: "Sagittarius", longitude: 262.5, motion: "DIRECT" },
    { name: "Moon", sign: "Aquarius", longitude: 312.2, motion: "DIRECT" },
    { name: "Mars", sign: "Taurus", longitude: 54.1, motion: "DIRECT" },
    { name: "Mercury", sign: "Capricorn", longitude: 278.4, motion: "DIRECT" },
    { name: "Jupiter", sign: "Pisces", longitude: 345.8, motion: "DIRECT" },
    { name: "Venus", sign: "Capricorn", longitude: 285.2, motion: "DIRECT" },
    { name: "Saturn", sign: "Cancer", longitude: 108.6, motion: "RETROGRADE" }
  ],
  cusps: Array.from({ length: 12 }, (_, i) => ({ cusp: i + 1, longitude: (i * 30 + 15) % 360 }))
};

console.log("=== RUNNING CHART DATA VALIDATOR ON DEFAULT PROFILE ===");
const result = validateChartData(defaultProfileData);
console.log(`Validation Status: ${result.valid ? 'PASSED (Valid)' : 'FAILED (Errors Found)'}`);
console.log(`Errors Count: ${result.errors.length}`);
if (result.errors.length > 0) {
  console.log("Errors:", JSON.stringify(result.errors, null, 2));
} else {
  console.log("No contradictions or placeholder leaks detected in default profile data.");
}
console.log("Discovered Structures:", JSON.stringify(result.discovered, null, 2));
