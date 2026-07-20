# JHora AI Master Evaluation & Astrology Rules Handbook

Welcome to the **Master Evaluation Handbook**, the authoritative index, registry, and rulebook for JHora AI's unified astrological engines. This document serves as the ground truth of data structures, provenances, and evaluation gates.

> **Execution Directive:** This handbook stores only the indices, data schema, structural logic, and rule conditions. Individual user data is stored dynamically within separate files in the `Users/` directory (e.g., `userprofile.json` representing the active profile). The client dashboard dynamically reads and populates these values based on the active session profile.

---

## I. ASTROLOGICAL DATA INDEX & REGISTRY

This index catalogs the primary data tables, variables, and calculation schemas dynamically populated by the JHora calculation engines.

### 100. Evaluation Data Index & Birth Registry
* **Registry Source File:** `/Users/userprofile.json` (Active selected profile payload)
* **Primary Information Source:** **Dashboard Page** (User birth inputs: Date, Time, Place/Coordinates, and selected Ayanamsa)
* **Status:** Dynamically populated based on active selected profile session.

#### Strict UserProfile Data Strategy:
1. **No Calculation/Derivation Storage**: Do NOT generate, calculate, or store any derived astrological models, mappings, interpretations, harmonics, divisional charts, friendships, dignities, strengths, yogas, doshas, remedies, or reports inside the persisted UserProfile. The UserProfile is strictly a persistent archive of raw API responses only (from the JHora/VedicAstro endpoints).
2. **Zero In-Profile Calculations**: All calculations, conversions, or interpretive rules (including KP stellar division and event rulebooks) must be run purely at render-time/runtime on the client dashboard. No pre-calculated data or static placeholder dates should be injected or hardcoded inside the stored profile payload.
3. **No Transit / Sky JSON Data**: Do NOT store or append transit coordinate data, daily sky state JSON, or daily muhurtas into the UserProfile. The profile must remain perfectly focused on the static, raw natal birth particulars and JHora's raw API horoscope output.
4. **Authentic Data Preservation**: Keep fetched raw data exactly as returned by the API with zero client-side or server-side structural tampering during the profile creation and storage phase. Mappings are implemented dynamically in downstream viewer layers.

#### Table 1: Birth Details & Lagna (Ascendant Coordinates)
This table represents the layout schema of the primary birth particulars and lagna (ascendant) coordinates. The engine maps these parameters as the absolute mathematical foundation for divisional chart calculations, dasha timelines, and planetary transits.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Profile Name** | `string` | **Dashboard Page** / Selected Profile | Loaded dynamically from selected profile (`User.profile_name`) |
| **User Email** | `string` | **Dashboard Page** / Active Session | Loaded dynamically from selected profile session (`User.email`) |
| **Birth Date** | `string (YYYY-MM-DD)` | **Dashboard Page** Input Form | Loaded dynamically from birth parameters (`Birth.date`) |
| **Birth Time** | `string (HH:MM:SS)` | **Dashboard Page** Input Form | Loaded dynamically from birth parameters (`Birth.time`) |
| **Latitude** | `float` | **Dashboard Page** GPS Resolver | Geographical coordinates mapped via city database lookup (`Birth.latitude`) |
| **Longitude** | `float` | **Dashboard Page** GPS Resolver | Geographical coordinates mapped via city database lookup (`Birth.longitude`) |
| **Timezone** | `float` | **Dashboard Page** Coordinate Mapping| Local UTC timezone offset derived during calculation (`Birth.timezone`) |
| **Place** | `string` | **Dashboard Page** Input Form | Resolved location name from geographical coordinates database (`Birth.place`) |
| **Ayanamsa** | `string` | **Dashboard Page** Settings | Calculation mode standard selected by user (e.g., Lahiri) (`Birth.ayanamsa`) |
| **Julian Day Number**| `string` | Calculated (from Table 1 Date/Time) | Derived mathematically from UTC birth moment timestamp (`Birth.julian_day_number`) |
| **Sidereal Time** | `string` | Calculated (from Table 1 Lat/Lon/Time) | Calculated Local Sidereal Time for birth coordinates (`Birth.local_sidereal_time`) |
| **Obliquity** | `string` | Calculated (from Ephemeris) | Obliquity of the ecliptic derived for Julian epoch (`Birth.obliquity`) |
| **Ephemeris Used** | `string` | Background Library | Calculation engine background source (`Birth.ephemeris_used`) |
| **House System** | `string` | **Dashboard Page** Settings | Structural house division rules applied (e.g., Placidus / KP Cusps) |
| **Zodiac Sign (Lagna)** | `string` | Calculated (from Birth Parameters) | Sign rising on eastern horizon (`Vedic.ascendant.sign`) |
| **Lagna Longitude (In Sign)** | `string` | Calculated (from Birth Parameters) | Ascendant degree within zodiac sign (`Vedic.ascendant.degree`, `minute`, `second`) |
| **Lagna 360° Longitude** | `float` | Calculated (from Birth Parameters) | Exact 360-degree celestial longitude of ascendant (`Vedic.ascendant.longitude_360`) |
| **Lagna Nakshatra** | `string` | Calculated (from Birth Parameters) | Nakshatra containing the ascendant degree (`Vedic.ascendant.nakshatra`) |
| **Lagna Nakshatra Pada** | `int` | Calculated (from Birth Parameters) | Nakshatra quarter of the ascendant (`Vedic.ascendant.pada`) |
| **Lagna Nakshatra Lord** | `string` | Calculated (from Birth Parameters) | Planetary ruler of the ascendant nakshatra (`Vedic.ascendant.nakshatra_lord`) |

