# Local Derivation Report: SOURCE_B Calculations
**Date:** July 15, 2026
**Subject:** Full technical audit of locally calculated fields, mathematical formulas, and business logic.

---

## 1. Introduction
This report provides a granular, developer-level breakdown of all **SOURCE_B** fields displayed in the **JHoraAI** application. A field is classified as **SOURCE_B** when its value is calculated locally on our client or server systems using high-precision astronomical baseline parameters retrieved from the official JHora REST API (**SOURCE_A**).

Each entry below documents the exact file location, class/interface container, method/function signature, mathematical formula, and a thorough architectural justification explaining why local calculation is necessary.

---

## 2. Exhaustive List of Locally Calculated Parameters (SOURCE_B)

### 1. Lagna (Ascendant) Longitude (0-360°)
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const ascSignIndex = ZODIAC_SIGNS.indexOf(asc.sign);
  const longitude = ascSignIndex * 30 + asc.longitude;
  ```
* **Why Necessary**: The official JHora API returns sign-relative degrees (e.g. `24.10°` in `Cancer`). To render visual astrological charts (where the entire 360° celestial circle is drawn) or calculate precise angular aspects (conjunctions, oppositions, trines) between planets, we must map this sign-relative value to an absolute coordinate on the 360-degree ecliptic circle.

---

### 2. Planet Longitudes (0-360°) *(Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)*
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const pSignIdx = ZODIAC_SIGNS.indexOf(pData.sign);
  const longitude = pSignIdx * 30 + pData.longitude;
  ```
* **Why Necessary**: Similar to the Ascendant, planetary positions in the raw payload are sign-bound. Converting these into absolute 360-degree coordinates allows our visual SVG chart and aspect engines to map planetary spacing with exact angular relationships.

---

### 3. Planet Houses relative to Ascendant
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const pHouse = (pSignIdx - ascSignIndex + 12) % 12 + 1;
  ```
* **Why Necessary**: Houses (Bhavas) in the Equal House system are counted from the Ascendant (Lagna) sign. The JHora API returns raw planetary signs but does not explicitly structure house placements for all planets in a structured layout. Computing this index locally enables grouping planets into house tables and interpreting their life-domain influences (e.g., Saturn in the 2nd House).

---

### 4. D1 Rasi Chart Placements *(House Groupings)*
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const rasiChart: { [house: number]: string[] } = {};
  for (let hIndex = 1; hIndex <= 12; hIndex++) rasiChart[hIndex] = [];
  planets.forEach((p) => {
    rasiChart[p.house].push(p.name);
  });
  ```
* **Why Necessary**: The D1 Rasi chart is a grid displaying which planets occupy which houses (1 to 12). By aggregating the calculated planet houses into local arrays, we build a clean data structure that the North/South Indian SVG chart renderers can instantly draw without additional heavy traversal.

---

### 5. D9 Navamsa Chart Placements *(House Groupings)*
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const d9Chart = h.divisional_charts?.["D-9_navamsa"] || {};
  const d9Asc = d9Chart["Ascendant"] || { sign: "Aries", longitude: 0 };
  const d9AscSignIdx = ZODIAC_SIGNS.indexOf(d9Asc.sign);

  planetNames.forEach((pName) => {
    const pD9 = d9Chart[pName];
    if (pD9) {
      const pD9SignIdx = ZODIAC_SIGNS.indexOf(pD9.sign);
      const pD9House = (pD9SignIdx - d9AscSignIdx + 12) % 12 + 1;
      navamsaChart[pD9House].push(pName);
    }
  });
  ```
* **Why Necessary**: While the raw API provides the sign position of planets in the D9 Navamsa divisional chart, it does not structure them by relative house from the Navamsa Ascendant. This local coordinate translation is necessary to build the D9 chart wheel and tables.

---

### 6. Shadbala Strength Percentage
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const strength = parsedShadBala[pName] ? Math.round(parsedShadBala[pName].strengthRatio * 100) : 60;
  ```
* **Why Necessary**: The raw JHora API returns Shadbala metrics as floating-point ratios (e.g. `1.15`, where `1.0` represents standard required strength). For an average user, reading a strength ratio is confusing; multiplying it by 100 and rounding it to a percentage offers an intuitive visual metric for progress bars and gauges.

---

### 7. Bhava Bala House Strength parsing
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const nums = (bStr.match(/[\d.]+/g) || []).map(Number);
  const strength = nums[0] || 400; // Extraction of numerical digits
  ```
* **Why Necessary**: The JHora API returns Bhava Bala strengths as compound text strings (e.g., `483.56 (1.21)` representing points + ratio). To build numerical bar charts (using Recharts) or perform programmatic strength comparisons, we must parse and extract the raw float values using regular expressions.

---

### 8. Bhava Bala House Rank
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  bhavaBala[houseKey] = {
    strengthShashtiamsas: strength,
    rank: idx + 1 // Sequential sorting and rank designation
  };
  ```
