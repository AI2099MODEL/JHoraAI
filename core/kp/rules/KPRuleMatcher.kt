package core.kp.rules

import java.util.Date

// Supporting models for the Execution Context
data class BirthDetails(
    val name: String,
    val dob: String,
    val tob: String
)

data class KPPlanet(
    val name: String,
    val longitude: Double,
    val starLord: String,
    val subLord: String,
    val subSubLord: String
)

data class KPHouse(
    val house: Int,
    val longitude: Double,
    val starLord: String,
    val subLord: String,
    val subSubLord: String
)

data class KPCusp(
    val house: Int,
    val absoluteLongitude: Double,
    val starLord: String,
    val subLord: String,
    val subSubLord: String
)

data class KPSignificator(
    val planet: String,
    val primaryHouses: List<Int>,
    val secondaryHouses: List<Int>,
    val strength: Double
)

data class CuspalSubLord(
    val house: Int,
    val subLord: String
)

data class KPEventProfile(
    val event: String,
    val promise: Boolean,
    val primaryHouses: List<Int>,
    val confidenceBase: Double
)

data class KPStrength(
    val planet: String,
    val strengthValue: Double
)

data class KPMetadata(
    val systemVersion: String,
    val calculationEngine: String
)

data class KPKnowledgeBook(
    val version: String,
    val chartId: String,
    val generatedOn: Long,
    val ayanamsa: String,
    val birthDetails: BirthDetails,
    val planets: List<KPPlanet>,
    val houses: List<KPHouse>,
    val cusps: List<KPCusp>,
    val significators: List<KPSignificator>,
    val csl: List<CuspalSubLord>,
    val eventProfiles: List<KPEventProfile>,
    val strengths: List<KPStrength>,
    val metadata: KPMetadata
)

data class CurrentDBA(
    val mahadasha: String,
    val bhukti: String,
    val antardasha: String,
    val mahadashaSignifies: List<Int>,
    val bhuktiSignifies: List<Int>
)

data class TransitSnapshot(
    val moonSign: String,
    val moonNakshatra: String,
    val planetCoordinates: Map<String, Double>
)

data class KPRuleExecutionContext(
    val chartId: String,
    val event: String,
    val generatedOn: Long,
    val knowledgeBook: KPKnowledgeBook,
    val currentDBA: CurrentDBA,
    val currentTransit: TransitSnapshot,
    val requestedDate: Long,
    val requestedTimeZone: String
)

object KPRuleMatcher {
    fun match(rule: KPRule, context: KPRuleExecutionContext): RuleMatchResult {
        val evidence = mutableListOf<String>()
        val supportingHouses = mutableListOf<Int>()
        val missingHouses = mutableListOf<Int>()
        val supportingPlanets = mutableListOf<String>()
        val blockingPlanets = mutableListOf<String>()

        // 1. Check Required Houses
        for (house in rule.requiredHouses) {
            val activatedByMahadasha = context.currentDBA.mahadashaSignifies.contains(house)
            val activatedByBhukti = context.currentDBA.bhuktiSignifies.contains(house)
            
            if (activatedByMahadasha || activatedByBhukti) {
                supportingHouses.add(house)
                evidence.add("Required House $house is ACTIVATED by current DBA (Mahadasha/Bhukti)")
            } else {
                missingHouses.add(house)
                evidence.add("Required House $house is NOT activated by current DBA")
            }
        }

        // 2. Check Supporting Houses
        for (house in rule.supportingHouses) {
            val activatedByMahadasha = context.currentDBA.mahadashaSignifies.contains(house)
            val activatedByBhukti = context.currentDBA.bhuktiSignifies.contains(house)
            if (activatedByMahadasha || activatedByBhukti) {
                supportingHouses.add(house)
                evidence.add("Supporting House $house is ACTIVATED by current DBA")
            }
        }

        // 3. Check Blocking Houses
        for (house in rule.blockingHouses) {
            val activatedByMahadasha = context.currentDBA.mahadashaSignifies.contains(house)
            val activatedByBhukti = context.currentDBA.bhuktiSignifies.contains(house)
            if (activatedByMahadasha || activatedByBhukti) {
                evidence.add("WARNING: Blocking House $house is ACTIVATED by current DBA")
            }
        }

        // 4. Check Required Significators / Planets
        for (sig in rule.requiredSignificators) {
            val existsInKnowledgeBook = context.knowledgeBook.planets.any { it.name.equals(sig, ignoreCase = true) }
            if (existsInKnowledgeBook) {
                supportingPlanets.add(sig)
                evidence.add("Required Significator planet $sig matches natal placements")
            } else {
                blockingPlanets.add(sig)
                evidence.add("Required Significator planet $sig is missing or severely afflicted")
            }
        }

        // 5. Calculate Score
        var score = 0
        if (rule.requiredHouses.isNotEmpty()) {
            val matchRatio = supportingHouses.intersect(rule.requiredHouses.toSet()).size.toDouble() / rule.requiredHouses.size.toDouble()
            score = (matchRatio * 100).toInt()
        } else {
            score = 100
        }

        // Apply deduction if blocking houses are activated
        val activeBlockingCount = rule.blockingHouses.count { 
            context.currentDBA.mahadashaSignifies.contains(it) || context.currentDBA.bhuktiSignifies.contains(it) 
        }
        if (activeBlockingCount > 0) {
            score = Math.max(0, score - (activeBlockingCount * 15))
            evidence.add("Blocking houses activation resulted in a dynamic score penalty of -${activeBlockingCount * 15}%")
        }

        val matched = score >= 50

        return RuleMatchResult(
            ruleId = rule.id,
            matched = matched,
            score = score,
            supportingHouses = supportingHouses,
            missingHouses = missingHouses,
            supportingPlanets = supportingPlanets,
            blockingPlanets = blockingPlanets,
            evidence = evidence
        )
    }
}
