package core.eventengine.kp

import core.eventengine.ingress.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.EnumMap

class KpMaritalEnginesTest {

    private lateinit var marriageEngine: KpMarriageEngine
    private lateinit var separationEngine: KpSeparationEngine
    private lateinit var divorceEngine: KpDivorceEngine
    private lateinit var mockMatrix: KpNatalSignificationMatrix
    private lateinit var mockDba: KpActivePeriodLords
    private lateinit var mockTransit: FreeRawTransitDataIngress

    @BeforeEach
    fun setUp() {
        marriageEngine = KpMarriageEngine()
        separationEngine = KpSeparationEngine()
        divorceEngine = KpDivorceEngine()

        // Configure strict KP Map variables
        mockMatrix = KpNatalSignificationMatrix(
            cuspSubLords = mapOf(7 to Planet.VENUS),
            planetarySignifications = mapOf(
                Planet.VENUS to setOf(2, 7, 11), // Strong marriage promise
                Planet.SATURN to setOf(6, 8, 12), // Destructive separation parameters
                Planet.MERCURY to setOf(1, 6, 10)
            ),
            natalRulingPlanets = setOf(Planet.VENUS, Planet.JUPITER)
        )

        mockDba = KpActivePeriodLords(Planet.JUPITER, Planet.VENUS, Planet.JUPITER, Planet.VENUS, Planet.VENUS)

        val stubLocation = GeoLocation(
            placeName = "Ujjain Obv",
            district = "Ujjain",
            state = "Madhya Pradesh",
            country = "India",
            postalCode = "456001",
            latitude = 23.1760,
            longitude = 75.7885,
            altitude = 511.0,
            timezoneId = "Asia/Kolkata",
            utcOffsetMinutes = 330,
            locationSource = LocationSource.BIRTH_PLACE
        )

        val longitudes = EnumMap<Planet, Double>(Planet::class.java).apply {
            put(Planet.SUN, 120.5)
            put(Planet.MOON, 45.2)
            put(Planet.MARS, 210.0)
            put(Planet.MERCURY, 115.1)
            put(Planet.JUPITER, 305.4)
            put(Planet.VENUS, 95.8)
            put(Planet.SATURN, 340.9)
            put(Planet.RAHU, 15.3)
            put(Planet.KETU, 195.3)
        }

        val speeds = EnumMap<Planet, Double>(Planet::class.java).apply {
            put(Planet.SUN, 0.98)
            put(Planet.MOON, 13.1)
            put(Planet.MARS, 0.52)
            put(Planet.MERCURY, 1.2)
            put(Planet.JUPITER, 0.08)
            put(Planet.VENUS, 1.15)
            put(Planet.SATURN, 0.03)
            put(Planet.RAHU, -0.05)
            put(Planet.KETU, -0.05)
        }

        val chartPoints = EnumMap<ChartPoint, Double>(ChartPoint::class.java).apply {
            put(ChartPoint.ASCENDANT, 52.1)
            put(ChartPoint.MIDHEAVEN, 142.1)
        }

        val cusps = HouseCusps(List(12) { i -> (i * 30.0 + 52.1) % 360.0 })

        mockTransit = FreeRawTransitDataIngress(
            transactionId = "TX-KP-PIPELINE",
            schemaVersion = "6.2",
            julianDay = 2461239.5,
            observationLocation = stubLocation,
            planetLongitudes = longitudes,
            planetSpeeds = speeds,
            chartPointLongitudes = chartPoints,
            houseCusps = cusps,
            houseSystem = HouseSystem.KP,
            ayanamsaType = AyanamsaType.KRISHNAMURTI,
            ayanamsaDegree = 24.23,
            origin = DataSourceOrigin.MOCK_STUB
        )
    }

    @Test
    fun marriageEngine_WhenAllTiersSatisfied_MustReturnActiveRunningStatus() {
        val result = marriageEngine.evaluate(mockMatrix, mockDba, mockTransit)
        assertTrue(result.isPromised)
        assertEquals(KpEventStatus.ACTIVE_WINDOW_RUNNING, result.finalStatus)
        assertEquals(92.0, result.natalPromiseStrength, 0.01)
    }

    @Test
    fun separationEngine_WhenDBASignifiesLitigationClusters_MustVerifyActiveState() {
        // Shift active timing periods to destructive Saturn dasha loop
        val litigationDba = KpActivePeriodLords(Planet.SATURN, Planet.SATURN, Planet.SATURN, Planet.SATURN, Planet.SATURN)
        // Update matrix to flag separation markers on the 7th CSL
        val conflictMatrix = mockMatrix.copy(cuspSubLords = mapOf(7 to Planet.SATURN))
        val result = separationEngine.evaluate(conflictMatrix, litigationDba, mockTransit)
        assertTrue(result.isPromised)
        assertTrue(result.isDbaRunning)
        assertEquals(KpEventStatus.ACTIVE_WINDOW_RUNNING, result.finalStatus)
    }
}