#### Table 2: KP Graha, Nakshatra and Pada (Planetary Coordinates)
This table indexes the coordinates, nakshatras, padas, star-lords, sub-lords, and sub-sub-lords of all primary natal planets.
* **Primary Information Source / Info Origin:** JHora REST API Server endpoint (`/api/jhora/horoscope`) & KP Stellar Division Engine.
* **Logic & Provenance Source:** Raw planet coordinates are retrieved directly from the JHora engine, while sub-lords and sub-sub-lords are derived using KP Placidus stellar division equations against the exact coordinates.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Graha Name** | `string` | JHora Raw API | Name of the primary celestial body (`Vedic.planets.[Planet].name`) |
| **Zodiac Sign** | `string` | JHora Raw API | Rasi sign containing the planet (`Vedic.planets.[Planet].sign`) |
| **Longitude (In Sign)** | `string` | JHora Raw API | Coordinate degree, minute, and second within the sign (`Vedic.planets.[Planet].longitude_formatted`) |
| **360° Longitude** | `float` | JHora Raw API | Celestial longitude in 360-degree coordinates (`Vedic.planets.[Planet].longitude`) |
| **House Placement** | `int` | JHora Raw API | House position in the rasi chart (`Vedic.planets.[Planet].house`) |
| **Nakshatra** | `string` | JHora Raw API | Asterism division (1 to 27) of the planet (`Vedic.planets.[Planet].nakshatra`) |
| **Nakshatra Pada** | `int` | JHora Raw API | Asterism quarter (1 to 4) of the planet (`Vedic.planets.[Planet].pada`) |
| **Nakshatra Lord** | `string` | Nakshatra Ruler Map | Planetary ruler of the nakshatra (`Vedic.planets.[Planet].nakshatra_lord`) |
| **Sub Lord** | `string` | KP Stellar Division Engine | Krishnamurti Paddhati sub-lord ruler (`KP.planets.[Planet].sub_lord`) |
| **Sub-Sub Lord** | `string` | KP Stellar Division Engine | Krishnamurti Paddhati sub-sub-lord ruler (`KP.planets.[Planet].sub_sub_lord`) |
| **Retrograde (Y/N)** | `boolean` | JHora Raw API | Indicates if the planet is in retrograde motion (`Vedic.planets.[Planet].is_retrograde`) |
| **Combust (Y/N)** | `boolean` | JHora Raw API | Indicates if the planet is combust with the Sun (`Vedic.planets.[Planet].is_combust`) |
| **Dignity** | `string` | Dignities Engine | Planetary dignity (Exalted, Own, Moolatrikona, Friendly, Enemy, Debilitated) (`Vedic.planets.[Planet].dignity`) |
| **Avasthas** | `string` | Baladi/Jagrat/Deepta Avasthas | Calculated planetary age, alertness, and mood states (`Vedic.planets.[Planet].state`) |
#### Table 3: Astronomical Alignment Parameters
This table indexes the calculated astronomical parameters from the ephemeris.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Julian Day** | `string` | Astronomical Calculation Engine | Derived dynamically from UTC birth moment timestamp (`Astronomical.julian_day_number`) |
| **Sidereal Time** | `string` | Local Sidereal Meridian | Derived dynamically from longitude and UTC birth time (`Astronomical.sidereal_time`) |
| **Obliquity** | `string` | Ecliptic inclination | Obliquity of the ecliptic derived for Julian epoch (`Astronomical.obliquity`) |
| **Sunrise / Sunset** | `string` | Solar Horizon calculation | Calculated solar rise and set times for coordinates (`Astronomical.sunrise` / `sunset`) |
| **Moon Phase** | `string` | Tithi calculation | Angular distance of Moon from Sun at birth (`Astronomical.moon_phase`) |

#### Table 4: Vimshottari Dasha Timeline (To Prana)
This table indexes the calculated multi-tiered dasha progression timelines down to Prana level (Maha -> Antar -> Pratyantar -> Sookshma -> Prana).
* **Primary Information Source / Info Origin:** JHora REST API Server endpoint (`/api/jhora/horoscope`) & Dasha Engine.
* **Logic & Provenance Source:** Nested dasha intervals based on stellar division ratios from birth Moon coordinate.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Mahadasha (Level 1)**| `string` | JHora / Derived | 1st-level Vimshottari dasha ruler and bounds (`Vedic.dashas.vimshottari.[Maha].lord`) |
| **Antardasha (Level 2)** | `string` | JHora / Derived | 2nd-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].lord`) |
| **Pratyantar (Level 3)** | `string` | Derived | 3rd-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].lord`) |
| **Sookshma (Level 4)** | `string` | Derived | 4th-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].[Sookshma].lord`) |
| **Prana (Level 5)** | `string` | Derived | 5th-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].[Sookshma].[Prana].lord`) |

