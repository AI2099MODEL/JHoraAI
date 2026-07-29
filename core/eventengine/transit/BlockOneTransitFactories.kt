package core.eventengine.transit

import core.eventengine.ingress.FreeRawTransitDataIngress
import core.eventengine.ingress.Planet
import javax.inject.Inject

class TransitAspectsFactory @Inject constructor() {
    fun computeActiveAspects(ingress: FreeRawTransitDataIngress): TransitTabResult {
        val indicators = mutableListOf<String>()
        val pList = Planet.ALL.toList()

        for (i in pList.indices) {
            for (j in (i + 1) until pList.size) {
                val pA = pList[i]
                val pB = pList[j]
                val lonA = ingress.rawPlanetLongitudes[pA] ?: continue
                val lonB = ingress.rawPlanetLongitudes[pB] ?: continue
                
                val diff = Math.abs(lonA - lonB) % 360
                val angularDistance = if (diff > 180) 360 - diff else diff

                when {
                    angularDistance in 179.0..181.0 -> indicators.add("${pA.name}_${pB.name}_MUTUAL_ASPECT")
                    angularDistance in 89.0..91.0 -> indicators.add("${pA.name}_${pB.name}_SQUARE_CLASH")
                    angularDistance in 119.0..121.0 -> indicators.add("${pA.name}_${pB.name}_TRINE_SUPPORT")
                    angularDistance in 0.0..1.0 -> indicators.add("${pA.name}_${pB.name}_EXACT_CONJUNCTION")
                }
            }
        }

        return TransitTabResult(
            targetTab = TransitSubTab.CURRENT_ASPECTS,
            calculationTimestamp = ingress.timestampUnix,
            tokenPayload = emptyMap(),
            activeIndicators = indicators
        )
    }
}

class SensitivePointsFactory @Inject constructor() {
    fun computeSensitivePoints(ingress: FreeRawTransitDataIngress): TransitTabResult {
        val sunLon = ingress.rawPlanetLongitudes[Planet.SUN] ?: 0.0
        val moonLon = ingress.rawPlanetLongitudes[Planet.MOON] ?: 0.0
        val rahuLon = ingress.rawPlanetLongitudes[Planet.RAHU] ?: 0.0
        val asc = ingress.ascendantDegree

        val pOfFortune = (asc + moonLon - sunLon + 3600.0) % 360
        val bBindu = ((rahuLon + moonLon) / 2.0) % 360

        val payload = mapOf(
            "PART_OF_FORTUNE" to pOfFortune,
            "BHRIGU_BINDU" to bBindu,
            "GULIKA_CUSP" to (asc + 120.0) % 360,
            "MANDI_CUSP" to (asc + 240.0) % 360
        )

        return TransitTabResult(
            targetTab = TransitSubTab.CURRENT_SENSITIVE_POINTS,
            calculationTimestamp = ingress.timestampUnix,
            tokenPayload = payload,
            activeIndicators = listOf("SENSITIVE_COORDINATES_HYDRATED")
        )
    }
}

class HouseActivationFactory @Inject constructor() {
    fun computeHouseActivations(ingress: FreeRawTransitDataIngress): TransitTabResult {
        val activeIndicators = mutableListOf<String>()
        val cusps = ingress.rawHouseCusps.toList()

        Planet.ALL.forEach { planet ->
            val lon = ingress.rawPlanetLongitudes[planet] ?: return@forEach
            for (index in 0 until 12) {
                val start = cusps[index]
                val end = if (index == 11) cusps[0] else cusps[index + 1]
                
                val isInside = if (start < end) {
                    lon in start..end
                } else {
                    lon >= start || lon <= end
                }

                if (isInside) {
                    activeIndicators.add("${planet.name}_ACTIVATES_HOUSE_${index + 1}")
                    break
                }
            }
        }

        return TransitTabResult(
            targetTab = TransitSubTab.CURRENT_HOUSE_ACTIVATION,
            calculationTimestamp = ingress.timestampUnix,
            tokenPayload = emptyMap(),
            activeIndicators = activeIndicators
        )
    }
}
