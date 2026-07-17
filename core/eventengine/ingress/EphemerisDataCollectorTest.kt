package core.eventengine.ingress

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.EnumMap

class EphemerisDataCollectorTest {

    private val stubLocation = GeoLocation(
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

    private fun createStubData(
        origin: DataSourceOrigin, 
        ayanamsaDegree: Double = 24.1
    ): FreeRawTransitDataIngress {
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

        return FreeRawTransitDataIngress(
            transactionId = "TX-2026-07-17",
            schemaVersion = "1.0",
            julianDay = 2461234.5,
            observationLocation = stubLocation,
            planetLongitudes = longitudes,
            planetSpeeds = speeds,
            chartPointLongitudes = chartPoints,
            houseCusps = cusps,
            houseSystem = HouseSystem.PLACIDUS,
            ayanamsaType = AyanamsaType.KRISHNAMURTI,
            ayanamsaDegree = ayanamsaDegree,
            origin = origin
        )
    }

    class StubProvider(
        private val result: FreeRawTransitDataIngress?,
        private val shouldFail: Boolean = false
    ) : EphemerisDataProvider {
        override fun fetchRawData(
            julianDay: Double,
            location: GeoLocation,
            houseSystem: HouseSystem,
            ayanamsaType: AyanamsaType
        ): FreeRawTransitDataIngress {
            if (shouldFail || result == null) {
                throw RuntimeException("Network/API Connection Timeout")
            }
            return result
        }
    }

    @Test
    fun testSuccessfulPrimaryCollection() {
        val primaryStub = createStubData(DataSourceOrigin.EMBEDDED_SWISS_EPHEMERIS)
        val secondaryStub = createStubData(DataSourceOrigin.BACKUP_SWISS_EPHEMERIS_API)
        val nasaStub = createStubData(DataSourceOrigin.NASA_HORIZONS_VALIDATION)

        val collector = EphemerisDataCollector(
            primaryProvider = StubProvider(primaryStub),
            secondaryProvider = StubProvider(secondaryStub),
            nasaValidationProvider = StubProvider(nasaStub)
        )

        val response = collector.collectTransitData(
            transactionId = "TX-2026-07-17",
            julianDay = 2461234.5,
            location = stubLocation,
            houseSystem = HouseSystem.PLACIDUS,
            ayanamsaType = AyanamsaType.KRISHNAMURTI
        )

        assertNotNull(response)
        assertEquals(DataSourceOrigin.EMBEDDED_SWISS_EPHEMERIS, response.origin)
        assertEquals("TX-2026-07-17", response.transactionId)
    }

    @Test
    fun testSuccessfulSecondaryFallbackCollection() {
        val secondaryStub = createStubData(DataSourceOrigin.BACKUP_SWISS_EPHEMERIS_API)
        val nasaStub = createStubData(DataSourceOrigin.NASA_HORIZONS_VALIDATION)

        val collector = EphemerisDataCollector(
            primaryProvider = StubProvider(null, shouldFail = true),
            secondaryProvider = StubProvider(secondaryStub),
            nasaValidationProvider = StubProvider(nasaStub)
        )

        val response = collector.collectTransitData(
            transactionId = "TX-2026-07-17",
            julianDay = 2461234.5,
            location = stubLocation,
            houseSystem = HouseSystem.PLACIDUS,
            ayanamsaType = AyanamsaType.KRISHNAMURTI
        )

        assertNotNull(response)
        assertEquals(DataSourceOrigin.BACKUP_SWISS_EPHEMERIS_API, response.origin)
    }

    @Test
    fun testAllProvidersFailThrowsContractViolation() {
        val nasaStub = createStubData(DataSourceOrigin.NASA_HORIZONS_VALIDATION)

        val collector = EphemerisDataCollector(
            primaryProvider = StubProvider(null, shouldFail = true),
            secondaryProvider = StubProvider(null, shouldFail = true),
            nasaValidationProvider = StubProvider(nasaStub)
        )

        assertThrows(IngressContractViolationException::class.java) {
            collector.collectTransitData(
                transactionId = "TX-2026-07-17",
                julianDay = 2461234.5,
                location = stubLocation,
                houseSystem = HouseSystem.PLACIDUS,
                ayanamsaType = AyanamsaType.KRISHNAMURTI
            )
        }
    }

    @Test
    fun testInvalidAyanamsaThrowsExceptionOnValidation() {
        val invalidStub = createStubData(DataSourceOrigin.EMBEDDED_SWISS_EPHEMERIS, ayanamsaDegree = -5.0)

        assertThrows(IngressContractViolationException::class.java) {
            invalidStub.validate()
        }
    }
}