#### Table 5: Ashtottari Dasha Timeline
This table indexes the calculated Ashtottari dasha timeline.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Ashtottari Dasha** | `array` | Ashtottari Dasha Engine | Cyclic Ashtottari periods calculated relative to Nakshatra placements |

#### Table 6: Yogini Dasha Timeline
This table indexes the calculated cyclic Yogini dasha timeline.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Yogini Dasha** | `array` | Yogini Dasha Engine | Cyclic Yogini periods calculated relative to birth Moon Nakshatra |

#### Table 7: KP System Cusps & Planets (KP Engine)
This table indexes the Krishnamurti Paddhati stellar, sub, and sub-sub significators.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Cuspal Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of Placidus house cusps 1 to 12 (`KP.cusps.[House].sub_lord`) |
| **Planet Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of natal planetary placements (`KP.planets.[Planet].sub_lord`) |

#### Table 8: Planet to House Significator Mappings (KP Reverse Lookup)
This table indexes planetary significator levels mapped back to the 12 bhavas/houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Significators** | `array` | KP Significator Engine | Houses signified by planets under KP rules (`KP.planet_significators`) |

#### Table 9: Tropical Western Chart & Aspects (Western Engine)
This table indexes Tropical Western astrology planets, cusps, and aspects.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Tropical Positions**| `object` | Ptolemaic Western Projection | Planets/cusps projected onto Tropical zodiac (`Western.planets` / `cusps`) |
| **Aspects & Orbs** | `array` | Aspect Angle Engine | Calculated aspects with exact orb angles (`Western.aspects`) |

#### Table 10: Esoteric & Alternative Mystical Systems (BaZi & Lal Kitab)
This table indexes Chinese Sexagenary cycle parameters and Lal Kitab house translations / remedies.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Pillars** | `object` | Chinese BaZi Calendar Engine | Stems and branches mapped to birth date-time (`Chinese.pillars`) |
| **Pucca Ghar** | `string` | Lal Kitab Translation | Planet placements translated to Aries-Ascendant house mapping (`Lal_Kitab.houses`) |
| **Remedies** | `object` | Lal Kitab Traditional Book | Specific planetary remedies for natal positions (`Lal_Kitab.remedies`) |

#### Table 11: Planetary Argalas & Obstructions (Interveners)
This table indexes planetary interventions (argala) and their corresponding obstructions (virodhargala) mapped across the 12 houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Argalas** | `object` | Jaimini Planetary Interveners Engine | Structural Jaimini interventions across houses (`Vedic.argalas`) |

#### Table 12: Vedic Raja/Dhana Yogas & Celestial Doshas
This table indexes active auspicious combinations and major cosmic doshas present.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Active Yogas** | `array` | Yogas Evaluation Engine | Auspicious planetary formations |
| **Active Doshas** | `array` | Doshas Evaluation Engine | Inauspicious planetary afflictions |

#### Table 13: Traditional Life Predictions & Daily Muhurta
This table indexes predictive destiny analysis and the current transit-based daily muhurta.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Destiny Pathways** | `object` | Predictive Synthesis Engine | Life forecasts across key domains (Career, Wealth, Health, Marriage) |
| **Transit Muhurta** | `object` | Transit Engine | Daily auspicious and inauspicious hours based on lunar transits |

#### Table 14: Vedic Divisional Charts (Shodashavargas) Matrix
This table indexes 16 divisional charts (Varga structures D1 through D60) compiled relative to the rising Lagna.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Divisional Charts** | `object` | Divisional Chart Calculation Engine | Longitude-based divisional sub-grids (`Vedic.divisional_charts`) |

#### Table 15: Jaimini Arudha Padas (Manifested Projections of Houses)
This table indexes calculated Jaimini Arudhas of all 12 houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Arudhas** | `object` | Pada Projection Engine | Arudha houses calculated relative to house lords (`Jaimini.arudha`) |

#### Table 16: Jaimini Sphutas & Special Lagnas (Hora, Ghati, Bhava & Pranapada)
This table indexes the sensitive Jaimini coordinates and alternative ascendants.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Special Lagnas** | `object` | Jaimini Sphuta Engine | Calculated Hora, Ghati, Bhava, and Pranapada lagnas (`Jaimini.sphutas`) |

#### Table 17: Jaimini Sahams (Arabic Sensitive Points)
This table indexes the exact sensitive degree-moments (sahams) calculated across the celestial zodiac.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Sahams** | `object` | Jaimini Sahams Calculation Engine | Points including Punya, Vidya, etc. (`Vedic.sahams`) |

#### Table 18: Vedic Upgrahas (Secondary Shadow Planets)
This table indexes coordinates, sign placements, and house coordinates of solar secondary shadow planets (Gulika, Mandi, Kaala, etc.).

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Upgrahas** | `object` | Vedic Upgrahas Calculation Engine | Solar shadows calculated relative to sunrise-sunset (`Vedic.upagrahas`) |

