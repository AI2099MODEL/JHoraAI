package core.eventengine.ingress
/**
 * Pure Data Transfer Object (DTO) enforcing the Level -1 Data Contract.
 * Fed exclusively by free, open-access endpoints. Houses no logic calculations.
 */
data class FreeRawTransitDataIngress(
    val transactionId: String,
    val timestampUnix: Long,
    val rawPlanetLongitudes: Map<String, Double>,
    val rawPlanetDailySpeeds: Map<String, Double>,
    val rawHouseCusps: List<Double>,
    val systemAyanamsaDegree: Double
) {
    fun isContractValid(): Boolean {
        return rawPlanetLongitudes.isNotEmpty() && 
               rawHouseCusps.size == 12 && 
               systemAyanamsaDegree > 0.0
    }
}
