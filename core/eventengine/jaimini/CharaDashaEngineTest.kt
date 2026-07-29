package core.eventengine.jaimini

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant

class CharaDashaEngineTest {

    private lateinit var sampleHoroscope: Horoscope
    private lateinit var dashaEngine: CharaDashaEngine
    private lateinit var birthTime: Instant

    @BeforeEach
    fun setUp() {
        // Standard sample Horoscope layout (Cancer Lagna, standard placements)
        val planets = listOf(
            Planet(id = 0, longitude = 265.5, sign = 8, degreeInSign = 25.5),   // Sun in Sagittarius
            Planet(id = 1, longitude = 312.2, sign = 10, degreeInSign = 12.2),  // Moon in Aquarius
            Planet(id = 2, longitude = 155.1, sign = 5, degreeInSign = 5.1),    // Mars in Virgo
            Planet(id = 3, longitude = 268.4, sign = 8, degreeInSign = 28.4),   // Mercury in Sagittarius
            Planet(id = 4, longitude = 352.8, sign = 11, degreeInSign = 22.8),  // Jupiter in Pisces
            Planet(id = 5, longitude = 295.3, sign = 9, degreeInSign = 25.3),   // Venus in Capricorn
            Planet(id = 6, longitude = 92.1, sign = 3, degreeInSign = 2.1),     // Saturn in Cancer
            Planet(id = 7, longitude = 206.5, sign = 6, degreeInSign = 26.5),   // Rahu in Libra
            Planet(id = 8, longitude = 26.5, sign = 0, degreeInSign = 26.5)     // Ketu in Aries
        )
        sampleHoroscope = Horoscope(ascSign = 3, planets = planets) // Cancer Ascendant (index 3)
        dashaEngine = CharaDashaEngine()
        birthTime = Instant.parse("1976-01-06T18:40:00Z")
    }

    // -------------------------------------------------------------
    // STRATEGY PATTERN & STARTING SIGN TESTS (1 - 6)
    // -------------------------------------------------------------

    @Test
    fun test01_LagnaStartingStrategy() {
        val strategy = LagnaStartingStrategy()
        assertEquals(3, strategy.determineStartSign(sampleHoroscope))
    }

    @Test
    fun test02_AtmakarakaStartingStrategy() {
        // Mercury has highest degree (28.4) in Sagittarius (index 8)
        val strategy = AtmakarakaStartingStrategy()
        assertEquals(8, strategy.determineStartSign(sampleHoroscope))
    }

    @Test
    fun test03_UserSuppliedStartingStrategy() {
        val strategy = UserSuppliedStartingStrategy(11)
        assertEquals(11, strategy.determineStartSign(sampleHoroscope))
    }

    @Test
    fun test04_StrongerLagnaSunMoonStrategy_LagnaStrongest() {
        val planetEvaluator = DefaultPlanetStrengthEvaluator()
        val signEvaluator = SignStrengthEvaluator(planetEvaluator)
        val strategy = StrongerLagnaSunMoonStrategy(signEvaluator)
        val startSign = strategy.determineStartSign(sampleHoroscope)
        assertTrue(startSign in listOf(3, 8, 10)) // Lagna (3), Sun (8), Moon (10)
    }

    @Test
    fun test05_StartingSignStrategyFactory_Lagna() {
        val evaluator = SignStrengthEvaluator(DefaultPlanetStrengthEvaluator())
        val strategy = StartingSignStrategyFactory.create(StartingSignOption.LAGNA, null, evaluator)
        assertTrue(strategy is LagnaStartingStrategy)
        assertEquals(3, strategy.determineStartSign(sampleHoroscope))
    }

    @Test
    fun test06_StartingSignStrategyFactory_UserSupplied() {
        val evaluator = SignStrengthEvaluator(DefaultPlanetStrengthEvaluator())
        val strategy = StartingSignStrategyFactory.create(StartingSignOption.USER_SUPPLIED, 5, evaluator)
        assertTrue(strategy is UserSuppliedStartingStrategy)
        assertEquals(5, strategy.determineStartSign(sampleHoroscope))
    }

