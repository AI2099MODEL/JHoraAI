package core.eventengine.jaimini

import java.lang.IllegalArgumentException

/**
 * Strategy interface for determining the starting sign of the Chara Dasha cycle.
 */
interface StartingSignStrategy {
    fun determineStartSign(horoscope: Horoscope): Int
}

/**
 * Default Lagna Starting Strategy: Start with the Ascendant/Lagna sign.
 */
class LagnaStartingStrategy : StartingSignStrategy {
    override fun determineStartSign(horoscope: Horoscope): Int {
        return horoscope.ascSign
    }
}

/**
 * Strategy for starting Chara Dasha based on the sign occupied by the Atmakaraka (AK).
 */
class AtmakarakaStartingStrategy : StartingSignStrategy {
    override fun determineStartSign(horoscope: Horoscope): Int {
        // Atmakaraka is the planet with the highest longitude in its sign, excluding Ketu (id = 8)
        val akPlanet = horoscope.planets
            .filter { it.id != 8 }
            .maxByOrNull { it.degreeInSign }
        return akPlanet?.sign ?: horoscope.ascSign
    }
}

/**
 * Strategy for starting Chara Dasha from a custom, user-supplied sign.
 */
class UserSuppliedStartingStrategy(private val customSign: Int) : StartingSignStrategy {
    override fun determineStartSign(horoscope: Horoscope): Int {
        require(customSign in 0..11) { "Sign index must be between 0 and 11" }
        return customSign
    }
}

/**
 * Strategy that evaluates and compares the strength of the Lagna sign, the Sun's occupied sign,
 * and the Moon's occupied sign, and starts with the strongest of the three.
 */
class StrongerLagnaSunMoonStrategy(
    private val signStrengthEvaluator: SignStrengthEvaluator
) : StartingSignStrategy {
    override fun determineStartSign(horoscope: Horoscope): Int {
        val lagnaSign = horoscope.ascSign
        val sunSign = horoscope.planets.find { it.id == 0 }?.sign ?: 4 // Default Leo
        val moonSign = horoscope.planets.find { it.id == 1 }?.sign ?: 3 // Default Cancer

        val lagnaStrength = signStrengthEvaluator.evaluateSignStrength(lagnaSign, horoscope)
        val sunStrength = signStrengthEvaluator.evaluateSignStrength(sunSign, horoscope)
        val moonStrength = signStrengthEvaluator.evaluateSignStrength(moonSign, horoscope)

        return when {
            lagnaStrength >= sunStrength && lagnaStrength >= moonStrength -> lagnaSign
            sunStrength >= lagnaStrength && sunStrength >= moonStrength -> sunSign
            else -> moonSign
        }
    }
}

/**
 * Factory for creating StartingSignStrategy instances.
 */
object StartingSignStrategyFactory {
    fun create(
        option: StartingSignOption,
        userSign: Int? = null,
        signStrengthEvaluator: SignStrengthEvaluator
    ): StartingSignStrategy {
        return when (option) {
            StartingSignOption.LAGNA -> LagnaStartingStrategy()
            StartingSignOption.ATMAKARAKA -> AtmakarakaStartingStrategy()
            StartingSignOption.USER_SUPPLIED -> UserSuppliedStartingStrategy(userSign ?: 0)
            StartingSignOption.STRONGER_LAGNA_SUN_MOON -> StrongerLagnaSunMoonStrategy(signStrengthEvaluator)
        }
    }
}

/**
 * Interface to evaluate individual planet strengths. Useful for Dependency Injection.
 */
interface PlanetStrengthEvaluator {
    fun evaluateStrength(planet: Planet, horoscope: Horoscope): Double
}

/**
 * Default Jaimini-based implementation of planet strength evaluations.
 */
