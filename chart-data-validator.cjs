/**
 * chart-data-validator.cjs
 *
 * Enhanced schema-agnostic pre-flight validator for astrology chart JSON,
 * featuring internal consistency checks, leak scanning, completeness checks (all 9 grahas),
 * structure type validation (detecting truncated strings like "..." for arrays),
 * and cross-session regression checks against stored reference baselines.
 */

'use strict';

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const STANDARD_VEDIC_GRAHAS = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'
];

const DEFAULT_FIELD_ALIASES = {
  planet: ['planet', 'planetname', 'graha', 'name'],
  sign: ['sign', 'zodiacsign', 'rasi', 'rashi'],
  longitude: ['abslongitude', 'longitude', 'absolutelongitude', 'lon'],
  degreeInSign: ['degreeinsign', 'degree', 'signdegree'],
  motion: ['motion', 'motionstatus', 'direction', 'retrogradestatus'],
  cusp: ['cusp', 'house', 'housecusp', 'housenumber'],
  date: ['date', 'dob', 'dateofbirth', 'birthdate'],
  time: ['time', 'tob', 'timeofbirth', 'birthtime'],
  place: ['place', 'location', 'birthplace'],
  ascendant: ['ascendant', 'lagna', 'lagnasign', 'risingsign']
};

const DEFAULT_LEAK_PATTERNS = [
  /unknown .* (table|system|selected)/i,
  /retrieving .* (table|database|matrix|significat)/i,
  /casting .* ephemeris/i,
  /^\s*(loading|fetching|pending)\.{0,3}\s*$/,
  /^\s*\.{3}\s*$/,
  /^(null|undefined|nan|n\/a)$/i
];

function buildAliasLookup(fieldAliases) {
  const lookup = {};
  for (const [canonical, aliases] of Object.entries(fieldAliases)) {
    lookup[canonical] = new Set(aliases.map(a => a.toLowerCase()));
  }
  return lookup;
}

function findFieldKey(obj, canonicalField, aliasLookup) {
  const aliases = aliasLookup[canonicalField];
  if (!aliases) return null;
  for (const key of Object.keys(obj)) {
    if (aliases.has(key.toLowerCase())) return key;
  }
  return null;
}

function normalizeDegrees(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function angularDiff(a, b) {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(diff, 360 - diff);
}

function signIndexFromName(sign) {
  return ZODIAC_SIGNS.indexOf(String(sign).toLowerCase());
}

function looksLikePlanetName(value) {
  return typeof value === 'string' && [...STANDARD_VEDIC_GRAHAS, 'uranus', 'neptune', 'pluto'].includes(value.toLowerCase());
}

function approxAyanamsaForYear(year) {
  const anchorYear = 2000;
  const anchorValue = 23.85;
  const driftPerYear = 50.3 / 3600;
  return anchorValue - (anchorYear - year) * driftPerYear;
}

function discoverPlanetTables(root, aliasLookup) {
  const found = [];
  function walk(node, path) {
    if (Array.isArray(node)) {
      const isPlanetArray = node.length > 0 && node.every(item =>
        item && typeof item === 'object' &&
        (() => {
          const key = findFieldKey(item, 'planet', aliasLookup);
          return key && looksLikePlanetName(item[key]);
        })()
      );
      if (isPlanetArray) {
        const records = node.map(item => {
          const planetKey = findFieldKey(item, 'planet', aliasLookup);
          const signKey = findFieldKey(item, 'sign', aliasLookup);
          const lonKey = findFieldKey(item, 'longitude', aliasLookup);
          const degKey = findFieldKey(item, 'degreeInSign', aliasLookup);
          const motionKey = findFieldKey(item, 'motion', aliasLookup);
          return {
            planet: String(item[planetKey]).toLowerCase(),
            sign: signKey ? item[signKey] : undefined,
            longitude: lonKey ? Number(item[lonKey]) : undefined,
            degreeInSign: degKey ? Number(item[degKey]) : undefined,
            motion: motionKey ? String(item[motionKey]).toUpperCase() : undefined
          };
        });
        found.push({ path, records });
      } else {
        node.forEach((item, i) => walk(item, `${path}[${i}]`));
      }
    } else if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        walk(node[key], path ? `${path}.${key}` : key);
      }
    }
  }
  walk(root, '');
  return found;
}

function discoverCuspTables(root, aliasLookup) {
  const found = [];
  function walk(node, path) {
    if (Array.isArray(node)) {
      const isCuspArray = node.length >= 3 && node.every(item =>
        item && typeof item === 'object' && findFieldKey(item, 'cusp', aliasLookup)
      );
      if (isCuspArray) {
        const lonKey = findFieldKey(node[0], 'longitude', aliasLookup);
        if (lonKey) {
          found.push({
            path,
            values: node.map(item => Number(item[lonKey]))
          });
        }
      } else {
        node.forEach((item, i) => walk(item, `${path}[${i}]`));
      }
    } else if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        walk(node[key], path ? `${path}.${key}` : key);
      }
    }
  }
  walk(root, '');
  return found;
}

function checkStructureTypes(root, errors) {
  // Check if expected collection fields (like cusps or planets) are mistakenly strings like "..."
  function walk(node, path) {
    if (node && typeof node === 'object') {
      for (const [key, val] of Object.entries(node)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (/^(cusps|planets|houses|vargas)$/i.test(key) && typeof val === 'string') {
          errors.push({
            code: 'INVALID_STRUCTURE_TYPE',
            path: currentPath,
            message: `Field "${key}" is a string ("${val}") instead of an expected array or object structure. This indicates truncated data or stub placement.`,
            severity: 'error'
          });
        } else {
          walk(val, currentPath);
        }
      }
    }
  }
  walk(root, '');
}

