/**
 * chart-data-validator.cjs
 *
 * Generic, schema-agnostic pre-flight validator for astrology chart JSON,
 * meant to run BEFORE the data is handed to an LLM (Gemini or otherwise)
 * for report generation.
 */

'use strict';

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const KNOWN_PLANET_NAMES = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
  'rahu', 'ketu', 'uranus', 'neptune', 'pluto'
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
  /^\s*(loading|fetching|pending)\.{0,3}\s*$/i,
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
  return typeof value === 'string' && KNOWN_PLANET_NAMES.includes(value.toLowerCase());
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

function discoverSummaryMaps(root) {
  const found = [];
  function walk(node, path) {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      const keys = Object.keys(node);
      const isSummaryMap = keys.length > 0 && keys.every(k =>
        KNOWN_PLANET_NAMES.includes(k.toLowerCase()) &&
        typeof node[k] === 'string' &&
        ZODIAC_SIGNS.includes(node[k].toLowerCase())
      );
      if (isSummaryMap) {
        found.push({ path, map: node });
      } else {
        for (const key of keys) walk(node[key], path ? `${path}.${key}` : key);
      }
    } else if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
    }
  }
  walk(root, '');
  return found;
}

function discoverBirthRecordBlocks(root, aliasLookup) {
  const found = [];
  function walk(node, path) {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      const dateKey = findFieldKey(node, 'date', aliasLookup);
      const timeKey = findFieldKey(node, 'time', aliasLookup);
      if (dateKey && timeKey) {
        found.push({
          path,
          date: node[dateKey],
          time: node[timeKey],
          place: (() => { const k = findFieldKey(node, 'place', aliasLookup); return k ? node[k] : undefined; })(),
          ascendant: (() => { const k = findFieldKey(node, 'ascendant', aliasLookup); return k ? node[k] : undefined; })()
        });
      }
      for (const key of Object.keys(node)) walk(node[key], path ? `${path}.${key}` : key);
    } else if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
    }
  }
  walk(root, '');
  return found;
}

