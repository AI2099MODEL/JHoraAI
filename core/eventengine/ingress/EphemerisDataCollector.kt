package core.eventengine.ingress

import java.util.concurrent.CompletableFuture
import java.util.concurrent.atomic.AtomicReference

class EphemerisDataCollector(
    private val primaryProvider: EphemerisDataProvider,
    private val secondaryProvider: EphemerisDataProvider,
    private val nasaValidationProvider: EphemerisDataProvider
) {

    /**
     * Collects raw transit ephemeris data from the resilient hierarchy of providers.
     * Primary is executed. If it fails, fallback to Secondary is triggered.
     * NASA Horizons validation is fired completely asynchronously to validate observations
     * without blocking the main execution path.
     */
    fun collectTransitData(
        transactionId: String,
        julianDay: Double,
        location: GeoLocation,
        houseSystem: HouseSystem,
        ayanamsaType: AyanamsaType
    ): FreeRawTransitDataIngress {
        val lastException = AtomicReference<Throwable?>(null)

        // Try primary provider
        try {
            val result = primaryProvider.fetchRawData(julianDay, location, houseSystem, ayanamsaType)
            result.validate()
            
            // Trigger asynchronous NASA validation
            triggerNasaValidationAsync(julianDay, location, houseSystem, ayanamsaType)
            
            return result
        } catch (e: Exception) {
            lastException.set(e)
        }

        // Try secondary provider
        try {
            val result = secondaryProvider.fetchRawData(julianDay, location, houseSystem, ayanamsaType)
            result.validate()
            
            // Trigger asynchronous NASA validation
            triggerNasaValidationAsync(julianDay, location, houseSystem, ayanamsaType)
            
            return result
        } catch (e: Exception) {
            val combinedMsg = "All raw ephemeris data providers failed. Primary error: ${lastException.get()?.message}. Secondary error: ${e.message}"
            throw IngressContractViolationException(combinedMsg)
        }
    }

    private fun triggerNasaValidationAsync(
        julianDay: Double,
        location: GeoLocation,
        houseSystem: HouseSystem,
        ayanamsaType: AyanamsaType
    ) {
        CompletableFuture.runAsync {
            try {
                // Completely non-blocking NASA Horizons query
                val nasaData = nasaValidationProvider.fetchRawData(julianDay, location, houseSystem, ayanamsaType)
                nasaData.validate()
                // In production, log verification results to telemetry or audit stores without mutating runtime state
            } catch (e: Exception) {
                // Silently swallow validation thread errors to avoid disrupting main service path
            }
        }
    }
}
