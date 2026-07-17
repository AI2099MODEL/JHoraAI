package core.eventengine.ingress

import java.util.EnumMap

data class FreeRawTransitDataIngress(
    val transactionId: String,
    val schemaVersion: String,
    val julianDay: Double,
    val observationLocation: GeoLocation,
    val planetLongitudes: EnumMap<Planet, Double>,
    val planetSpeeds: EnumMap<Planet, Double>,
    val houseCusps: HouseCusps,
    val houseSystem: HouseSystem,
    val ayanamsaType: AyanamsaType,
    val ayanamsaDegree: Double,
    val origin: DataSourceOrigin
) {
    fun validate() {
        if (transactionId.isBlank()) {
            throw IngressContractViolationException("Transaction ID is missing or blank.")
        }
        if (schemaVersion.isBlank()) {
            throw IngressContractViolationException("Schema Version is missing or blank.")
        }
        if (julianDay <= 0.0) {
            throw IngressContractViolationException("Julian Day ($julianDay) must be positive.")
        }
        if (ayanamsaDegree < 0.0 || ayanamsaDegree >= 360.0) {
            throw IngressContractViolationException("Ayanamsa degree ($ayanamsaDegree) must be in range [0.0, 360.0).")
        }

        // Planet completeness: Check standard physical Vedic planets and key nodes
        val requiredPlanets = listOf(
            Planet.SUN, Planet.MOON, Planet.MARS, Planet.MERCURY, 
            Planet.JUPITER, Planet.VENUS, Planet.SATURN, Planet.RAHU, Planet.KETU
        )
        for (planet in requiredPlanets) {
            if (!planetLongitudes.containsKey(planet)) {
                throw IngressContractViolationException("Missing longitude entry for planet: $planet")
            }
            val longitude = planetLongitudes[planet] ?: throw IngressContractViolationException("Null longitude value for planet: $planet")
            if (longitude < 0.0 || longitude >= 360.0) {
                throw IngressContractViolationException("Invalid longitude ($longitude) for planet: $planet")
            }
            if (!planetSpeeds.containsKey(planet)) {
                throw IngressContractViolationException("Missing daily speed entry for planet: $planet")
            }
        }

        // Ascendant validation
        if (!planetLongitudes.containsKey(Planet.ASCENDANT)) {
            throw IngressContractViolationException("Missing longitude entry for Ascendant")
        }
        val ascendantLong = planetLongitudes[Planet.ASCENDANT] ?: throw IngressContractViolationException("Null Ascendant value")
        if (ascendantLong < 0.0 || ascendantLong >= 360.0) {
            throw IngressContractViolationException("Invalid Ascendant longitude ($ascendantLong)")
        }

        // MC validation
        if (!planetLongitudes.containsKey(Planet.MC)) {
            throw IngressContractViolationException("Missing longitude entry for Medium Coeli (MC)")
        }
        val mcLong = planetLongitudes[Planet.MC] ?: throw IngressContractViolationException("Null MC value")
        if (mcLong < 0.0 || mcLong >= 360.0) {
            throw IngressContractViolationException("Invalid MC longitude ($mcLong)")
        }
    }
}