#### Table 19: Shadbala Strengths (Rupas & Strength Ratio)
This table indexes calculated planetary strengths in Shadbala rupas across the six distinct sources of power.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Shadbala Rupas** | `float` | Shadbala Engine | Positional, temporal, directional, motional, and aspectual planetary strengths (`Vedic.strengths.shadbala`) |

#### Table 20: Ashtakavarga Bindus (Sarvashtakavarga SAV & BAV)
This table indexes the calculated Ashtakavarga Bindus (both individual planetary BAV and Sarvashtakavarga SAV sums).

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **SAV Bindus** | `array` | Ashtakavarga Engine | 12 rasis' samudhaya bindus (`Vedic.strengths.ashtakavarga.sav`) |
| **BAV Bindus** | `object` | Ashtakavarga Engine | Planetary bindu distributions across zodiac signs (`Vedic.strengths.ashtakavarga.bav`) |

#### Table 21: Bhava Bala (House Strength & Relative Ranks)
This table indexes calculated strength quotients in Shashtiamsas and strength rankings of the 12 houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Bhava Strength** | `object` | Bhava Bala Engine | Total house strength coefficients and relative ranks (`Vedic.strengths.bhava_bala`) |

#### Table 22: Ishtaphala & Kashtaphala (Auspiciousness Index)
This table indexes the mathematical auspiciousness (Ishta) versus difficulty (Kashta) indices derived for each planet.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Ishta Phala** | `object` | Ishtaphala Engine | Auspicious planetary power coefficient out of 60 (`Vedic.strengths.ishta_phala`) |
| **Kashta Phala** | `object` | Ishtaphala Engine | Difficult planetary coefficient out of 60 (`Vedic.strengths.kashta_phala`) | |

---

## II. MASTER ASTROLOGICAL RULE ENGINE SPECIFICATION v1.0

