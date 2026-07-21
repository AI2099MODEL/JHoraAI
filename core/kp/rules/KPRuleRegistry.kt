package core.kp.rules

import java.util.logging.Logger

// Represent the KPRule structure as defined in specifications
data class KPRule(
    val id: String,
    val name: String,
    val category: RuleCategory,
    val description: String,
    val requiredHouses: List<Int>,
    val supportingHouses: List<Int>,
    val blockingHouses: List<Int>,
    val requiredSignificators: List<String>,
    val weight: Int,
    val priority: Int,
    val enabled: Boolean = true
)

enum class RuleCategory {
    Marriage,
    Career,
    Business,
    Finance,
    Property,
    Vehicle,
    Education,
    Children,
    Travel,
    ForeignSettlement,
    Health,
    Litigation,
    Spiritual,
    Longevity,
    General
}

object KPRuleRegistry {
    private val logger = Logger.getLogger(KPRuleRegistry::class.java.name)
    val version: String = "1.0"
    
    val rules: List<KPRule>
    
    private val rulesById: Map<String, KPRule>
    private val rulesByCategory: Map<RuleCategory, List<KPRule>>

    init {
        // Internally maintain and load rules
        val loadedRules = mutableListOf<KPRule>()
        
        // Populate standard rules corresponding to category index and rule index
        loadedRules.add(KPRule(
            id = "KP_MAR_0001",
            name = "7th Cuspal Sub-Lord Primary Significator",
            category = RuleCategory.Marriage,
            description = "Evaluates if 7th CSL connects to 2nd, 7th, or 11th house without blocking aspects.",
            requiredHouses = listOf(2, 7, 11),
            supportingHouses = listOf(5, 9),
            blockingHouses = listOf(1, 6, 10),
            requiredSignificators = listOf("Venus"),
            weight = 10,
            priority = 1,
            enabled = true
        ))

        loadedRules.add(KPRule(
            id = "KP_CAR_0001",
            name = "Corporate Career Promotion Core Signification",
            category = RuleCategory.Career,
            description = "Evaluates 10th CSL connection to 2nd, 6th, 10th, and 11th houses.",
            requiredHouses = listOf(2, 6, 10, 11),
            supportingHouses = listOf(1, 3),
            blockingHouses = listOf(5, 8, 12),
            requiredSignificators = listOf("Jupiter"),
            weight = 10,
            priority = 1,
            enabled = true
        ))

        loadedRules.add(KPRule(
            id = "KP_BUS_0001",
            name = "Commercial Business Expansion",
            category = RuleCategory.Business,
            description = "Evaluates 7th CSL connection to 7th, 10th, and 11th houses.",
            requiredHouses = listOf(7, 10, 11),
            supportingHouses = listOf(2, 3),
            blockingHouses = listOf(5, 6, 12),
            requiredSignificators = listOf("Jupiter"),
            weight = 10,
            priority = 1,
            enabled = true
        ))

        loadedRules.add(KPRule(
            id = "KP_FIN_0001",
            name = "Wealth & Asset Accumulation",
            category = RuleCategory.Finance,
            description = "Evaluates 2nd CSL connection to 2nd and 11th houses.",
            requiredHouses = listOf(2, 11),
            supportingHouses = listOf(5, 6, 9),
            blockingHouses = listOf(8, 12),
            requiredSignificators = listOf("Jupiter"),
            weight = 10,
            priority = 1,
            enabled = true
        ))

        loadedRules.add(KPRule(
            id = "KP_HLT_0001",
            name = "Health & Recovery Vigor",
            category = RuleCategory.Health,
            description = "Evaluates 1st CSL connection to 1st, 5th, and 11th houses with support.",
            requiredHouses = listOf(1, 5, 11),
            supportingHouses = listOf(9),
            blockingHouses = listOf(6, 8, 12),
            requiredSignificators = listOf("Jupiter"),
            weight = 10,
            priority = 1,
            enabled = true
        ))

        // Validate Rulebook during application startup
        validateRulebook(loadedRules)

        rules = loadedRules.toList()
        rulesById = rules.associateBy { it.id }
        rulesByCategory = rules.groupBy { it.category }
    }

    private fun validateRulebook(rulesToValidate: List<KPRule>) {
        val seenIds = mutableSetOf<String>()
        val seenNames = mutableSetOf<String>()

        for (rule in rulesToValidate) {
            // Null references, duplicate rule IDs
            if (rule.id.isEmpty()) {
                logger.severe("Rule validation error: Rule ID cannot be empty.")
            }
            if (!seenIds.add(rule.id)) {
                logger.severe("Rule validation error: Duplicate Rule ID detected: ${rule.id}")
            }
            
            // Warnings for duplicate names
            if (!seenNames.add(rule.name)) {
                logger.warning("Rule validation warning: Duplicate Rule Name detected: ${rule.name}")
            }

            // Disabled rules tracking
            if (!rule.enabled) {
                logger.info("Rule validation info: Disabled rule loaded: ${rule.id}")
            }
        }
    }

    fun getAllRules(): List<KPRule> = rules

    fun getRule(id: String): KPRule? = rulesById[id]

    fun getRules(category: RuleCategory): List<KPRule> = rulesByCategory[category] ?: emptyList()

    fun getEnabledRules(): List<KPRule> = rules.filter { it.enabled }

    fun getRuleCount(): Int = rules.size

    fun getVersion(): String = version
}
