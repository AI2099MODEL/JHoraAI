package core.eventengine.jaimini

import java.time.Instant

/**
 * Representation of a planet in the natal horoscope.
 *
 * @property id The standard identifier for the planet:
 *   0: Sun, 1: Moon, 2: Mars, 3: Mercury, 4: Jupiter, 5: Venus, 6: Saturn, 7: Rahu, 8: Ketu.
 * @property longitude The total longitudinal position in degrees (0.0 to 360.0).
 * @property sign The zodiac sign index occupied by the planet (0 to 11, where 0 is Aries, 11 is Pisces).
 * @property degreeInSign The specific longitudinal degree within the occupied sign (0.0 to 30.0).
 */
data class Planet(
    val id: Int,
    val longitude: Double,
    val sign: Int,
    val degreeInSign: Double
)

/**
 * Representation of the full natal horoscope chart details.
 *
 * @property ascSign The Ascendant/Lagna sign index (0 to 11, where 0 is Aries, 11 is Pisces).
 * @property planets List of planetary positions inside the chart.
 */
data class Horoscope(
    val ascSign: Int,
    val planets: List<Planet>
)

/**
 * Represents an individual dasha node (period) in the hierarchical Jaimini Chara Dasha tree.
 *
 * @property sign The zodiac sign index associated with this dasha period (0 to 11).
 * @property startDate The starting date and time of this dasha period.
 * @property endDate The ending date and time of this dasha period.
 * @property durationInYears The duration of this dasha period in years.
 * @property level The nesting level of this dasha period:
 *   1: Mahadasha (MD), 2: Antardasha (AD), 3: Pratyantardasha (PD), 4: Sookshmadasha (SD), 5: Pranadasha (PR).
 */
class DashaPeriod(
    val sign: Int,
    val startDate: Instant,
    val endDate: Instant,
    val durationInYears: Double,
    val level: Int
) {
    /** The parent dasha period, or null if this is a Mahadasha. */
    var parent: DashaPeriod? = null
        internal set

    /** The list of sub-periods nested within this dasha period. */
    var children: List<DashaPeriod> = emptyList()
        internal set

    override fun toString(): String {
        return "DashaPeriod(level=$level, sign=$sign, start=$startDate, end=$endDate, years=$durationInYears, childrenCount=${children.size})"
    }
}

/**
 * Enumeration of supported calendar systems for calculating dasha durations.
 */
enum class CalendarSystem {
    /** Standard Gregorian year with 365.2425 days. */
    GREGORIAN_365_2425,
    /** Traditional Savana year with exactly 360 days (each month having exactly 30 days). */
    SAVANA_360,
    /** Solar year with 365.24219 days representing exact solar orbit cycle. */
    SOLAR_365_2422
}

/**
 * Enumeration of dasha year co-lord rules for signs Scorpio and Aquarius.
 */
enum class CoLordRule {
    /** Use Mars only for Scorpio and Saturn only for Aquarius. */
    MARS_SATURN,
    /** Use Ketu only for Scorpio and Rahu only for Aquarius. */
    USE_KETU_RAHU,
    /** Compare the strength of both rulers and use the stronger one. */
    STRONGER_OF_TWO
}

/**
 * Enumeration of options for determining the starting sign of the Chara Dasha sequence.
 */
enum class StartingSignOption {
    /** Start with the Lagna (Ascendant) sign. */
    LAGNA,
    /** Start with the strongest sign among Lagna, Sun's sign, and Moon's sign. */
    STRONGER_LAGNA_SUN_MOON,
    /** Start with the sign occupied by the Atmakaraka (highest longitude planet). */
    ATMAKARAKA,
    /** Start with a specific sign supplied by the user. */
    USER_SUPPLIED
}

/**
 * Configuration options for sequence directions.
 */
enum class DirectionOption {
    /** Odd signs count forward, Even signs count reverse. */
    STANDARD_JAIMINI,
    /** Force all signs to count forward. */
    FORWARD_ONLY,
    /** Force all signs to count reverse. */
    REVERSE_ONLY
}
