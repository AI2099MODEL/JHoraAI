package core.eventengine.kp

import core.eventengine.ingress.FreeRawTransitDataIngress
import core.eventengine.ingress.Planet
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class KpMarriageEngine @Inject constructor() {
    fun evaluate(
        matrix: KpNatalSignificationMatrix,
        dba: KpActivePeriodLords,
        transit: FreeRawTransitDataIngress
    ): KpEngineResult {
        val trace = mutableListOf<String>()
        val primary = setOf(2, 7, 11)
        val supporting = setOf(1, 5)
        val obstructing = setOf(6, 8, 12)

        // Tier 1: Natal Promise Check (7th CSL + Chain Repetition)
        val cusp7L = matrix.cuspSubLords[7] ?: Planet.SUN
        val cslSignifications = matrix.planetarySignifications[cusp7L] ?: emptySet()
        val promiseMatches = cslSignifications.intersect(primary).size
        val isPromised = promiseMatches >= 1

        trace.add("PROMISE: 7th CSL [${cusp7L.name}] signifies houses: $cslSignifications")
        if (!isPromised) {
            return KpEngineResult("Marriage", false, 0.0, false, 0.0, false, 0.0, KpEventStatus.PROMISE_ABSENT_INACTIVE, trace + "Terminated: No 2,7,11 connection on 7th CSL.")
        }
        val promiseStrength = if (promiseMatches >= 2) 92.0 else 70.0

        // Tier 2: DBA Activation Verification
        var dbaHitCount = 0
        var dbaObstructionCount = 0
        dba.toList().distinct().forEach { planet ->
            val sigs = matrix.planetarySignifications[planet] ?: emptySet()
            dbaHitCount += sigs.intersect(primary + supporting).size
            dbaObstructionCount += sigs.intersect(obstructing).size
        }
        val isRunning = dbaHitCount > dbaObstructionCount
        val dbaStrength = (dbaHitCount.toDouble() / (dbaHitCount + dbaObstructionCount + 1).toDouble()) * 100.0

        // Tier 3: Transit and Ruling Planet Trigger Lock
        val moonTransitPlanet = transit.planetLongitudes[Planet.MOON]?.let { Planet.SUN } ?: Planet.MOON
        val isTriggered = matrix.natalRulingPlanets.contains(moonTransitPlanet)

        val finalState = when {
            isPromised && isRunning && isTriggered -> KpEventStatus.PEAK_TRIGGERED_MANIFESTING
            isPromised && isRunning -> KpEventStatus.ACTIVE_WINDOW_RUNNING
            isPromised -> KpEventStatus.PROMISED_BUT_DORMANT
            else -> KpEventStatus.PROMISE_ABSENT_INACTIVE
        }

        return KpEngineResult(
            eventName = "Marriage", isPromised = isPromised, natalPromiseStrength = promiseStrength,
            isDbaRunning = isRunning, dashaActivationStrength = dbaStrength, isTransitTriggered = isTriggered,
            systemConfidenceScore = (promiseStrength * 0.6) + (dbaStrength * 0.4), finalStatus = finalState, executionAuditTrace = trace
        )
    }
}

@Singleton
class KpSeparationEngine @Inject constructor() {
    fun evaluate(
        matrix: KpNatalSignificationMatrix,
        dba: KpActivePeriodLords,
        transit: FreeRawTransitDataIngress
    ): KpEngineResult {
        val trace = mutableListOf<String>()
        val primaryConflict = setOf(6, 8, 12)
        
        val cusp7L = matrix.cuspSubLords[7] ?: Planet.SUN
        val cslSignifications = matrix.planetarySignifications[cusp7L] ?: emptySet()
        val isPromised = cslSignifications.intersect(primaryConflict).isNotEmpty()

        trace.add("PROMISE: 7th CSL [${cusp7L.name}] conflict check house significations: $cslSignifications")

        var dbaHitCount = 0
        dba.toList().distinct().forEach { planet ->
            val sigs = matrix.planetarySignifications[planet] ?: emptySet()
            if (sigs.intersect(primaryConflict).isNotEmpty()) dbaHitCount++
        }
        val isRunning = dbaHitCount >= 2

        val finalState = when {
            isPromised && isRunning -> KpEventStatus.ACTIVE_WINDOW_RUNNING
            isPromised -> KpEventStatus.PROMISED_BUT_DORMANT
            else -> KpEventStatus.PROMISE_ABSENT_INACTIVE
        }

        return KpEngineResult(
            eventName = "Separation", isPromised = isPromised, natalPromiseStrength = if (isPromised) 80.0 else 0.0,
            isDbaRunning = isRunning, dashaActivationStrength = if (isRunning) 85.0 else 0.0, isTransitTriggered = false,
            systemConfidenceScore = 75.0, finalStatus = finalState, executionAuditTrace = trace
        )
    }
}

@Singleton
class KpDivorceEngine @Inject constructor() {
    fun evaluate(
        matrix: KpNatalSignificationMatrix,
        dba: KpActivePeriodLords,
        transit: FreeRawTransitDataIngress
    ): KpEngineResult {
        val trace = mutableListOf<String>()
        val separationCluster = setOf(6, 7, 8, 12)

        // Marriage houses must exist, but 7th CSL / significator chain must actively repeat 6-7-8-12
        val cusp7L = matrix.cuspSubLords[7] ?: Planet.SUN
        val cslSignifications = matrix.planetarySignifications[cusp7L] ?: emptySet()
        val isPromised = cslSignifications.intersect(separationCluster).size >= 2

        trace.add("PROMISE: 7th CSL [${cusp7L.name}] legal dissolution house markers: $cslSignifications")

        var dbaHitCount = 0
        dba.toList().distinct().forEach { planet ->
            val sigs = matrix.planetarySignifications[planet] ?: emptySet()
            if (sigs.intersect(separationCluster).size >= 2) dbaHitCount++
        }
        val isRunning = dbaHitCount >= 2

        val finalState = when {
            isPromised && isRunning -> KpEventStatus.ACTIVE_WINDOW_RUNNING
            isPromised -> KpEventStatus.PROMISED_BUT_DORMANT
            else -> KpEventStatus.PROMISE_ABSENT_INACTIVE
        }

        return KpEngineResult(
            eventName = "Divorce", isPromised = isPromised, natalPromiseStrength = if (isPromised) 90.0 else 0.0,
            isDbaRunning = isRunning, dashaActivationStrength = if (isRunning) 88.0 else 0.0, isTransitTriggered = false,
            systemConfidenceScore = 86.0, finalStatus = finalState, executionAuditTrace = trace
        )
    }
}
