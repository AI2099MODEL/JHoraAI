package core.eventengine.ingress

enum class Planet {
    SUN,
    MOON,
    MARS,
    MERCURY,
    JUPITER,
    VENUS,
    SATURN,
    RAHU,
    KETU;

    companion object {
        val ALL = values()
    }
}
