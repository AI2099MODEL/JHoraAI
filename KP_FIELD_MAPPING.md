# KP Field Mapping Specification (Phase 16)

This document details the transformation schemas applied by the `KpMapper` class to convert raw third-party JSON into structured, type-safe models in React. This decoupling prevents dependency on provider schemas.

## 1. KP Chart Mapping
* **Method**: `KpMapper.toKpChart(raw, birthDate, birthTime, location)`
* **Input fields mapped**:
  * `raw.planets` &rarr; mapped to `KpPlanetPosition[]`
  * `p.name` / `p.planet` &rarr; `name`
  * `p.sign` / `p.zodiac_sign` &rarr; `sign`
  * `p.degree` / `p.longitude` &rarr; `degree` (normalized to `% 30`)
  * `p.house` / `p.house_number` &rarr; `house`
  * `p.star_lord` / `p.nakshatra_lord` &rarr; `starLord`
  * `p.sub_lord` &rarr; `subLord`
  * `p.sub_sub_lord` &rarr; `subSubLord`
  * `p.is_retrograde` / `p.retrograde` &rarr; `isRetrograde`
  * `raw.ascendant_degree` &rarr; `ascendantDegree`
  * `raw.ascendant_sign` &rarr; `ascendantSign`

## 2. KP Cusp Mapping
* **Method**: `KpMapper.toKpCuspData(raw)`
* **Input fields mapped**:
  * `raw.cusps` / `raw.houses` &rarr; mapped to `KpCuspDetail[]`
  * `c.house_number` / `c.number` / `c.house` &rarr; `houseNumber`
  * `c.longitude` &rarr; `longitude`
  * `c.degree` &rarr; `degree` (normalized to `% 30`)
  * `c.sign` / `c.zodiac_sign` &rarr; `sign`
  * `c.star_lord` / `c.nakshatra_lord` &rarr; `starLord`
  * `c.sub_lord` &rarr; `subLord`
  * `c.sub_sub_lord` &rarr; `subSubLord`

## 3. Planet/House Significators
* **Methods**: `KpMapper.toKpPlanetSignificators(raw)`, `KpMapper.toKpHouseSignificators(raw)`
* **Schema**:
  * Level 1: Planet in star of occupant
  * Level 2: Planet in occupant
  * Level 3: Planet in star of owner
  * Level 4: Planet owner

## 4. KP Dashas
* **Method**: `KpMapper.toKpDashaData(raw)`
* **Structure**: Mapped from flat or hierarchical list arrays containing `planet`, `start_time` / `startTime`, `end_time` / `endTime`, and recursive `nested` arrays of level-2 periods.