* **Why Necessary**: Standard JHora outputs do not rank houses by their strength out-of-the-box in a sorted data array. Assigning relative rankings allows the UI to display clear "Strongest House" and "Weakest House" badges on the dashboard.

---

### 9. Panchanga Varna
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const varnas = ["Kshatriya", "Vaishya", "Shudra", "Brahmin"];
  const varnaName = varnas[moon_position.signIndex % 4];
  ```
* **Why Necessary**: Varna classification is used to understand the temperament of the native based on the Moon's placement. Because the JHora calendar info does not include this sub-characteristic in its standard payload, we calculate it dynamically from the high-precision Moon sign index.

---

### 10. Panchanga Vashya
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const vashyas = ["Chatushpada", "Keeta", "Manushya", "Jalachar", "Vanchara"];
  const vashyaName = vashyas[moon_position.signIndex % 5];
  ```
* **Why Necessary**: This represents the elemental classification of the Moon sign for compatibility matching. Since it is missing from the calendar info payload, we derive it locally using the Moon sign modulus.

---

### 11. Panchanga Yoni
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const yonis = ["Ashwa", "Gaja", "Mesh", "Sarpa", "Shwan", "Marjar", "Mushak", "Gau", "Mahish", "Vyaghra", "Simha", "Vanar", "Nakula", "Mruga"];
  const yoniName = yonis[moon_position.signIndex % 14];
  ```
* **Why Necessary**: Animal archetype (Yoni) is crucial for mental and biological compatibility. We map it locally from the Moon sign index to enrich the Panchanga overview cards.

---

### 12. Panchanga Gana
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const ganas = ["Deva", "Manushya", "Rakshasa"];
  const ganaName = ganas[moonNakIdx % 3];
  ```
* **Why Necessary**: Gana (temperament group: Divine, Human, or Demonic) is calculated from the Moon's Nakshatra index. We derive it locally to complete the Ashtakoota personality traits on the dashboard.

---

### 13. Panchanga Nadi
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const nadis = ["Adi", "Madhya", "Antya"];
  const nadiName = nadis[moonNakIdx % 3];
  ```
* **Why Necessary**: Nadi represents physiological constitution (Vata, Pitta, Kapha equivalents). Since it is missing from the basic calendar API response, we compute it locally using the Moon Nakshatra index.

---

### 14. Vimshottari Antardasha (Minor Periods)
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `parseJHoraDasha(rawList: Array<[string, string]>)`
* **Exact Formula**: 
  ```typescript
  const parts = path.split("-");
  const m = parts[0]; // Mahadasha
  const a = parts[1] || parts[0]; // Antardasha
  const p = parts[2] || parts[1] || parts[0]; // Pratyantardasha
  ```
* **Why Necessary**: The raw dasha lists returned by the API are flat arrays of paths (e.g. `["Sun-Sun-Sun", "1995-10-15 08:30:00"]`). To render a modern, hierarchical tree/accordion UI where users can expand Mahadashas to explore Antardashas and Pratyantardashas, we must programmatically parse the path strings and structure them into nested JSON nodes.

---

### 15. Manglik Dosha sanitization & scoring
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const isManglik = !rawDoshas["Manglik Dosha"]?.includes("no Manglik");
  const explanation = (rawDoshas["Manglik Dosha"] || "").replace(/<[^>]*>/g, "").trim();
  const score = isManglik ? 70 : 0;
  ```
* **Why Necessary**: The JHora API returns Manglik Dosha analysis as a block of text containing raw HTML formatting. We sanitize the text locally by stripping HTML tags via regular expressions and assign a standardized, visual score (70/0) to feed our circular dashboard gauges.

---

### 16. Kaal Sarp Dosha sanitization
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const isKalaSarpa = !rawDoshas["Kala Sarpa Dosha"]?.includes("no Kala Sarpa");
  const explanation = (rawDoshas["Kala Sarpa Dosha"] || "").replace(/<[^>]*>/g, "").trim();
  ```
* **Why Necessary**: Strips HTML markup from the JHora response, providing clean, plain text for presentation inside the "Doshas" UI widget.

---

### 17. Sade Sati Dosha Presence
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const saturn = planets.find(p => p.name === "Saturn");
  const moon = planets.find(p => p.name === "Moon");
  const satMoonDiff = saturn && moon ? (saturn.signIndex - moon.signIndex + 12) % 12 : -1;
  const isSadeSati = [11, 0, 1].includes(satMoonDiff);
  ```
