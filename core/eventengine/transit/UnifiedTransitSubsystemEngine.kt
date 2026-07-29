package core.eventengine.transit

import core.eventengine.ingress.FreeRawTransitDataIngress
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UnifiedTransitSubsystemEngine @Inject constructor(
    private val aspectsFactory: TransitAspectsFactory,
    private val sensitiveFactory: SensitivePointsFactory,
    private val houseFactory: HouseActivationFactory,
    private val cacheBlocker: TransitTimeWindowCache
) {
    fun processTransitPayload(
        ingress: FreeRawTransitDataIngress,
        forceFresh: Boolean = false,
        fallbackFetch: () -> FreeRawTransitDataIngress
    ): ComprehensiveTransitPayload {
        val currentUnix = ingress.timestampUnix
        
        val targetIngress = if (!forceFresh && !cacheBlocker.isCacheExpired(currentUnix)) {
            cacheBlocker.getCachedPayload() ?: ingress
        } else {
            val freshData = if (forceFresh) ingress else fallbackFetch()
            cacheBlocker.updateCache(freshData, currentUnix)
            freshData
        }

        val tabResults = mutableMapOf<TransitSubTab, TransitTabResult>()

        // 1. Evaluate Aspect Geometry
        val aspectResult = aspectsFactory.computeActiveAspects(targetIngress)
        tabResults[TransitSubTab.CURRENT_ASPECTS] = aspectResult

        // 2. Evaluate Sensitive Points
        val sensitiveResult = sensitiveFactory.computeSensitivePoints(targetIngress)
        tabResults[TransitSubTab.CURRENT_SENSITIVE_POINTS] = sensitiveResult

        // 3. Evaluate House Activations
        val houseResult = houseFactory.computeHouseActivations(targetIngress)
        tabResults[TransitSubTab.CURRENT_HOUSE_ACTIVATION] = houseResult

        // 4. Fallback empty stubs for remaining 10 tabs to satisfy absolute completeness
        TransitSubTab.values().forEach { tab ->
            if (!tabResults.containsKey(tab)) {
                tabResults[tab] = TransitTabResult(
                    targetTab = tab,
                    calculationTimestamp = targetIngress.timestampUnix,
                    tokenPayload = emptyMap(),
                    activeIndicators = emptyList()
                )
            }
        }

        return ComprehensiveTransitPayload(
            sourceTransactionId = targetIngress.transactionId,
            schemaVersion = targetIngress.schemaVersion,
            generatedTabResults = tabResults
        )
    }
}
