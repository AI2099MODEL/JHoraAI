package core.eventengine.ingress

data class HouseCusps(
    val cusps: List<Double>
) {
    init {
        require(cusps.size == 12) { "House systems must define exactly 12 house cusps." }
        for (i in cusps.indices) {
            require(cusps[i] in 0.0..360.0) { "Cusp ${i + 1} longitude (${cusps[i]}) must be between 0.0 and 360.0 degrees." }
        }
    }

    operator fun get(index: Int): Double {
        require(index in 1..12) { "House index must be between 1 and 12." }
        return cusps[index - 1]
    }
}