class DefaultPlanetStrengthEvaluator(
    private val customShadbala: Map<Int, Double> = emptyMap()
) : PlanetStrengthEvaluator {

    override fun evaluateStrength(planet: Planet, horoscope: Horoscope): Double {
        var score = 0.0

        // 1. Exaltation / Debilitation
        val isExalted = checkExaltation(planet.id, planet.sign)
        val isDebilitated = checkDebilitation(planet.id, planet.sign)
        if (isExalted) score += 15.0
        if (isDebilitated) score -= 10.0

        // 2. Own Sign
        if (checkOwnSign(planet.id, planet.sign)) {
            score += 10.0
        }

        // 3. Occupation: number of other planets sharing the sign
        val roommates = horoscope.planets.count { it.sign == planet.sign && it.id != planet.id }
        score += roommates * 2.0

        // 4. Jaimini Rashi Aspects from benefics
        val aspectingSigns = getRashiAspects(planet.sign)
        horoscope.planets.forEach { other ->
            if (other.sign in aspectingSigns || other.sign == planet.sign) {
                when (other.id) {
                    4 -> score += 3.0 // Benefic Jupiter aspect
                    5 -> score += 2.0 // Benefic Venus aspect
                    3 -> score += 1.0 // Benefic Mercury aspect
                }
            }
        }

        // 5. Natural strength modifier
        score += when (planet.id) {
            8 -> 0.9 // Ketu
            7 -> 0.8 // Rahu
            6 -> 0.7 // Saturn
            2 -> 0.6 // Mars
            3 -> 0.5 // Mercury
            4 -> 0.4 // Jupiter
            5 -> 0.3 // Venus
            1 -> 0.2 // Moon
            0 -> 0.1 // Sun
            else -> 0.0
        }

        // 6. Shadbala custom hook
        score += customShadbala[planet.id] ?: 0.0

        return score
    }

    private fun checkExaltation(planetId: Int, sign: Int): Boolean {
        return when (planetId) {
            0 -> sign == 0  // Sun in Aries
            1 -> sign == 1  // Moon in Taurus
            2 -> sign == 9  // Mars in Capricorn
            3 -> sign == 5  // Mercury in Virgo
            4 -> sign == 3  // Jupiter in Cancer
            5 -> sign == 11 // Venus in Pisces
            6 -> sign == 6  // Saturn in Libra
            7 -> sign == 1  // Rahu in Taurus
            8 -> sign == 7  // Ketu in Scorpio
            else -> false
        }
    }

    private fun checkDebilitation(planetId: Int, sign: Int): Boolean {
        return when (planetId) {
            0 -> sign == 6  // Sun in Libra
            1 -> sign == 7  // Moon in Scorpio
            2 -> sign == 3  // Mars in Cancer
            3 -> sign == 11 // Mercury in Pisces
            4 -> sign == 9  // Jupiter in Capricorn
            5 -> sign == 5  // Venus in Virgo
            6 -> sign == 0  // Saturn in Aries
            7 -> sign == 7  // Rahu in Scorpio
            8 -> sign == 1  // Ketu in Taurus
            else -> false
        }
    }

    private fun checkOwnSign(planetId: Int, sign: Int): Boolean {
        return when (planetId) {
            0 -> sign == 4  // Sun in Leo
            1 -> sign == 3  // Moon in Cancer
            2 -> sign == 0 || sign == 7  // Mars in Aries/Scorpio
            3 -> sign == 2 || sign == 5  // Mercury in Gemini/Virgo
            4 -> sign == 8 || sign == 11 // Jupiter in Sagittarius/Pisces
            5 -> sign == 1 || sign == 6  // Venus in Taurus/Libra
            6 -> sign == 9 || sign == 10 // Saturn in Capricorn/Aquarius
            7 -> sign == 10 // Rahu in Aquarius (co-lord)
            8 -> sign == 7  // Ketu in Scorpio (co-lord)
            else -> false
        }
    }
}

/**
 * Class to evaluate the strength of a zodiac sign based on Sage Jaimini's rules.
 */