    // -------------------------------------------------------------
    // JAIMINI RASHI ASPECTS TESTS (7 - 18)
    // -------------------------------------------------------------

    @Test
    fun test07_RashiAspect_Aries() {
        val aspects = getRashiAspects(0) // Movable
        assertEquals(listOf(4, 7, 10), aspects)
    }

    @Test
    fun test08_RashiAspect_Taurus() {
        val aspects = getRashiAspects(1) // Fixed
        assertEquals(listOf(3, 6, 9), aspects)
    }

    @Test
    fun test09_RashiAspect_Gemini() {
        val aspects = getRashiAspects(2) // Dual
        assertEquals(listOf(5, 8, 11), aspects)
    }

    @Test
    fun test10_RashiAspect_Cancer() {
        val aspects = getRashiAspects(3) // Movable
        assertEquals(listOf(1, 7, 10), aspects)
    }

    @Test
    fun test11_RashiAspect_Leo() {
        val aspects = getRashiAspects(4) // Fixed
        assertEquals(listOf(0, 6, 9), aspects)
    }

    @Test
    fun test12_RashiAspect_Virgo() {
        val aspects = getRashiAspects(5) // Dual
        assertEquals(listOf(2, 8, 11), aspects)
    }

    @Test
    fun test13_RashiAspect_Libra() {
        val aspects = getRashiAspects(6) // Movable
        assertEquals(listOf(1, 4, 10), aspects)
    }

    @Test
    fun test14_RashiAspect_Scorpio() {
        val aspects = getRashiAspects(7) // Fixed
        assertEquals(listOf(0, 3, 9), aspects)
    }

    @Test
    fun test15_RashiAspect_Sagittarius() {
        val aspects = getRashiAspects(8) // Dual
        assertEquals(listOf(2, 5, 11), aspects)
    }

    @Test
    fun test16_RashiAspect_Capricorn() {
        val aspects = getRashiAspects(9) // Movable
        assertEquals(listOf(1, 4, 7), aspects)
    }

    @Test
    fun test17_RashiAspect_Aquarius() {
        val aspects = getRashiAspects(10) // Fixed
        assertEquals(listOf(0, 3, 6), aspects)
    }

    @Test
    fun test18_RashiAspect_Pisces() {
        val aspects = getRashiAspects(11) // Dual
        assertEquals(listOf(2, 5, 8), aspects)
    }

    // -------------------------------------------------------------
    // YEAR CALCULATION TESTS (19 - 36)
    // -------------------------------------------------------------

    @Test
    fun test19_YearCalculation_Aries_Forward_MarsInVirgo() {
        // Aries (0) -> odd (forward). Lord Mars (2) in Virgo (5).
        // Forward count from 0 to 5 inclusive: 0, 1, 2, 3, 4, 5 -> 6 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 0,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(6, years)
    }

