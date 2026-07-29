const { validateChartData, checkAgainstStoredReference } = require('./chart-data-validator.cjs');

// Golden baseline reference (stored from earlier correct ephemeris run)
const goldenBaseline = {
  birthDetails: { date: "1976-01-06", time: "18:40:00", location: "Dehradun, India" },
  planets: [
    { name: "Sun", sign: "Sagittarius", longitude: 262.5, motion: "DIRECT" },
    { name: "Moon", sign: "Aquarius", longitude: 312.2, motion: "DIRECT" },
    { name: "Mars", sign: "Taurus", longitude: 54.1, motion: "DIRECT" },
    { name: "Mercury", sign: "Capricorn", longitude: 278.4, motion: "DIRECT" },
    { name: "Jupiter", sign: "Pisces", longitude: 345.8, motion: "DIRECT" },
    { name: "Venus", sign: "Scorpio", longitude: 222.5, motion: "DIRECT" }, // Baseline Scorpio
    { name: "Saturn", sign: "Cancer", longitude: 108.6, motion: "DIRECT" }, // Baseline DIRECT
    { name: "Rahu", sign: "Scorpio", longitude: 215.0, motion: "RETROGRADE" },
    { name: "Ketu", sign: "Taurus", longitude: 35.0, motion: "RETROGRADE" }
  ],
  cusps: Array.from({ length: 12 }, (_, i) => ({ cusp: i + 1, longitude: i * 30 }))
};

// Current payload with the regression bugs reported by user:
// 1. Venus jumped to Capricorn (285.2°)
// 2. Saturn flipped to RETROGRADE
// 3. Rahu & Ketu missing
// 4. Cusps truncated to string "..."
const buggyPayload = {
  birthDetails: { date: "1976-01-06", time: "18:40:00", location: "Dehradun, India" },
  planets: [
    { name: "Sun", sign: "Sagittarius", longitude: 262.5, motion: "DIRECT" },
    { name: "Moon", sign: "Aquarius", longitude: 312.2, motion: "DIRECT" },
    { name: "Mars", sign: "Taurus", longitude: 54.1, motion: "DIRECT" },
    { name: "Mercury", sign: "Capricorn", longitude: 278.4, motion: "DIRECT" },
    { name: "Jupiter", sign: "Pisces", longitude: 345.8, motion: "DIRECT" },
    { name: "Venus", sign: "Capricorn", longitude: 285.2, motion: "DIRECT" }, // Bug: Scorpio -> Capricorn jump
    { name: "Saturn", sign: "Cancer", longitude: 108.6, motion: "RETROGRADE" } // Bug: Direct -> Retrograde flip
    // Missing Rahu & Ketu (Incompleteness)
  ],
  cusps: "..." // Bug: string instead of array
};

console.log("=== RUNNING ENHANCED CHART VALIDATOR & REGRESSION ENGINE ===");
const singleResult = validateChartData(buggyPayload);
console.log(`\n1. Single-Payload Validation (Leaks, Types, Completeness):`);
console.log(`   Valid: ${singleResult.valid}`);
console.log(`   Errors & Warnings Count: ${singleResult.errors.length}`);
singleResult.errors.forEach((e, idx) => {
  console.log(`   [${idx + 1}] (${e.code}) at ${e.path}: ${e.message}`);
});

console.log(`\n2. Cross-Session Regression Check (Against Stored Golden Baseline):`);
const regressionResult = checkAgainstStoredReference(buggyPayload, goldenBaseline);
console.log(`   Regression Check Passed: ${regressionResult.valid}`);
console.log(`   Regression Issues Found: ${regressionResult.errors.length}`);
regressionResult.errors.forEach((e, idx) => {
  console.log(`   [${idx + 1}] (${e.code}) at ${e.path}:\n       ${e.message}`);
});