```text
###############################################
# ASTROLOGICAL RULE ENGINE SPECIFICATION v1.0 #
###############################################

ENGINE
{
    MODULES
    {
        NatalEngine
        ActivationEngine
        DailyEngine
        RuleCompiler
        RuleCache
        DecisionEngine
        EvidenceEngine
        EventBook
    }
}

#################################################
# RULE OBJECT
#################################################

Rule
{
    RuleID
    Category
    EventID
    System
    Stage

    Inputs[]
    Operator
    Expected

    Priority

    Weight

    Enabled

    Evidence

    Result
}

#################################################
# STAGES
#################################################

Stage =

NATAL
ACTIVATION
DAILY

#################################################
# NATAL ENGINE
#################################################

INPUTS

Birth Chart
Cusps
Planets
Stars
Subs
SSL
House Lords
Karakas
Divisional Charts

RUN

KP Rules

↓

Parashari Rules

↓

Jaimini Rules

↓

Decision Engine

OUTPUT

PASS

FAIL

WEAK

MODERATE

STRONG

#################################################
# ACTIVATION ENGINE
#################################################

INPUTS

Current DBA

Current Vimshottari

Current Chara Dasha

Transit Jupiter

Transit Saturn

Transit Rahu

Transit Ketu

OUTPUT

Window Open

Window Weak

Window Closed

#################################################
# DAILY ENGINE
#################################################

INPUTS

Transit Planet

Transit Star

Transit Sub

Natal Planet

Natal Star

Natal Sub

SSL

Planet DNA

House Activation

RUN

Planet

↓

Star

↓

Sub

↓

Natal Planet

↓

Natal Star

↓

Natal Sub

↓

SSL

↓

Rule Evaluation

OUTPUT

Mood

Behaviour

Daily Themes

Energy

Communication

Finance

Travel

Creativity

Stress

Meditation

#################################################
# DAILY EVENT FILTER
#################################################

Allowed

Mood

Behaviour

Energy

Learning

Travel

Communication

Productivity

Meetings

Health Trends

Creativity

Social

Focus

Blocked

Marriage

Promotion

Child Birth

Court Case

Property Purchase

Divorce

Settlement

Inheritance

Major Surgery

Foreign Settlement

#################################################
# NATAL EVENT FILTER
#################################################

Marriage

Second Marriage

Divorce

Love Marriage

Career

Promotion

Business

Children

Property

Education

Litigation

Health

Foreign

Inheritance

Finance

Longevity

#################################################
# DECISION ENGINE
#################################################

KP

PASS/FAIL

Parashari

PASS/FAIL

Jaimini

PASS/FAIL

↓

Final Decision

STRONG

MODERATE

WEAK

CONTRADICTORY

NOT PROMISED

#################################################
# EVIDENCE ENGINE
#################################################

Collect

Matched Rules

Failed Rules

Supporting Houses

Obstructing Houses

Transit Evidence

Planet Evidence

Generate

Human Explanation

Technical Explanation

#################################################
# RULE COMPILER
#################################################

Markdown Rules

↓

Syntax Validation

↓

Conflict Detection

↓

Compile

↓

Compiled JSON

↓

Rule Cache

↓

Reload Engine

###############################################
# RUNTIME
###############################################

Chart

↓

Natal Engine

↓

Activation Engine

↓

Daily Engine

↓

Evidence Engine

↓

Decision Engine

↓

Event Book

↓

UI

###############################################
# RULE TEMPLATE
###############################################

RuleID

KP-REL001-01

Stage

NATAL

System

KP

Input

CSL7

Operator

SIGNIFIES

Expected

2,7,11

Priority

HIGH

Weight

CONFIGURABLE

Result

PASS

###############################################
# EVENT TEMPLATE
###############################################

REL001

Marriage Promise

Stage

NATAL

Rules

KP

PAR

JAI

Output

Promised

Moderate

Strong

Weak

Not Promised

###############################################
# DAILY TEMPLATE
###############################################

DAY001

Emotional Stability

Stage

DAILY

Rules

Transit Moon

Moon Star

Moon Sub

House 1

House 4

House 12

Output

Very High

High

Medium

Low

###############################################
# ENGINE PRINCIPLE
###############################################

NATAL decides IF.

ACTIVATION decides WHEN.

DAILY decides TODAY.

These three stages NEVER override one another.

###############################################################
# PART 13 — EXECUTION PIPELINE
# Unified Astrological Processing Flow
###############################################################

STEP 1
LOAD CHART

↓

Birth Details

Date

Time

Latitude

Longitude

Timezone

↓

Generate

D1

D9

D10

D7

D4

KP Cusps

Planet Positions

Nakshatras

Subs

SSL

House Lords

Natural Karakas

Jaimini Karakas

Arudha

Upapada

Planet Strength

Doshas

Yogas

Planet DNA

↓

Cache All Data

###############################################################

STEP 2

RULE COMPILATION

↓

Load

master_astro_handbook.md

↓

Syntax Validation

↓

Conflict Detection

↓

Rule Compilation

↓

compiled_rules.json

↓

Memory Cache

###############################################################

STEP 3

NATAL PROMISE ENGINE

KP

↓

Evaluate KP Rules

↓

Parashari

↓

Evaluate Classical Rules

↓

Jaimini

↓

Evaluate Jaimini Rules

↓

Decision Engine

↓

Event Promise

PASS

FAIL

WEAK

MODERATE

STRONG

###############################################################

STEP 4

ACTIVATION ENGINE

Load Current

Vimshottari

DBA

Chara Dasha

Transit Jupiter

Transit Saturn

Transit Rahu

Transit Ketu

↓

Evaluate

Activation Rules

↓

Output

Inactive

Weak Window

Moderate Window

Strong Window

###############################################################

STEP 5

DAILY ENGINE

Load

Current Date

↓

Transit Planet

↓

Transit Star

↓

Transit Sub

↓

Natal Planet

↓

Natal Star

↓

Natal Sub

↓

SSL

↓

Planet DNA

↓

House Activation

↓

Daily Rule Evaluation

↓

Daily Output

Mood

Behaviour

Focus

Energy

Travel

Communication

Finance

Meditation

Stress

Creativity

###############################################################

STEP 6

EVENT FILTER

IF Event = Daily

Allow only

Mood

Behaviour

Energy

Communication

Travel

Learning

Productivity

Health Trend

Creativity

Social

ELSE

Reject

Marriage

Promotion

Child Birth

Property

Litigation

Settlement

Divorce

Inheritance

Major Surgery

###############################################################

STEP 7

EVIDENCE ENGINE

Collect

Matched Rules

Failed Rules

House Evidence

Planet Evidence

Transit Evidence

Strength Evidence

Dosha Evidence

Yoga Evidence

↓

Generate

Evidence Report

###############################################################

STEP 8

DECISION ENGINE

KP

PASS/FAIL

↓

Parashari

PASS/FAIL

↓

Jaimini

PASS/FAIL

↓

Decision Matrix

PASS PASS PASS

→ STRONG

PASS PASS FAIL

→ MODERATE

PASS FAIL FAIL

→ WEAK

FAIL PASS PASS

→ CONTRADICTORY

FAIL FAIL FAIL

→ NOT PROMISED

###############################################################

STEP 9

EXPLANATION ENGINE

Generate

Human Explanation

Technical Explanation

Evidence

Failed Rules

Successful Rules

Suggested Timing

Confidence

###############################################################

STEP 10

EVENT BOOK

Store

Event ID

Timestamp

Natal Verdict

Activation Verdict

Daily Verdict

Evidence

Explanation

History

User Notes

###############################################################

STEP 11

USER INTERFACE

Life Report

↓

Today's Forecast

↓

Activation Windows

↓

Evidence Viewer

↓

Rule Viewer

↓

Timeline

↓

Export PDF

###############################################################

CORE PRINCIPLE

IF

↓

NATAL ENGINE

Determines

"Can this event happen?"

WHEN

↓

ACTIVATION ENGINE

Determines

"When is the window open?"

TODAY

↓

DAILY ENGINE

Determines

"What is active today?"

These engines are completely independent.

No Daily Rule can override a failed Natal Promise.

No Transit can create an event that does not exist in the Natal Promise.

Activation only releases what Natal has already promised.

###############################################################

###############################################################
RULE DECISION ENGINE
Decision Processing Framework
###############################################################

PURPOSE

The Rule Decision Engine receives validated rule results from the
Rule Engine and determines the final astrological verdict for each
event without modifying or creating new rules.

###############################################################

INPUT

Compiled Rules

↓

Rule Evaluation Results

↓

Evidence Objects

↓

Planetary Data

↓

House Data

↓

Dasha Data

↓

Transit Data

###############################################################

PROCESS

Load Rule Results

↓

Group by Event ID

↓

Evaluate Rule Dependencies

↓

Check Blocking Rules

↓

Check Supporting Rules

↓

Count Evidence

↓

Resolve Conflicts

↓

Generate Final Verdict

###############################################################

DECISION STATES

PASS

FAIL

PARTIAL

WEAK

MODERATE

STRONG

CONTRADICTORY

NOT PROMISED

###############################################################

SUPPORTING RULES

Supporting rules increase confidence for an event.

Example

Marriage Promise

↓

KP Rule

PASS

↓

Parashari Rule

PASS

↓

Jaimini Rule

PASS

↓

Supporting Evidence = HIGH

###############################################################

BLOCKING RULES

Blocking rules reduce or deny confidence.

Example

Marriage Promise

↓

Severe Affliction Rule

PASS

↓

Marriage Delay Rule

PASS

↓

Marriage Denial Rule

PASS

↓

Decision = CONTRADICTORY

###############################################################

RULE DEPENDENCY

Some rules require another rule to pass before evaluation.

Example

Marriage Timing Rule

depends on

Marriage Promise Rule

If Marriage Promise = FAIL

↓

Marriage Timing = NOT EVALUATED

###############################################################

CONFLICT RESOLUTION

If multiple rules produce opposing results

↓

Evaluate Rule Priority

↓

Evaluate Supporting Evidence

↓

Evaluate Blocking Evidence

↓

Generate Final Decision

###############################################################

DECISION OBJECT

EventID

Rule Results

Supporting Rules

Blocking Rules

Evidence Count

Final Verdict

Confidence Level

Explanation Reference

Timestamp

###############################################################

OUTPUT

The Rule Decision Engine returns a validated decision object to the
next processing stage.

No user-facing interpretation is generated in this module.

###############################################################

REFERENCE

The validated decision object is forwarded to the Event Book module
for storage, explanation generation, timeline management, reporting,
and presentation.

Refer to:

Event Book Manual

###############################################################

ENGINE PRINCIPLE

The Rule Decision Engine never creates rules.

The Rule Decision Engine never modifies rules.

The Rule Decision Engine only evaluates the outcomes produced by the
Rule Engine and produces a deterministic final verdict.

###############################################################

###############################################################
PART 16 — RULE EXECUTION ENGINE
Rule Processing Framework
###############################################################

PURPOSE

The Rule Execution Engine is responsible for executing compiled
astrological rules in a deterministic sequence and returning
validated rule results to the Rule Decision Engine.

The execution engine does not interpret results.
It only evaluates rules.

###############################################################

INPUT

Compiled Rule Library

↓

Natal Chart Data

↓

Planetary Data

↓

House Data

↓

KP Cusps

↓

Nakshatra Data

↓

Sub Lords

↓

Sub-Sub Lords

↓

Divisional Charts

↓

Dasha Data

↓

Transit Data

###############################################################

EXECUTION ORDER

Initialize Engine

↓

Load Compiled Rules

↓

Validate Inputs

↓

Select Applicable Rules

↓

Execute Rules

↓

Generate Rule Results

↓

Generate Evidence

↓

Return Results

###############################################################

RULE EXECUTION PHASES

Phase 1

Input Validation

↓

Phase 2

Rule Selection

↓

Phase 3

Rule Evaluation

↓

Phase 4

Evidence Collection

↓

Phase 5

Result Generation

↓

Phase 6

Return Execution Results

###############################################################

RULE SELECTION

Only enabled rules are executed.

Rules are filtered by

Stage

System

Category

Event

Priority

Dependencies

###############################################################

RULE EXECUTION

Each rule is executed independently.

Rules never modify another rule.

Rules never modify chart data.

Rules only evaluate supplied inputs.

###############################################################

EXECUTION RESULT

RuleID

Execution Status

PASS

FAIL

PARTIAL

UNKNOWN

Evidence

Execution Time

###############################################################

DEPENDENCY CHECK

If dependency exists

↓

Verify dependency

↓

Execute Rule

Otherwise

↓

Skip Rule

###############################################################

ERROR HANDLING

Invalid Input

↓

Missing Data

↓

Missing Dependency

↓

Disabled Rule

↓

Execution Timeout

↓

Return Error Status

###############################################################

PERFORMANCE

Compiled rules remain memory cached.

Chart data is immutable during execution.

Repeated calculations are avoided through cache reuse.

###############################################################

OUTPUT

The Rule Execution Engine returns

Rule Results

Evidence Objects

Execution Metadata

Dependency Status

to

Rule Decision Engine

###############################################################

REFERENCE

Next Module

Rule Decision Engine

Refer to

Rule Decision Engine Manual

###############################################################

ENGINE PRINCIPLES

• Execution is deterministic.
• Execution order is fixed.
• Rules are independent.
• Chart data is read-only.
• No interpretation occurs during execution.
• No Event Book operations occur during execution.
• No UI operations occur during execution.

###############################################################

###############################################################
RULE VALIDATION ENGINE
Validation and Consistency Framework
###############################################################

PURPOSE

The Rule Validation Engine verifies that all executed rule results
are logically consistent, astrologically valid, and complete before
they are accepted by the Decision Engine.

The Validation Engine never creates rules.

The Validation Engine never modifies rules.

The Validation Engine only validates execution results.

###############################################################

INPUT

Rule Execution Results

↓

Evidence Objects

↓

Dependency Status

↓

Chart Data

↓

Event Context

###############################################################

VALIDATION PROCESS

Load Rule Results

↓

Verify Input Completeness

↓

Verify Rule Dependencies

↓

Verify Astrological Consistency

↓

Verify Duplicate Results

↓

Verify Blocking Rules

↓

Verify Supporting Rules

↓

Generate Validation Status

###############################################################

VALIDATION CHECKS

Input Validation

Dependency Validation

Rule Integrity

Evidence Integrity

Duplicate Detection

Conflict Detection

Stage Validation

System Validation

###############################################################

DEPENDENCY VALIDATION

Required Rule

↓

Exists

↓

PASS

Otherwise

↓

FAIL VALIDATION

###############################################################

DUPLICATE VALIDATION

Same RuleID

↓

Same Event

↓

Ignore Duplicate

###############################################################

CONFLICT VALIDATION

Supporting Rule

PASS

↓

Blocking Rule

PASS

↓

Mark

CONFLICT

↓

Forward to Rule Decision Engine

###############################################################

SYSTEM VALIDATION

KP Rules

Validated Independently

↓

Parashari Rules

Validated Independently

↓

Jaimini Rules

Validated Independently

↓

Daily Rules

Validated Independently

###############################################################

VALIDATION STATUS

VALID

INVALID

INCOMPLETE

CONFLICT

SKIPPED

###############################################################

VALIDATION OBJECT

ValidationID

EventID

Validated Rules

Failed Rules

Conflict Rules

Dependency Status

Validation Status

Timestamp

###############################################################

OUTPUT

Validated Rule Results

↓

Rule Decision Engine

###############################################################

REFERENCE

Previous Module

Rule Execution Engine

Next Module

Rule Decision Engine

###############################################################

ENGINE PRINCIPLES

• Validation never executes rules.
• Validation never changes chart data.
• Validation never changes rule definitions.
• Validation only verifies correctness.
• Invalid rule results are rejected before decision making.
• All validation actions are deterministic and repeatable.

###############################################################

###############################################################
PART 18 — CONFIDENCE ENGINE
Confidence Assessment Framework
###############################################################

PURPOSE

The Confidence Engine measures the reliability of the
Decision Engine verdict.

It never changes the final verdict.

It only measures the confidence of that verdict.

###############################################################

INPUT

Decision Object

↓

Evidence Object

↓

Validation Object

↓

Supporting Rules

↓

Blocking Rules

↓

Planet Strength

↓

House Strength

↓

Dasha Support

↓

Transit Support

###############################################################

CONFIDENCE FACTORS

Supporting Rule Count

Blocking Rule Count

Evidence Strength

Rule Priority

Planet Strength

House Strength

Dasha Alignment

Transit Alignment

Validation Status

Conflict Count

###############################################################

CONFIDENCE LEVELS

VERY HIGH

HIGH

MEDIUM

LOW

VERY LOW

###############################################################

PROCESS

Load Decision

↓

Load Evidence

↓

Evaluate Supporting Rules

↓

Evaluate Blocking Rules

↓

Evaluate Validation

↓

Calculate Confidence

↓

Generate Confidence Object

###############################################################

OUTPUT

Confidence Object

↓

Evidence Engine

###############################################################

ENGINE PRINCIPLES

Confidence never changes

PASS

FAIL

STRONG

WEAK

NOT PROMISED

Confidence only measures reliability.

###############################################################
PART 19 — EVIDENCE ENGINE
Evidence Processing Framework
###############################################################

PURPOSE

The Evidence Engine collects all validated astrological evidence
supporting or opposing each decision.

###############################################################

INPUT

Validated Rule Results

↓

Decision Object

↓

Confidence Object

↓

Planet Data

↓

House Data

↓

Transit Data

↓

Dasha Data

###############################################################

PROCESS

Collect Supporting Rules

↓

Collect Blocking Rules

↓

Collect Planet Evidence

↓

Collect House Evidence

↓

Collect Transit Evidence

↓

Collect Dasha Evidence

↓

Generate Evidence Object

###############################################################

OUTPUT

Evidence Object

↓

Explanation Engine

###############################################################

EVIDENCE OBJECT

EvidenceID

EventID

Supporting Rules

Blocking Rules

Planet Evidence

House Evidence

Transit Evidence

Dasha Evidence

Strength Evidence

Confidence Level

Timestamp

###############################################################

ENGINE PRINCIPLES

Evidence is factual.

Evidence never creates interpretations.

Evidence only records validated astrological facts.

###############################################################
PART 20 — EXPLANATION ENGINE
Explanation Generation Framework
###############################################################

PURPOSE

Generate human-readable and technical explanations from
validated evidence.

###############################################################

INPUT

Decision Object

↓

Confidence Object

↓

Evidence Object

###############################################################

PROCESS

Generate Human Explanation

↓

Generate Technical Explanation

↓

Generate Summary

↓

Generate Recommendations

###############################################################

OUTPUT

Explanation Object

↓

Event Book

###############################################################

EXPLANATION OBJECT

ExplanationID

EventID

Human Explanation

Technical Explanation

Summary

Confidence

Evidence Reference

Timestamp

###############################################################

ENGINE PRINCIPLES

Explanation never changes the decision.

Explanation never changes evidence.

Explanation only presents validated information.

###############################################################
PART 21 — API EXECUTION LAYER
###############################################################

PURPOSE

Provide a standardized interface between the Astrological
Rule Engine and external applications.

###############################################################

RESPONSIBILITIES

Receive Chart Requests

↓

Load Cached Rules

↓

Execute Engine

↓

Return Decision Objects

↓

Return Evidence

↓

Return Explanations

↓

Publish Event Book Data

###############################################################

SUPPORTED SERVICES

Birth Chart

Natal Analysis

Activation Analysis

Daily Analysis

Event Search

Timeline

PDF Export

Plugin Requests

###############################################################
PART 22 — PERFORMANCE & CACHE ENGINE
###############################################################

PURPOSE

Optimize runtime execution and eliminate redundant calculations.

###############################################################

CACHE

Compiled Rules

Planet Database

House Database

Transit Cache

Dasha Cache

Chart Cache

Evidence Cache

###############################################################

OPTIMIZATION

Lazy Loading

Memory Cache

Hot Reload

Parallel Rule Evaluation

Immutable Chart Objects

###############################################################
PART 23 — PLUGIN ARCHITECTURE
###############################################################

PURPOSE

Allow external computational modules without changing
the core engine.

###############################################################

SUPPORTED PLUGINS

Western Astrology

Research Modules

Machine Learning

Experimental Rule Sets

Future Astrology Systems

###############################################################

PLUGIN LIFE CYCLE

Install

↓

Validate

↓

Register

↓

Load

↓

Execute

↓

Unload

###############################################################
PART 24 — CONFIGURATION ENGINE
###############################################################

PURPOSE

Manage runtime configuration.

###############################################################

CONFIGURATION

Rule Priority

Confidence Thresholds

Enabled Systems

Plugin Settings

API Settings

Cache Settings

Logging Settings

###############################################################
PART 25 — LOGGING & DIAGNOSTICS
###############################################################

PURPOSE

Maintain complete execution traceability.

###############################################################

LOGS

Execution Logs

Validation Logs

Decision Logs

API Logs

Cache Logs

Plugin Logs

Error Logs

###############################################################
PART 26 — TESTING & VALIDATION FRAMEWORK
###############################################################

PURPOSE

Verify deterministic behaviour of every engine.

###############################################################

TEST TYPES

Unit Tests

Rule Tests

Regression Tests

Historical Chart Tests

Performance Tests

Stress Tests

Integration Tests

###############################################################
PART 27 — SECURITY & VERSIONING
###############################################################

PURPOSE

Maintain integrity of the computational engine.

###############################################################

SECURITY

Rule Integrity

Compiled Rule Verification

Checksum Validation

Access Control

Audit Trail

###############################################################

VERSIONING

Rule Version

Engine Version

Plugin Version

API Version

Database Version

###############################################################
PART 28 — APPENDIX
###############################################################

APPENDIX A

Rule Object Specification

APPENDIX B

Decision Object Specification

APPENDIX C

Evidence Object Specification

APPENDIX D

Validation Object Specification

APPENDIX E

Confidence Object Specification

APPENDIX F

Explanation Object Specification

APPENDIX G

API Object Specification

APPENDIX H

Status Codes

APPENDIX I

Error Codes

APPENDIX J

Naming Conventions

APPENDIX K

Glossary

APPENDIX L

Cross References

###############################################################
FINAL ENGINE EXECUTION FLOW
###############################################################

Birth Data

↓

Chart Generation

↓

Rule Compiler

↓

Rule Cache

↓

Rule Execution Engine

↓

Rule Validation Engine

↓

Rule Decision Engine

↓

Confidence Engine

↓

Evidence Engine

↓

Explanation Engine

↓

Event Book

↓

API Layer

↓

User Interface

↓

Reports

↓

Timeline

↓

PDF Export

###############################################################

CORE ENGINE PRINCIPLE

NATAL ENGINE
Determines IF an event is promised.

↓

ACTIVATION ENGINE
Determines WHEN the promise becomes active.

↓

DAILY ENGINE
Determines TODAY'S transient influences.

↓

RULE EXECUTION ENGINE
Executes deterministic rules.

↓

RULE VALIDATION ENGINE
Verifies correctness and consistency.

↓

RULE DECISION ENGINE
Produces the final astrological verdict.

↓

CONFIDENCE ENGINE
Measures reliability of the verdict.

↓

EVIDENCE ENGINE
Collects all supporting and blocking facts.

↓

EXPLANATION ENGINE
Produces human-readable and technical explanations.

↓

EVENT BOOK
Stores, indexes, and presents the validated results.

No downstream engine may modify an upstream decision.
All processing is deterministic, traceable, auditable, and repeatable.

###############################################################
```


