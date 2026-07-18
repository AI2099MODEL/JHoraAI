package core.eventengine.kp

import core.eventengine.ingress.Planet

enum class KpEventStatus {
    PROMISE_ABSENT_INACTIVE,
    PROMISED_BUT_DORMANT,
    ACTIVE_WINDOW_RUNNING,
    PEAK_TRIGGERED_MANIFESTING
}

data class KpEngineResult(
    val eventName: String,
    val isPromised: Boolean,
    val natalPromiseStrength: Double,
    val isDbaRunning: Boolean,
    val dashaActivationStrength: Double,
    val isTransitTriggered: Boolean,
    val systemConfidenceScore: Double,
    val finalStatus: KpEventStatus,
    val executionAuditTrace: List<String>
)

data class KpActivePeriodLords(
    val md: Planet,
    val ad: Planet,
    val pd: Planet,
    val sd: Planet,
    val prana: Planet
) {
    fun toList(): List<Planet> = listOf(md, ad, pd, sd, prana)
}

data class KpNatalSignificationMatrix(
    val cuspSubLords: Map<Int, Planet>,
    val planetarySignifications: Map<Planet, Set<Int>>,
    val natalRulingPlanets: Set<Planet>
)
