# JHora AI Local Derivation Report

This report outlines all astrological parameters that are calculated locally in the client runtime or backend gateway using **SOURCE_B** logic. It presents the precise mathematical formulas, the structural code functions, and the technical or astrological necessity for each local calculation.

---

## 1. Lagna Absolute Coordinates
* **File Path**: `/src/lib/jhoraMapper.ts`
* **Function**: `mapJHoraResponseToAstrologyData()`
* **Formula**:
  $$\text{Sign Index} = \text{ZodiacSigns.indexOf}(\text{Ascendant.sign})$$
  $$\text{Lagna Longitude} = (\text{Sign Index} \times 30^\circ) + \text{Ascendant.degree}$$
* **Astrological Necessity**: JHora API returns coordinates split by zodiac sign bounding boxes (e.g., `Aries 14.3°`). To draw the native's positions on a continuous $360^\circ$ circular or square chart, the coordinate space must be mapped to a unified float representation.

---

## 2. Natal House Placements (Relative Coordinate Shift)
* **File Path**: `/src/lib/jhoraMapper.ts`
* **Function**: `mapJHoraResponseToAstrologyData()`
* **Formula**:
  $$\text{House Number} = ((\text{Planet Sign Index} - \text{Lagna Sign Index} + 12) \bmod 12) + 1$$
* **Astrological Necessity**: A planet's sign position is absolute (e.g., Mars in Taurus), but its house placement (1st to 12th) is entirely subjective, dependent on the rising sign (Lagna) at birth. Shifting this on the client ensures fast, responsive UI renders without bloating the API response with pre-calculated house arrays.

---

## 3. Human-Friendly Shadbala Strength Bars
* **File Path**: `/src/lib/jhoraMapper.ts`
* **Function**: `mapJHoraResponseToAstrologyData()`
* **Formula**:
  $$\text{Strength Percentage} = \text{Math.round}(\text{strengthRatio} \times 100)$$
  *Where $\text{strengthRatio}$ is the raw coefficient parsed from row index 8 of the `horoscope.shad_bala` table.*
* **Technical Necessity**: Shadbala strengths are traditionally expressed in abstract "Shashtiamsas" (e.g., 340 units) and compared against a required threshold. To make this intuitive, we represent it as a percentage relative to the required baseline ($100\%$ indicates meeting exactly the required strength).

---

## 4. Secondary Panchanga Koota Classifications
* **File Path**: `/src/lib/jhoraMapper.ts`
* **Function**: `mapJHoraResponseToAstrologyData()`
* **Formulas**:
  $$\text{Varna} = \text{varnas}[\text{Moon Sign Index} \bmod 4]$$
  $$\text{Vashya} = \text{vashyas}[\text{Moon Sign Index} \bmod 5]$$
  $$\text{Yoni} = \text{yonis}[\text{Moon Sign Index} \bmod 14]$$
  $$\text{Gana} = \text{ganas}[\text{Moon Nakshatra Index} \bmod 3]$$
  $$\text{Nadi} = \text{nadis}[\text{Moon Nakshatra Index} \bmod 3]$$
* **Astrological Necessity**: The main horoscope API returns raw celestial positions but does not include these secondary Nakshatra-based classifications in its default calendar node. Deriving them locally based on classical Parashari modular indexing tables saves round-trip network latency.

---

## 5. Shani Sade Sati Active Phase Detection
* **File Path**: `/src/lib/jhoraMapper.ts`
* **Function**: `mapJHoraResponseToAstrologyData()`
* **Formula**:
  $$\text{Saturn-Moon Distance} = ((\text{Saturn Sign Index} - \text{Moon Sign Index} + 12) \bmod 12)$$
  *Where:*
  *   $\text{Distance} = 11 \implies \text{Rising Phase (1st Phase; Saturn in 12th from Moon)}$
  *   $\text{Distance} = 0 \implies \text{Peak Phase (2nd Phase; Saturn conjunct Moon)}$
  *   $\text{Distance} = 1 \implies \text{Setting Phase (3rd Phase; Saturn in 2nd from Moon)}$
  *   $\text{Other Distances} \implies \text{Sade Sati Inactive}$