function scanForLeaks(node, path, errors, leakPatterns) {
  if (typeof node === 'string') {
    const trimmed = node.trim();
    for (const pattern of leakPatterns) {
      if (pattern.test(trimmed)) {
        errors.push({
          code: 'LEAKED_PLACEHOLDER_TEXT',
          path,
          message: `Found unresolved system/error text in data: "${trimmed}"`,
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

function checkMotionConsistencyAcrossTables(planetTables, errors) {
  const tablesWithMotion = planetTables.filter(t => t.records.some(r => r.motion));
  if (tablesWithMotion.length < 2) return;
  const byPlanet = {};
  for (const table of tablesWithMotion) {
    for (const rec of table.records) {
      if (!rec.motion) continue;
      byPlanet[rec.planet] = byPlanet[rec.planet] || [];
      byPlanet[rec.planet].push({ source: table.path, motion: rec.motion });
    }
  }
  for (const [planet, entries] of Object.entries(byPlanet)) {
    const distinct = [...new Set(entries.map(e => e.motion))];
    if (distinct.length > 1) {
      const detail = entries.map(e => `"${e.motion}" in ${e.source || '(root)'}`).join(' vs ');
      errors.push({
        code: 'MOTION_STATUS_MISMATCH',
        path: `planet:${planet}`,
        message: `${planet} has conflicting motion status across tables: ${detail}.`,
        severity: 'error'
      });
    }
  }
}

function checkTropicalSiderealAlignment(planetTables, birthYear, errors, opts) {
  const toleranceDeg = opts.toleranceDeg ?? 2.0;
  const tropicalTables = planetTables.filter(t => /tropical|western/i.test(t.path));
  const siderealTables = planetTables.filter(t => /sidereal|vedic|rasi|natal/i.test(t.path));
  if (!tropicalTables.length || !siderealTables.length) return;
  const ayanamsa = approxAyanamsaForYear(birthYear);
  const siderealMap = {};
  for (const table of siderealTables) {
    for (const rec of table.records) {
      if (rec.longitude != null && !Number.isNaN(rec.longitude)) {
        siderealMap[rec.planet] = rec.longitude;
      }
    }
  }
  for (const table of tropicalTables) {
    for (const rec of table.records) {
      const sidLon = siderealMap[rec.planet];
      if (sidLon == null) continue;
      let tropLon = rec.longitude;
      if (tropLon == null && rec.sign != null && rec.degreeInSign != null) {
        const sIdx = signIndexFromName(rec.sign);
        if (sIdx === -1) continue;
        tropLon = sIdx * 30 + rec.degreeInSign;
      }
      if (tropLon == null || Number.isNaN(tropLon)) continue;
      const expected = normalizeDegrees(sidLon + ayanamsa);
      const diff = angularDiff(tropLon, expected);
      if (diff > toleranceDeg) {
        errors.push({
          code: 'TROPICAL_SIDEREAL_MISMATCH',
          path: `${table.path}:${rec.planet}`,
          message: `${rec.planet}: tropical longitude ${tropLon.toFixed(2)}° does not align with sidereal + ayanamsa (≈${expected.toFixed(2)}°).`,
          severity: 'error'
        });
      }
    }
  }
}

function checkDistinctHouseCusps(cuspTables, errors) {
  for (const table of cuspTables) {
    const allIdentical = table.values.every(v => Math.abs(v - table.values[0]) < 0.01);
    if (allIdentical) {
      errors.push({
        code: 'DUPLICATE_HOUSE_CUSPS',
        path: table.path,
        message: `All house cusps report the same value (${table.values[0]}°).`,
        severity: 'error'
      });
    }
  }
}

function checkSummaryMapsAgainstPlanetTables(summaryMaps, planetTables, errors) {
  if (!summaryMaps.length || !planetTables.length) return;
  const reference = [...planetTables].sort((a, b) =>
    b.records.filter(r => r.sign).length - a.records.filter(r => r.sign).length
  )[0];
  const refMap = {};
  for (const rec of reference.records) {
    if (rec.sign) refMap[rec.planet] = String(rec.sign).toLowerCase();
  }
  for (const summary of summaryMaps) {
    for (const [planet, sign] of Object.entries(summary.map)) {
      const refSign = refMap[planet.toLowerCase()];
      if (refSign && refSign !== sign.toLowerCase()) {
        errors.push({
          code: 'SUMMARY_MAP_MISMATCH',
          path: `${summary.path}.${planet}`,
          message: `Summary shows ${planet} in ${sign}, but table has ${refMap[planet.toLowerCase()]}.`,
          severity: 'error'
        });
      }
    }
  }
}

function checkBirthRecordBlocksAgree(birthBlocks, errors) {
  if (birthBlocks.length < 2) return;
  const first = birthBlocks[0];
  for (const block of birthBlocks.slice(1)) {
    const mismatches = [];
    for (const field of ['date', 'time', 'place', 'ascendant']) {
      if (first[field] && block[field] && String(first[field]) !== String(block[field])) {
        mismatches.push(`${field}: "${first[field]}" vs "${block[field]}"`);
      }
    }
    if (mismatches.length) {
      errors.push({
        code: 'BIRTH_RECORD_MISMATCH',
        path: `${first.path} vs ${block.path}`,
        message: `Conflicting birth details: ${mismatches.join('; ')}`,
        severity: 'error'
      });
    }
  }
}

function validateChartData(data, opts = {}) {
  const fieldAliases = { ...DEFAULT_FIELD_ALIASES, ...(opts.fieldAliases || {}) };
  const leakPatterns = opts.leakPatterns || DEFAULT_LEAK_PATTERNS;
  const aliasLookup = buildAliasLookup(fieldAliases);
  const errors = [];

  scanForLeaks(data, '', errors, leakPatterns);

  const planetTables = discoverPlanetTables(data, aliasLookup);
  const cuspTables = discoverCuspTables(data, aliasLookup);
  const summaryMaps = discoverSummaryMaps(data);
  const birthBlocks = discoverBirthRecordBlocks(data, aliasLookup);

  checkMotionConsistencyAcrossTables(planetTables, errors);
  checkDistinctHouseCusps(cuspTables, errors);
  checkSummaryMapsAgainstPlanetTables(summaryMaps, planetTables, errors);
  checkBirthRecordBlocksAgree(birthBlocks, errors);

  const birthYear = opts.birthYear ||
    (birthBlocks[0]?.date ? new Date(birthBlocks[0].date).getFullYear() : 2000);
  checkTropicalSiderealAlignment(planetTables, birthYear, errors, opts);

  const cleanedData = stripLeaks(data, leakPatterns);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
    cleanedData,
    discovered: {
      planetTablePaths: planetTables.map(t => t.path),
      cuspTablePaths: cuspTables.map(t => t.path),
      summaryMapPaths: summaryMaps.map(t => t.path),
      birthRecordPaths: birthBlocks.map(t => t.path)
    }
  };
}

module.exports = { validateChartData };