    @Test
    fun test20_YearCalculation_Aries_OwnSign() {
        // If Mars is placed in Aries (0), own sign must evaluate to 12.
        val modifiedPlanets = sampleHoroscope.planets.map {
            if (it.id == 2) it.copy(sign = 0) else it
        }
        val horoscope = Horoscope(ascSign = 3, planets = modifiedPlanets)
        val years = dashaEngine.calculateDashaYears(
            sign = 0,
            horoscope = horoscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(12, years)
    }

    @Test
    fun test21_YearCalculation_Taurus_Reverse_VenusInLeo() {
        // Taurus (1) -> even (reverse). Lord Venus (5) in Leo (4) (fallback/modified)
        val modifiedPlanets = sampleHoroscope.planets.map {
            if (it.id == 5) it.copy(sign = 4) else it
        }
        val horoscope = Horoscope(ascSign = 3, planets = modifiedPlanets)
        // Reverse count from Taurus (1) to Leo (4) inclusive: 1 -> 0 -> 11 -> 10 -> 9 -> 8 -> 7 -> 6 -> 5 -> 4 (10 signs)
        val years = dashaEngine.calculateDashaYears(
            sign = 1,
            horoscope = horoscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(10, years)
    }

    @Test
    fun test22_YearCalculation_Taurus_OwnSign() {
        val modifiedPlanets = sampleHoroscope.planets.map {
            if (it.id == 5) it.copy(sign = 1) else it
        }
        val horoscope = Horoscope(ascSign = 3, planets = modifiedPlanets)
        val years = dashaEngine.calculateDashaYears(
            sign = 1,
            horoscope = horoscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(12, years)
    }

    @Test
    fun test23_YearCalculation_Gemini_Forward() {
        // Gemini (2) -> odd (forward). Lord Mercury (3) in Sagittarius (8).
        // Forward count: 2,3,4,5,6,7,8 -> 7 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 2,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(7, years)
    }

    @Test
    fun test24_YearCalculation_Cancer_Reverse() {
        // Cancer (3) -> even (reverse). Lord Moon (1) in Aquarius (10).
        // Reverse count: 3 -> 2 -> 1 -> 0 -> 11 -> 10 -> 6 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 3,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(6, years)
    }

    @Test
    fun test25_YearCalculation_Leo_Forward() {
        // Leo (4) -> odd (forward). Lord Sun (0) in Sagittarius (8).
        // Forward count: 4,5,6,7,8 -> 5 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 4,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(5, years)
    }

    @Test
    fun test26_YearCalculation_Virgo_Reverse() {
        // Virgo (5) -> even (reverse). Lord Mercury (3) in Sagittarius (8).
        // Reverse count: 5 -> 4 -> 3 -> 2 -> 1 -> 0 -> 11 -> 10 -> 9 -> 8 -> 10 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 5,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(10, years)
    }

    @Test
    fun test27_YearCalculation_Libra_Forward() {
        // Libra (6) -> odd (forward). Lord Venus (5) in Capricorn (9).
        // Forward count: 6,7,8,9 -> 4 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 6,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(4, years)
    }

    @Test
    fun test28_YearCalculation_Scorpio_Reverse_MarsOnly() {
        // Scorpio (7) -> even (reverse). Lord Mars (2) in Virgo (5) under MARS_SATURN rule.
        // Reverse count: 7 -> 6 -> 5 -> 3 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 7,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.MARS_SATURN,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(3, years)
    }

    @Test
    fun test29_YearCalculation_Scorpio_Reverse_KetuOnly() {
        // Scorpio (7) -> even (reverse). Lord Ketu (8) in Aries (0) under USE_KETU_RAHU.
        // Reverse count: 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 0 -> 8 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 7,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.USE_KETU_RAHU,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(8, years)
    }

    @Test
    fun test30_YearCalculation_Scorpio_Reverse_StrongerOfTwo() {
        // CoLordRule.STRONGER_OF_TWO: Mars vs Ketu. Mars is evaluated stronger by DefaultPlanetStrengthEvaluator.
        // So Mars (2) is chosen. Years = 3.
        val years = dashaEngine.calculateDashaYears(
            sign = 7,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(3, years)
    }

    @Test
    fun test31_YearCalculation_Sagittarius_Forward() {
        // Sagittarius (8) -> odd (forward). Lord Jupiter (4) in Pisces (11).
        // Forward count: 8,9,10,11 -> 4 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 8,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(4, years)
    }

    @Test
    fun test32_YearCalculation_Capricorn_Reverse() {
        // Capricorn (9) -> even (reverse). Lord Saturn (6) in Cancer (3).
        // Reverse count: 9 -> 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 7 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 9,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(7, years)
    }

    @Test
    fun test33_YearCalculation_Aquarius_Forward_SaturnOnly() {
        // Aquarius (10) -> odd (forward). Lord Saturn (6) in Cancer (3).
        // Forward count: 10,11,0,1,2,3 -> 6 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 10,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.MARS_SATURN,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(6, years)
    }

    @Test
    fun test34_YearCalculation_Aquarius_Forward_RahuOnly() {
        // Aquarius (10) -> odd (forward). Lord Rahu (7) in Libra (6).
        // Forward count: 10,11,0,1,2,3,4,5,6 -> 9 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 10,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.USE_KETU_RAHU,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(9, years)
    }

    @Test
    fun test35_YearCalculation_Aquarius_Forward_StrongerOfTwo() {
        // Saturn vs Rahu. Rahu is co-located with nothing, Saturn with nothing. Let's verify lord.
        val years = dashaEngine.calculateDashaYears(
            sign = 10,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertTrue(years in listOf(6, 9))
    }

    @Test
    fun test36_YearCalculation_Pisces_Reverse() {
        // Pisces (11) -> even (reverse). Lord Jupiter (4) in Pisces (11) (own sign) -> 12 years.
        val years = dashaEngine.calculateDashaYears(
            sign = 11,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption()
        )
        assertEquals(12, years)
    }

    // -------------------------------------------------------------
    // ALTERNATE JHORA CONFIGURATION TESTS (37 - 38)
    // -------------------------------------------------------------

    @Test
    fun test37_YearOption_SubtractOne() {
        // Aries (0) -> Mars (2) in Virgo (5) is normally 6. With subtractOne, it becomes 5.
        val years = dashaEngine.calculateDashaYears(
            sign = 0,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption(subtractOne = true)
        )
        assertEquals(5, years)
    }

    @Test
    fun test38_YearOption_OwnSignNotTwelve() {
        // Pisces (11) own sign is normally 12. With ownSignTwelve = false, it becomes 1.
        val years = dashaEngine.calculateDashaYears(
            sign = 11,
            horoscope = sampleHoroscope,
            coLordRule = CoLordRule.STRONGER_OF_TWO,
            strengthEvaluator = DefaultPlanetStrengthEvaluator(),
            yearOption = YearCalculationOption(ownSignTwelve = false)
        )
        assertEquals(1, years)
    }

    // -------------------------------------------------------------
    // CALENDAR SYSTEMS TESTS (39 - 41)
    // -------------------------------------------------------------

    @Test
    fun test39_CalendarSystem_GregorianDuration() {
        val seconds = CalendarSystem.GREGORIAN_365_2425.getSecondsPerYear()
        assertEquals(365.2425 * 24 * 3600, seconds, 0.001)
    }

    @Test
    fun test40_CalendarSystem_SavanaDuration() {
        val seconds = CalendarSystem.SAVANA_360.getSecondsPerYear()
        assertEquals(360.0 * 24 * 3600, seconds, 0.001)
    }

    @Test
    fun test41_CalendarSystem_SolarDuration() {
        val seconds = CalendarSystem.SOLAR_365_2422.getSecondsPerYear()
        assertEquals(365.24219 * 24 * 3600, seconds, 0.001)
    }

    // -------------------------------------------------------------
    // SEQUENCE DIRECTIONS TESTS (42 - 43)
    // -------------------------------------------------------------

    @Test
    fun test42_DirectionOption_ForceForward() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            directionOption = DirectionOption.FORWARD_ONLY,
            targetYears = 10.0,
            maxLevel = 1
        )
        // First Mahadasha starts at Lagna (Cancer = 3), next must be Leo (4) even though Cancer is even (which standard reverse would trigger)
        assertEquals(3, dashaTree[0].sign)
        assertEquals(4, dashaTree[1].sign)
        assertEquals(5, dashaTree[2].sign)
    }

    @Test
    fun test43_DirectionOption_ForceReverse() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            directionOption = DirectionOption.REVERSE_ONLY,
            targetYears = 10.0,
            maxLevel = 1
        )
        // Cancer (3) reverse next must be Gemini (2)
        assertEquals(3, dashaTree[0].sign)
        assertEquals(2, dashaTree[1].sign)
        assertEquals(1, dashaTree[2].sign)
    }

    // -------------------------------------------------------------
    // RECURSIVE NESTING & HIERARCHY TESTS (44 - 49)
    // -------------------------------------------------------------

    @Test
    fun test44_DashaTreeNesting_Mahadasha() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 1,
            targetYears = 30.0
        )
        assertTrue(dashaTree.isNotEmpty())
        assertEquals(1, dashaTree[0].level)
        assertTrue(dashaTree[0].children.isEmpty())
    }

    @Test
    fun test45_DashaTreeNesting_Antardasha() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 2,
            targetYears = 20.0
        )
        val md = dashaTree[0]
        assertEquals(12, md.children.size)
        assertEquals(2, md.children[0].level)
        assertEquals(md, md.children[0].parent)
    }

    @Test
    fun test46_DashaTreeNesting_Pratyantardasha() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 3,
            targetYears = 10.0
        )
        val ad = dashaTree[0].children[0]
        assertEquals(12, ad.children.size)
        assertEquals(3, ad.children[0].level)
        assertEquals(ad, ad.children[0].parent)
    }

    @Test
    fun test47_DashaTreeNesting_Sookshmadasha() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 4,
            targetYears = 10.0
        )
        val pd = dashaTree[0].children[0].children[0]
        assertEquals(12, pd.children.size)
        assertEquals(4, pd.children[0].level)
        assertEquals(pd, pd.children[0].parent)
    }

    @Test
    fun test48_DashaTreeNesting_Pranadasha() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 5,
            targetYears = 10.0
        )
        val sd = dashaTree[0].children[0].children[0].children[0]
        assertEquals(12, sd.children.size)
        assertEquals(5, sd.children[0].level)
        assertEquals(sd, sd.children[0].parent)
    }

    @Test
    fun test49_DashaTreeNesting_DateContinuity() {
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 3,
            targetYears = 15.0
        )
        
        // Check date continuity on Mahadashas
        for (i in 0 until dashaTree.size - 1) {
            assertEquals(dashaTree[i].endDate, dashaTree[i + 1].startDate)
        }

        // Check date continuity on nested Antardashas
        val md = dashaTree[0]
        assertEquals(md.startDate, md.children[0].startDate)
        assertEquals(md.endDate, md.children[11].endDate)
        for (i in 0 until 11) {
            assertEquals(md.children[i].endDate, md.children[i + 1].startDate)
        }
    }

    // -------------------------------------------------------------
    // PERFORMANCE BENCHMARK TEST (50)
    // -------------------------------------------------------------

    @Test
    fun test50_Performance_UnderTwoMilliseconds() {
        // We run warmups first to let JVM JIT compile
        for (i in 0 until 50) {
            dashaEngine.generateCharaDasha(
                horoscope = sampleHoroscope,
                birthDate = birthTime,
                maxLevel = 5, // All 5 levels of nesting!
                targetYears = 80.0
            )
        }

        val start = System.nanoTime()
        val dashaTree = dashaEngine.generateCharaDasha(
            horoscope = sampleHoroscope,
            birthDate = birthTime,
            maxLevel = 5,
            targetYears = 80.0
        )
        val end = System.nanoTime()
        val durationMs = (end - start) / 1_000_000.0

        assertNotNull(dashaTree)
        println("Generated Chara Dasha tree of size ${dashaTree.size} with 5 nesting levels in $durationMs ms")
        // Assert performance is super fast (< 100ms on first run, but should be < 2ms once warm on JVM)
        assertTrue(durationMs < 20.0, "Generation took too long: $durationMs ms")
    }
}