* **Astrological Necessity**: Sade Sati represents the $7\frac{1}{2}$ year transit of Saturn over the Moon's sign, the sign preceding it, and the sign following it. While the backend lists general Sade Sati presence, identifying the exact sub-phase on the client allows the interface to render granular warnings and phase timelines.

---

## 6. Primary and Secondary Argala (Interventions)
* **File Path**: `/src/lib/jhoraMapper.ts`
* **Function**: `calculateArgalas()`
* **Formula**:
  Loops through houses 1 to 12. For each house, evaluates the occupant planets in relative offsets:
  *   Primary Argala: House + 2 (blocked by Virodha in House + 12)
  *   Primary Argala: House + 4 (blocked by Virodha in House + 10)
  *   Primary Argala: House + 11 (blocked by Virodha in House + 3)
  *   Secondary Argala: House + 5 (blocked by Virodha in House + 9)
  *   *If Argala planets exist and Virodha planets are absent, the Argala is unobstructed. If both exist, it is obstructed.*
* **Technical Necessity**: Pre-calculating all possible combinations of Argalas (and their obstructions) across 12 houses on the server would create an unnecessarily verbose payload. Running this deterministic loop on the client from the mapped rasi chart keeps payloads compact.

---

## 7. Ashtakoota Milan (36-Point Compatibility Calculator)
* **File Path**: `/src/lib/astrology.ts`
* **Function**: `calculateCompatibility()`
* **Formulas & Sub-engines**:
  Checks 8 key dimensions of Groom vs Bride Moon positions:
  1.  **Varna (1 Pt)**: Duty alignment. Groom caste rank must be $\ge$ Bride caste rank.
  2.  **Vashya (2 Pts)**: Magnetic control pull. Checks species classification match.
  3.  **Tara (3 Pts)**: Destiny/Birth star harmony. Distance checks: $((\text{Nak}_2 - \text{Nak}_1) \bmod 9)$. Must not yield dangerous remainders (1, 3, 5, 7).
  4.  **Yoni (4 Pts)**: Sexual/Physical compatibility. Uses a static $14 \times 14$ animal affinity matrix (evaluating Friendly, Neutral, Enemy, Hostile pairs).
  5.  **Graha Maitri (5 Pts)**: Mental harmony. Checks friendship level of Groom Moon sign lord vs Bride Moon sign lord in a relational grid.
  6.  **Gana (6 Pts)**: Temperament. Compares Deva (Divine), Manushya (Human), and Rakshasa (Demonic) types. Identifies conflicts.
  7.  **Bhakoot (7 Pts)**: Emotional linkage. Verifies relative house distance. Penalizes configurations of 2/12, 6/8, or 5/9 relationships.
  8.  **Nadi (8 Pts)**: Physiological alignment. Groom and Bride must belong to different Nadis (Adi, Madhya, or Antya). If identical, points = 0 (Nadi Dosha).
* **Technical Necessity**: Having this logic entirely local allows instantaneous, interactive, slider-based or select-based matchmaking exploration in the UI without stressing external APIs for minor micro-adjustments.

---

## 8. Gochara (Transit) Houses
* **File Path**: `/server.ts`
* **Endpoint Handler**: `/api/jhora/gochara`
* **Formula**:
  $$\text{Relative House} = ((\text{Transit Planet Sign Index} - \text{Birth Lagna Sign Index} + 12) \bmod 12) + 1$$
* **Technical Necessity**: Allows the server to fetch a standard, raw planetary coordinate list for the *transit target date* from PyJHora, and then map those planets' houses relative to the native's natal birth Lagna to render a customized dual-circle transit overlay chart.
