package core.kp.rules

data class RuleMatchResult(
    val ruleId: String,
    val matched: Boolean,
    val score: Int,
    val supportingHouses: List<Int>,
    val missingHouses: List<Int>,
    val supportingPlanets: List<String>,
    val blockingPlanets: List<String>,
    val evidence: List<String>
)
