/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  WesternChartDetails, 
  WesternCompatibility, 
  WesternPlanetPosition, 
  WesternCuspPosition, 
  WesternAspectDetails 
} from "./WesternModels";

export class WesternMapper {
  static toWesternChart(raw: any, birthDate: string, birthTime: string, location: string): WesternChartDetails {
    // Gracefully handle nested structure or extract arrays
    const rawPlanets = raw.planets || raw.planet_positions || [];
    const planets: WesternPlanetPosition[] = rawPlanets.map((p: any) => {
      const sign = p.sign || p.zodiac_sign || "Aries";
      return {
        name: p.name || p.planet || "Unknown",
        sign,
        degree: Number(p.degree || p.longitude || 0) % 30,
        house: Number(p.house || p.house_number || 1),
        isRetrograde: !!(p.is_retrograde || p.retrograde || false),
        element: p.element || WesternMapper.getElementBySign(sign),
        modality: p.modality || WesternMapper.getModalityBySign(sign)
      };
    });

    const rawCusps = raw.cusps || raw.houses || [];
    const cusps: WesternCuspPosition[] = rawCusps.map((c: any) => ({
      number: Number(c.number || c.house_number || c.house || 1),
      sign: c.sign || c.zodiac_sign || "Aries",
      degree: Number(c.degree || 0) % 30
    }));

    const rawAspects = raw.aspects || [];
    const aspects: WesternAspectDetails[] = rawAspects.map((a: any) => ({
      planet1: a.planet1 || a.first_planet || "Unknown",
      planet2: a.planet2 || a.second_planet || "Unknown",
      type: a.type || a.aspect_name || "Conjunction",
      angle: Number(a.angle || 0),
      orb: Number(a.orb || 0)
    }));

    return {
      planets,
      cusps,
      aspects,
      metadata: {
        birthDate,
        birthTime,
        location
      }
    };
  }

  static toWesternCompatibility(raw: any): WesternCompatibility {
    const rawAspects = raw.aspects || raw.synastry_aspects || [];
    const aspects: WesternAspectDetails[] = rawAspects.map((a: any) => ({
      planet1: a.planet1 || "Unknown",
      planet2: a.planet2 || "Unknown",
      type: a.type || "Conjunction",
      angle: Number(a.angle || 0),
      orb: Number(a.orb || 0)
    }));

    return {
      compatibilityScore: Number(raw.compatibility_score || raw.score || 75),
      aspects,
      summary: raw.summary || "Satisfactory general compatibility with balanced aspects."
    };
  }

  static getElementBySign(sign: string): string {
    const fire = ["Aries", "Leo", "Sagittarius"];
    const earth = ["Taurus", "Virgo", "Capricorn"];
    const air = ["Gemini", "Libra", "Aquarius"];
    const water = ["Cancer", "Scorpio", "Pisces"];

    if (fire.includes(sign)) return "Fire";
    if (earth.includes(sign)) return "Earth";
    if (air.includes(sign)) return "Air";
    if (water.includes(sign)) return "Water";
    return "Unknown";
  }

  static getModalityBySign(sign: string): string {
    const cardinal = ["Aries", "Cancer", "Libra", "Capricorn"];
    const fixed = ["Taurus", "Leo", "Scorpio", "Aquarius"];
    const mutable = ["Gemini", "Virgo", "Sagittarius", "Pisces"];

    if (cardinal.includes(sign)) return "Cardinal";
    if (fixed.includes(sign)) return "Fixed";
    if (mutable.includes(sign)) return "Mutable";
    return "Unknown";
  }
}
