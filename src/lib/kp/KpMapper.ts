/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  KpChart, 
  KpCuspData, 
  KpStarLords, 
  KpSubLords, 
  KpSubSubLords, 
  KpPlanetSignificators, 
  KpHouseSignificators, 
  KpRulingPlanetsData, 
  KpDashaData, 
  KpTransitDetails, 
  KpHoraryDetails,
  KpCuspDetail,
  KpPlanetPosition
} from "./KpModels";

export class KpMapper {
  static toKpChart(raw: any, birthDate: string, birthTime: string, location: string): KpChart {
    const planets: KpPlanetPosition[] = (raw.planets || []).map((p: any) => ({
      name: p.name || p.planet || "Unknown",
      sign: p.sign || p.zodiac_sign || "Aries",
      degree: Number(p.degree || p.longitude || 0) % 30,
      house: Number(p.house || p.house_number || 1),
      starLord: p.star_lord || p.nakshatra_lord || "Unknown",
      subLord: p.sub_lord || "Unknown",
      subSubLord: p.sub_sub_lord || "Unknown",
      isRetrograde: !!(p.is_retrograde || p.retrograde || false)
    }));

    return {
      birthDate,
      birthTime,
      location,
      planets,
      ascendantDegree: Number(raw.ascendant_degree || 0),
      ascendantSign: raw.ascendant_sign || "Aries"
    };
  }

  static toKpCuspData(raw: any): KpCuspData {
    const cusps: KpCuspDetail[] = (raw.cusps || raw.houses || []).map((c: any) => ({
      houseNumber: Number(c.house_number || c.number || c.house || 1),
      longitude: Number(c.longitude || 0),
      degree: Number(c.degree || 0) % 30,
      sign: c.sign || c.zodiac_sign || "Aries",
      starLord: c.star_lord || c.nakshatra_lord || "Unknown",
      subLord: c.sub_lord || "Unknown",
      subSubLord: c.sub_sub_lord || "Unknown"
    }));

    return { cusps };
  }

  static toKpStarLords(raw: any): KpStarLords {
    return {
      planetStarLords: raw.planet_star_lords || raw.planets || {},
      cuspStarLords: raw.cusp_star_lords || raw.cusps || {}
    };
  }

  static toKpSubLords(raw: any): KpSubLords {
    return {
      planetSubLords: raw.planet_sub_lords || raw.planets || {},
      cuspSubLords: raw.cusp_sub_lords || raw.cusps || {}
    };
  }

  static toKpSubSubLords(raw: any): KpSubSubLords {
    return {
      planetSubSubLords: raw.planet_sub_sub_lords || raw.planets || {},
      cuspSubSubLords: raw.cusp_sub_sub_lords || raw.cusps || {}
    };
  }

  static toKpPlanetSignificators(raw: any): KpPlanetSignificators {
    const rawSig = raw.significators || raw.planet_significators || {};
    const significators: any = {};

    Object.keys(rawSig).forEach((planet) => {
      const pData = rawSig[planet] || {};
      significators[planet] = {
        level1: Array.isArray(pData.level1) ? pData.level1.map(Number) : [],
        level2: Array.isArray(pData.level2) ? pData.level2.map(Number) : [],
        level3: Array.isArray(pData.level3) ? pData.level3.map(Number) : [],
        level4: Array.isArray(pData.level4) ? pData.level4.map(Number) : []
      };
    });

    return { significators };
  }

  static toKpHouseSignificators(raw: any): KpHouseSignificators {
    const rawSig = raw.significators || raw.house_significators || {};
    const significators: any = {};

    Object.keys(rawSig).forEach((houseKey) => {
      const houseNum = Number(houseKey);
      const hData = rawSig[houseKey] || {};
      significators[houseNum] = {
        level1: Array.isArray(hData.level1) ? hData.level1.map(String) : [],
        level2: Array.isArray(hData.level2) ? hData.level2.map(String) : [],
        level3: Array.isArray(hData.level3) ? hData.level3.map(String) : [],
        level4: Array.isArray(hData.level4) ? hData.level4.map(String) : []
      };
    });

    return { significators };
  }

  static toKpRulingPlanetsData(raw: any): KpRulingPlanetsData {
    return {
      dayLord: raw.day_lord || "Unknown",
      moonSignLord: raw.moon_sign_lord || "Unknown",
      moonStarLord: raw.moon_star_lord || "Unknown",
      ascendantSignLord: raw.ascendant_sign_lord || "Unknown",
      ascendantStarLord: raw.ascendant_star_lord || "Unknown",
      calculationTime: raw.calculation_time || new Date().toISOString()
    };
  }

  static toKpDashaData(raw: any): KpDashaData {
    const list = Array.isArray(raw.dashas) ? raw.dashas : (raw.list || []);
    const dashas = list.map((item: any) => ({
      planet: item.planet || "Unknown",
      startTime: item.start_time || item.startTime || "",
      endTime: item.end_time || item.endTime || "",
      level: Number(item.level || 1),
      nested: Array.isArray(item.nested) ? item.nested.map((n: any) => ({
        planet: n.planet || "Unknown",
        startTime: n.start_time || n.startTime || "",
        endTime: n.end_time || n.endTime || "",
        level: Number(n.level || 2)
      })) : undefined
    }));

    return { dashas };
  }

  static toKpTransitDetails(raw: any, targetDate: string): KpTransitDetails {
    const planets = (raw.planets || []).map((p: any) => ({
      planet: p.planet || p.name || "Unknown",
      sign: p.sign || "Aries",
      degree: Number(p.degree || 0) % 30,
      starLord: p.star_lord || "Unknown",
      subLord: p.sub_lord || "Unknown"
    }));

    return {
      transitDate: raw.transit_date || targetDate,
      planets
    };
  }

  static toKpHoraryDetails(raw: any): KpHoraryDetails {
    const cusps = this.toKpCuspData(raw).cusps;
    const planets = (raw.planets || []).map((p: any) => ({
      name: p.name || p.planet || "Unknown",
      sign: p.sign || p.zodiac_sign || "Aries",
      degree: Number(p.degree || p.longitude || 0) % 30,
      house: Number(p.house || p.house_number || 1),
      starLord: p.star_lord || p.nakshatra_lord || "Unknown",
      subLord: p.sub_lord || "Unknown",
      subSubLord: p.sub_sub_lord || "Unknown",
      isRetrograde: !!(p.is_retrograde || false)
    }));

    return {
      number: Number(raw.number || raw.horary_number || 0),
      question: raw.question || "Unknown Question",
      cusps,
      planets,
      rulingPlanets: this.toKpRulingPlanetsData(raw.ruling_planets || {}),
      summary: raw.summary || "Horary calculations calculated successfully."
    };
  }
}