* **Why Necessary**: Sade Sati occurs when Saturn transits the 12th, 1st, or 2nd house relative to the natal Moon. Calculating this angular relationship locally provides immediate verification of Sade Sati presence, independent of simple string matches.

---

### 18. Sade Sati Dosha Stage
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  let sadeSatiStage = "None";
  if (satMoonDiff === 11) sadeSatiStage = "Rising (First) Phase";
  else if (satMoonDiff === 0) sadeSatiStage = "Peak (Second) Phase";
  else if (satMoonDiff === 1) sadeSatiStage = "Setting (Third) Phase";
  ```
* **Why Necessary**: The JHora API indicates Sade Sati presence but does not specify the active phase. Computing the house difference locally lets us pinpoint the active phase (Rising, Peak, or Setting) to guide users through their Saturn transit periods.

---

### 19. Sade Sati Custom Explanations
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const sadeSatiExplanation = isSadeSati
    ? `Saturn is in ${saturn?.sign}, which is in the ${sadeSatiStage} relative to your Moon sign (${moon?.sign}).`
    : `Shani Sade Sati is currently inactive. Saturn is in ${saturn?.sign}, which is ${satMoonDiff} houses away from your Moon in ${moon?.sign}.`;
  ```
* **Why Necessary**: Generates highly descriptive, personalized, and astronomically grounded sentences that explain *why* Sade Sati is active or inactive, which is highly appreciated by users exploring their charts.

---

### 20. Arudha Padhas Parsing
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const parts = (val || "").split(" ");
  const sign = parts[0] || "Aries";
  const houseNum = parseInt(parts[1]) || 1;
  ```
* **Why Necessary**: Arudha Padhas represent the reflection/illusion of houses. The API returns these positions as simple space-separated strings (e.g., `Scorpio 5`). Splitting and typing this data into sign and house properties allows us to highlight these points on our SVG chart graphics.

---

### 21. Sphutas Absolute Longitude
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const longitude = ZODIAC_SIGNS.indexOf(sign) * 30 + degree;
  ```
* **Why Necessary**: Maps specialized calculations (like Hora Lagna or Pranapada) from sign-relative degrees to 360-degree absolute coordinates for astronomical mapping.

---

### 22. Upagrahas Absolute Longitude
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const longitude = ZODIAC_SIGNS.indexOf(sign) * 30 + degree;
  ```
* **Why Necessary**: Maps shadow planet calculations (like Gulika or Mandi) into 360-degree coordinates for charting and aspect checks.

---

### 23. Sahams Coordinate Conversion
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `mapJHoraResponseToAstrologyData(d: any)`
* **Exact Formula**: 
  ```typescript
  const parts = sVal.trim().split(/\s+/);
  const sign = parts[0];
  const degVal = parseInt(parts[1]);
  const minVal = parseInt(parts[2]);
  const secVal = parseInt(parts[3]);
  const degree = degVal + minVal / 60 + secVal / 3600;
  const longitude = ZODIAC_SIGNS.indexOf(sign) * 30 + degree;
  ```
* **Why Necessary**: Sahams (sensitive Arabic points used in Tajik astrology) are returned as degrees, minutes, and seconds. Converting these base-60 sexagesimal values into floating-point degrees and absolute longitudes is necessary for layout formatting and rendering.

---

### 24. Terrestrial Argalas Calculation
* **File Location**: `src/lib/jhoraMapper.ts`
* **Container Function**: `calculateArgalas(rasiChart: { [house: number]: string[] })`
* **Exact Formula**: 
  Iterates through all 12 houses. For each house:
  * Argala positions: 2nd, 4th, 11th (Primary) and 5th (Secondary) houses.
  * Virodha (obstruction) positions: 12th, 10th, 3rd (Primary) and 9th (Secondary) houses.
  * Obstruction Check: `isObstructed = virodhaPlanets.length > 0`.
* **Why Necessary**: Argala (planetary intervention) is a core Parashari interpretive system. Since the JHora REST API does not calculate Argalas, we run a server-side algorithm on the D1 chart planet placements to compute this advanced diagnostic matrix.

---

### 25. Gochara (Transit) Planet Houses
* **File Location**: `server.ts`
* **Container Endpoint**: `POST /api/jhora/gochara`
* **Exact Formula**: 
  ```typescript
  const house = (signIdx - ascSignIdx + 12) % 12 + 1;
  ```
* **Why Necessary**: When transits are computed for a future target date, the planets occupy new absolute sign indexes. To map how these transits affect the native, we must calculate which natal house each transiting planet is crossing relative to their birth Ascendant sign index.
