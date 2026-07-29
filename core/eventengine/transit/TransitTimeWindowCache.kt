package core.eventengine.transit

import core.eventengine.ingress.FreeRawTransitDataIngress
import javax.inject.Singleton
import javax.inject.Inject

@Singleton
class TransitTimeWindowCache @Inject constructor() {
    private var cachedIngress: FreeRawTransitDataIngress? = null
    private var lastCachedEpochSecond: Long = 0L
    private val cacheValidityDurationSeconds = 3600L // Lock window to exactly 1 Hour

    fun isCacheExpired(currentUnixSeconds: Long): Boolean {
        if (cachedIngress == null) return true
        val delta = currentUnixSeconds - lastCachedEpochSecond
        return delta >= cacheValidityDurationSeconds
    }

    fun updateCache(ingress: FreeRawTransitDataIngress, currentUnixSeconds: Long) {
        this.cachedIngress = ingress
        this.lastCachedEpochSecond = currentUnixSeconds
    }

    fun getCachedPayload(): FreeRawTransitDataIngress? = cachedIngress

    fun evict() {
        cachedIngress = null
        lastCachedEpochSecond = 0L
    }
}
