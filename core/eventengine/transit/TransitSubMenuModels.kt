package core.eventengine.transit

import core.eventengine.ingress.FreeRawTransitDataIngress
import core.eventengine.ingress.Planet
import core.eventengine.ingress.ChartPoint

enum class TransitSubTab {
    CURRENT_GOCHARA,
    CURRENT_DASHA,
    CURRENT_TRANSITS,
    CURRENT_PANCHANGA,
    CURRENT_STRENGTHS,
    CURRENT_YOGAS,
    CURRENT_DOSHAS,
    CURRENT_ASPECTS,
    CURRENT_HOUSE_ACTIVATION,
    CURRENT_NAKSHATRA,
    CURRENT_SENSITIVE_POINTS,
    CURRENT_EVENTS,
    TRANSIT_TIMELINE
}

data class TransitTabResult(
    val targetTab: TransitSubTab,
    val calculationTimestamp: Long,
    val tokenPayload: Map<String, Double>,
    val activeIndicators: List<String>
)

data class ComprehensiveTransitPayload(
    val sourceTransactionId: String,
    val schemaVersion: String,
    val generatedTabResults: Map<TransitSubTab, TransitTabResult>
)

// Extension properties to seamlessly map FreeRawTransitDataIngress structure to Phase X expectations
val FreeRawTransitDataIngress.rawPlanetLongitudes: Map<Planet, Double>
    get() = this.planetLongitudes

val FreeRawTransitDataIngress.timestampUnix: Long
    get() = (this.julianDay * 86400).toLong()

val FreeRawTransitDataIngress.ascendantDegree: Double
    get() = this.chartPointLongitudes[ChartPoint.ASCENDANT] ?: 0.0

val FreeRawTransitDataIngress.rawHouseCusps: List<Double>
    get() = this.houseCusps.cusps