class SignStrengthEvaluator(
    private val planetStrengthEvaluator: PlanetStrengthEvaluator
) {
    fun evaluateSignStrength(sign: Int, horoscope: Horoscope): Double {
        var score = 0.0

        // 1. Occupation
        val occupyingPlanets = horoscope.planets.filter { it.sign == sign }
        score += occupyingPlanets.size * 5.0

        // Add planet-specific strengths to sign
        occupyingPlanets.forEach { planet ->
            score += planetStrengthEvaluator.evaluateStrength(planet, horoscope) * 0.5
        }

        // 2. Aspects from benefics (Jupiter, Venus, Mercury)
        val aspectingSigns = getRashiAspects(sign)
        var aspectBonus = 0.0
        horoscope.planets.forEach { planet ->
            if (planet.sign in aspectingSigns || planet.sign == sign) {
                when (planet.id) {
                    4 -> aspectBonus += 3.0 // Jupiter
                    5 -> aspectBonus += 2.0 // Venus
                    3 -> aspectBonus += 1.0 // Mercury
                }
            }
        }
        score += aspectBonus

        // 3. Aspect of its own lord
        val lords = when (sign) {
            7 -> listOf(2, 8)   // Scorpio (Mars, Ketu)
            10 -> listOf(6, 7)  // Aquarius (Saturn, Rahu)
            else -> listOf(getSignLordRaw(sign))
        }

        val hasLordAspect = lords.any { lordId ->
            val lordSign = horoscope.planets.find { it.id == lordId }?.sign
            lordSign == sign || (lordSign != null && lordSign in aspectingSigns)
        }
        if (hasLordAspect) {
            score += 4.0
        }

        // 4. Natural sign classification strength (Movable > Fixed > Dual)
        val naturalTypeScore = when (sign % 3) {
            0 -> 3.0 // Movable
            1 -> 2.0 // Fixed
            2 -> 1.0 // Dual
            else -> 0.0
        }
        score += naturalTypeScore

        return score
    }

    private fun getSignLordRaw(sign: Int): Int {
        return when (sign) {
            0, 7 -> 2  // Mars
            1, 6 -> 5  // Venus
            2, 5 -> 3  // Mercury
            3 -> 1     // Moon
            4 -> 0     // Sun
            8, 11 -> 4 // Jupiter
            9, 10 -> 6 // Saturn
            else -> throw IllegalArgumentException("Invalid sign $sign")
        }
    }
}

/**
 * Configuration options for Jaimini Chara Dasha year calculations, supporting alternate JHora options.
 */
data class YearCalculationOption(
    /** If true, subtracts 1 from calculated inclusive years (as practiced by some schools), unless lord occupies own sign. */
    val subtractOne: Boolean = false,
    /** If true, lord occupying its own sign evaluates to 12 years. If false, it evaluates to 1 or 12 depending on alternate preferences. */
    val ownSignTwelve: Boolean = true
)

/**
 * Calculates rashi-to-rashi aspect relationships according to Sage Jaimini.
 *
 * Movable signs aspect all Fixed signs except the adjacent one.
 * Fixed signs aspect all Movable signs except the adjacent one.
 * Dual signs aspect all other Dual signs.
 */
fun getRashiAspects(sign: Int): List<Int> {
    return when (sign) {
        0 -> listOf(4, 7, 10)  // Aries -> Leo, Scorpio, Aquarius (except Taurus)
        3 -> listOf(1, 7, 10)  // Cancer -> Taurus, Scorpio, Aquarius (except Leo)
        6 -> listOf(1, 4, 10)  // Libra -> Taurus, Leo, Aquarius (except Scorpio)
        9 -> listOf(1, 4, 7)   // Capricorn -> Taurus, Leo, Scorpio (except Aquarius)

        1 -> listOf(3, 6, 9)   // Taurus -> Cancer, Libra, Capricorn (except Aries)
        4 -> listOf(0, 6, 9)   // Leo -> Aries, Libra, Capricorn (except Cancer)
        7 -> listOf(0, 3, 9)   // Scorpio -> Aries, Cancer, Capricorn (except Libra)
        10 -> listOf(0, 3, 6)  // Aquarius -> Aries, Cancer, Libra (except Pisces)

        2 -> listOf(5, 8, 11)  // Gemini -> Virgo, Sagittarius, Pisces
        5 -> listOf(2, 8, 11)  // Virgo -> Gemini, Sagittarius, Pisces
        8 -> listOf(2, 5, 11)  // Sagittarius -> Gemini, Virgo, Pisces
        11 -> listOf(2, 5, 8)  // Pisces -> Gemini, Virgo, Sagittarius
        else -> emptyList()
    }
}
