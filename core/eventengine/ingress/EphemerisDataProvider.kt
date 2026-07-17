package core.eventengine.ingress

interface EphemerisDataProvider {
    fun fetchRawData(
        julianDay: Double,
        location: GeoLocation,
        houseSystem: HouseSystem,
        ayanamsaType: AyanamsaType
    ): FreeRawTransitDataIngress
}
