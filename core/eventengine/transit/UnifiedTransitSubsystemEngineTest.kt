package core.eventengine.transit

import core.eventengine.ingress.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.EnumMap

class UnifiedTransitSubsystemEngineTest {

    private lateinit var aspectFactory: TransitAspectsFactory
    private lateinit var sensitiveFactory: SensitivePointsFactory
    private lateinit var houseFactory: HouseActivationFactory
    private lateinit var cacheBlocker: TransitTimeWindowCache
    private lateinit var engine: UnifiedTransitSubsystemEngine

    @Before
    fun setUp() {
        aspectFactory = TransitAspectsFactory()
        sensitiveFactory = SensitivePointsFactory()
        houseFactory = HouseActivationFactory()
        cacheBlocker = TransitTimeWindowCache()
        engine = UnifiedTransitSubsystemEngine(aspectFactory, sensitiveFactory, houseFactory, cacheBlocker)
    }

    private fun createMockIngress(julianDay: Double, transactionId: String = "tx-123"): FreeRawTransitDataIngress {
        val loc = GeoLocation(
            placeName = "New Delhi",
            district = null,
            state = "Delhi",
            country = "India",
            postalCode = null,
            latitude = 28.6139,
            longitude = 77.2090,
            altitude = 216.0,
            timezoneId = "Asia/Kolkata",
            utcOffsetMinutes = 330,
            locationSource = LocationSource.USER_SELECTED
        )

        val planetLongs = EnumMap<Planet, Double>(Planet::class.java).apply {
            Planet.values().forEach { put(it, 120.0) } // all at 120.0 degrees initially
            put(Planet.SUN, 10.0)
            put(Planet.MOON, 190.0) // 180 degrees diff from Sun -> aspect
            put(Planet.RAHU, 45.0)
        }

        val planetSpds = EnumMap<Planet, Double>(Planet::class.java).apply {
            Planet.values().forEach { put(it, 1.0) }
        }

        val chartPointLongs = EnumMap<ChartPoint, Double>(ChartPoint::class.java).apply {
            put(ChartPoint.ASCENDANT, 15.0)
            put(ChartPoint.MIDHEAVEN, 105.0)
        }

        val cuspsList = List(12) { (it * 30.0 + 15.0) % 360 } // equal 30 degree houses starting from Ascendant
        val houseCuspsObj = HouseCusps(cuspsList)

        return FreeRawTransitDataIngress(
            transactionId = transactionId,
            schemaVersion = "1.0",
            julianDay = julianDay,
            observationLocation = loc,
            planetLongitudes = planetLongs,
            planetSpeeds = planetSpds,
            chartPointLongitudes = chartPointLongs,
            houseCusps = houseCuspsObj,
            houseSystem = HouseSystem.WHOLE_SIGN,
            ayanamsaType = AyanamsaType.LAHIRI,
            ayanamsaDegree = 24.0,
            origin = DataSourceOrigin.MOCK_STUB
        )
    }

    @Test
    fun trafficBlockerCache_ShouldOnlyFetchFreshDataWhenHourWindowExpires() {
        val initialJulianDay = 2460000.0 // Some arbitrary julian day
        val initialIngress = createMockIngress(initialJulianDay, "initial-tx")
        
        var fetchCount = 0
        val fallbackFetch = {
            fetchCount++
            createMockIngress(initialJulianDay, "fresh-tx-$fetchCount")
        }

        // 1. First run when cache is empty. Cache will get populated.
        val payload1 = engine.processTransitPayload(initialIngress, forceFresh = false, fallbackFetch = fallbackFetch)
        assertEquals("initial-tx", payload1.sourceTransactionId)
        assertEquals(0, fetchCount) // Ingress was supplied directly, so fallback not called

        // 2. Second execution within the 3600-second window. Should hit cache and return cached ingress ("initial-tx").
        val sameTimeIngress = createMockIngress(initialJulianDay, "ignored-tx")
        val payload2 = engine.processTransitPayload(sameTimeIngress, forceFresh = false, fallbackFetch = fallbackFetch)
        assertEquals("initial-tx", payload2.sourceTransactionId) // Loaded from cache
        assertEquals(0, fetchCount)

        // 3. Increment julian day by slightly less than 1 hour (e.g. 0.04 Julian Days ≈ 57.6 minutes). Should still hit cache.
        val withinHourIngress = createMockIngress(initialJulianDay + 0.04, "ignored-tx-2")
        val payload3 = engine.processTransitPayload(withinHourIngress, forceFresh = false, fallbackFetch = fallbackFetch)
        assertEquals("initial-tx", payload3.sourceTransactionId)
        assertEquals(0, fetchCount)

        // 4. Expiration Performance: Increment julian day by slightly more than 1 hour (e.g. 0.042 Julian Days ≈ 60.5 minutes).
        // 0.042 * 86400 = 3628.8 seconds (which is > 3600 seconds)
        // Cache should be expired, calling fallbackFetch to load new data.
        val expiredIngress = createMockIngress(initialJulianDay + 0.042, "expired-tx")
        val payload4 = engine.processTransitPayload(expiredIngress, forceFresh = false, fallbackFetch = fallbackFetch)
        assertEquals("fresh-tx-1", payload4.sourceTransactionId) // Fallback fetch was invoked!
        assertEquals(1, fetchCount)
    }

    @Test
    fun completeTabRegistryValidation_ShouldPopulateAllThirteenTabs() {
        val ingress = createMockIngress(2460000.0)
        val payload = engine.processTransitPayload(ingress, forceFresh = true) { ingress }

        // Assert that all 13 sub-tab labels exist and map accurately
        assertEquals(13, payload.generatedTabResults.size)
        TransitSubTab.values().forEach { subTab ->
            val result = payload.generatedTabResults[subTab]
            assertNotNull("Tab result must be generated for $subTab", result)
            assertEquals(subTab, result!!.targetTab)
        }

        // Validate aspects calculations are run
        val aspectsTab = payload.generatedTabResults[TransitSubTab.CURRENT_ASPECTS]
        assertNotNull(aspectsTab)
        // Check that mutual aspect between SUN (10.0) and MOON (190.0) is detected (180 degrees distance)
        val hasMutualAspect = aspectsTab!!.activeIndicators.any { it.contains("MUTUAL_ASPECT") }
        assertTrue("Sun and Moon should form a mutual aspect in mock data", hasMutualAspect)

        // Validate sensitive points tab
        val sensitiveTab = payload.generatedTabResults[TransitSubTab.CURRENT_SENSITIVE_POINTS]
        assertNotNull(sensitiveTab)
        assertTrue(sensitiveTab!!.tokenPayload.containsKey("PART_OF_FORTUNE"))
        assertTrue(sensitiveTab.tokenPayload.containsKey("BHRIGU_BINDU"))

        // Validate house activations tab
        val houseTab = payload.generatedTabResults[TransitSubTab.CURRENT_HOUSE_ACTIVATION]
        assertNotNull(houseTab)
        assertTrue(houseTab!!.activeIndicators.isNotEmpty())
    }
}