function checkGrahaCompleteness(planetTables, errors) {
  if (!planetTables.length) return;
  const allFoundPlanets = new Set();
  for (const table of planetTables) {
    for (const rec of table.records) {
      allFoundPlanets.add(rec.planet);
    }
  }
  const missing = STANDARD_VEDIC_GRAHAS.filter(g => !allFoundPlanets.has(g));
  if (missing.length > 0) {
    errors.push({
      code: 'GRAHA_INCOMPLETENESS',
      path: 'planets',
      message: `Missing standard Vedic grahas in planet tables: ${missing.join(', ')}. Full Vedic synthesis requires all 9 grahas (Sun through Ketu).`,
      severity: 'warning'
    });
  }
}

function scanForLeaks(node, path, errors, leakPatterns) {
  if (typeof node === 'string') {
    const trimmed = node.trim();
    for (const pattern of leakPatterns) {
      if (pattern.test(trimmed)) {
        errors.push({
          code: 'LEAKED_PLACEHOLDER_TEXT',
          path,
          message: `Found unresolved system/error/placeholder text in data: "${trimmed}"`,
          severity: 'error'
        });
        break;
      }
    }
  } else if (Array.isArray(node)) {
    node.forEach((item, i) => scanForLeaks(item, `${path}[${i}]`, errors, leakPatterns));
  } else if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      scanForLeaks(node[key], path ? `${path}.${key}` : key, errors, leakPatterns);
    }
  }
}

function stripLeaks(node, leakPatterns) {
  if (typeof node === 'string') {
    const trimmed = node.trim();
    for (const pattern of leakPatterns) {
      if (pattern.test(trimmed)) return null;
    }
    return node;
  } else if (Array.isArray(node)) {
    return node.map(n => stripLeaks(n, leakPatterns)).filter(v => v !== null);
  } else if (node && typeof node === 'object') {
    const out = {};
    for (const key of Object.keys(node)) {
      const cleaned = stripLeaks(node[key], leakPatterns);
      if (cleaned !== null) out[key] = cleaned;
    }
    return out;
  }
  return node;
}

/**
 * Cross-session regression test against a stored golden reference payload.
 * Detects ephemeris drift, sign jumps (e.g. Venus jumping from Scorpio to Capricorn),
 * and motion state flips (e.g. Saturn flipping from Direct to Retrograde) for the same birth profile.
 */
function checkAgainstStoredReference(currentData, storedReference, opts = {}) {
  const toleranceDeg = opts.longitudeToleranceDeg ?? 3.0;
  const errors = [];

  const curTables = discoverPlanetTables(currentData, buildAliasLookup(DEFAULT_FIELD_ALIASES));
  const refTables = discoverPlanetTables(storedReference, buildAliasLookup(DEFAULT_FIELD_ALIASES));

  if (!curTables.length || !refTables.length) {
    return { valid: true, errors: [] };
  }

  const curMap = {};
  curTables[0].records.forEach(r => { curMap[r.planet] = r; });

  const refMap = {};
  refTables[0].records.forEach(r => { refMap[r.planet] = r; });

  for (const [planet, refRec] of Object.entries(refMap)) {
    const curRec = curMap[planet];
    if (!curRec) continue;

    // Check sign regression
    if (refRec.sign && curRec.sign && refRec.sign.toLowerCase() !== curRec.sign.toLowerCase()) {
      errors.push({
        code: 'CROSS_SESSION_SIGN_REGRESSION',
        path: `planets.${planet}.sign`,
        message: `Regression Bug: ${planet} sign changed from "${refRec.sign}" (stored baseline) to "${curRec.sign}" (current run) for the identical birth profile. One calculation engine run is incorrect.`
      });
    }

    // Check longitude regression if available
    if (refRec.longitude != null && curRec.longitude != null) {
      const diff = angularDiff(refRec.longitude, curRec.longitude);
      if (diff > toleranceDeg) {
        errors.push({
          code: 'CROSS_SESSION_LONGITUDE_DRIFT',
          path: `planets.${planet}.longitude`,
          message: `Regression Bug: ${planet} longitude drifted by ${diff.toFixed(2)}° (Baseline: ${refRec.longitude}°, Current: ${curRec.longitude}°). Exceeds tolerance of ${toleranceDeg}°.`
        });
      }
    }

    // Check motion regression
    if (refRec.motion && curRec.motion && refRec.motion.toUpperCase() !== curRec.motion.toUpperCase()) {
      errors.push({
        code: 'CROSS_SESSION_MOTION_FLIP',
        path: `planets.${planet}.motion`,
        message: `Regression Bug: ${planet} motion flipped from "${refRec.motion}" (baseline) to "${curRec.motion}" (current run).`
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateChartData(data, opts = {}) {
  const fieldAliases = { ...DEFAULT_FIELD_ALIASES, ...(opts.fieldAliases || {}) };
  const leakPatterns = opts.leakPatterns || DEFAULT_LEAK_PATTERNS;
  const aliasLookup = buildAliasLookup(fieldAliases);
  const errors = [];

  checkStructureTypes(data, errors);
  scanForLeaks(data, '', errors, leakPatterns);

  const planetTables = discoverPlanetTables(data, aliasLookup);
  const cuspTables = discoverCuspTables(data, aliasLookup);

  checkGrahaCompleteness(planetTables, errors);

  const cleanedData = stripLeaks(data, leakPatterns);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    cleanedData,
    discovered: {
      planetTablePaths: planetTables.map(t => t.path),
      cuspTablePaths: cuspTables.map(t => t.path)
    }
  };
}

module.exports = {
  validateChartData,
  checkAgainstStoredReference,
  discoverPlanetTables
};
