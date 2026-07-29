# Agent Instructions & Project Rules

This file documents the persistent instructions, project rules, and developer preferences for AI Coding Agents working on this project.

## GitHub Operations Preference

- **Automatic Commits & Push**: The user prefers to have all changes pushed to GitHub by default after every meaningful change.
- **Workflow**:
  1. Make the necessary code modifications and ensure successful compilation (`npm run build` or `compile_applet` tool).
  2. Stage the changes: `git add .`
  3. Create an informative, conventional commit message: `git commit -m "..."`
  4. Push directly to the remote repository: `git push origin main`

## Technical & Architecture Rules

- **KP Dasha Alignments**: Keep Krishnamurti Paddhati (KP) dasha ranges aligned to the user's main dynamic birth particulars timeline to avoid showing static placeholder dates.
- **Vedic Multi-System Layout**: Maintain clear sub-menus and divisional alignments within the dashboard report view structure.
- **Astrological Engine Rules Execution**: Whenever executing, updating, or running the astrological engine, agents MUST strictly reference and map rules and events from the *Astrological Rules Handbook* and the *KP Eventbook* (representing primary, supporting, and obstructing house significations). All calculations should align with these established sources rather than using generic or arbitrary logic.
- **Strict UserProfile Data Strategy**: Do NOT generate any astrological data while creating or persisting the UserProfile. The UserProfile must remain a strictly persistent archive of raw API responses only (from the JHora/VedicAstro endpoints). Do NOT perform any local calculations, normalization, mappings, interpretations, harmonics, divisional charts, friendships, dignities, strengths, or reports during profile storage. Do NOT add transit data or sky JSON updates. It is strictly a raw data fetch with zero client-side or server-side pre-calculations, preserving the raw response exactly as-is. Mappings and interpretations must only be done at render/run-time or in separate transient application logic, never embedded within the stored profile.

## Baseline Core Rules (Strict Raw Presentation Baseline)

Agents working on this repository MUST strictly abide by these baseline instructions:
1. **FETCH RAW DATA FROM API**: Under no circumstances should agents run client-side or server-side pre-computations, calculations, or generate any transit forecasts or overlays during data fetch. The raw responses from JHora or VedicAstro REST gateways must be fetched precisely as they are and stored locally inside the UserProfile.
2. **DISPLAY ALL DATA IN THE FORM OF TABLES**: Within the Astro systems menu structures, all displayed data must be formatted and presented cleanly in the form of tabular, raw data tables without any on-the-fly calculations, transits, or dynamic overlays. This ensures a 100% stable presentation matching the stored JSON payloads exactly.
3. **INDEX ALL TABLES STARTING FROM JH1 TILL END**: In the Astro systems registry menu, tables must be strictly indexed from JH1 to JH19 consecutively to maintain cohesive mapping reference bounds. Ensure complete raw JSON payloads can be inspected, and keep the PDF export and raw JSON download functions fully preserved and integrated inside this Astro module.

## Daily Horoscope Engine (KP Only) Architecture Rules & Strict Logic Lock

**CRITICAL RULE: STRICT LOGIC LOCK ON "MY TODAY" ENGINE & EPHEMERIS**
- The calculation logic for the **"My Today" Engine**, **5-Level Vimshottari DBA Stack (Mahadasha - Antardasha - Pratyantardasha - Sookshmadasha - Pranadasha)**, and the **Meeus Astronomical Ephemeris calculations** is STRICTLY LOCKED.
- Under NO circumstances should AI Agents alter, recalculate from scratch, or modify the core "My Today" engine logic or ephemeris formulas without explicit user authorization and confirmation.
- The 5-level DBA details must always be referenced directly from the user profile `AstroDetails` and 7-layer mood stack without recalculation or skipping levels.

Whenever developing, maintaining, or documenting the Daily Horoscope & Mood Engine:
1. **INPUT SPECIFICATION**: Ensure the engine only runs when provided with both the Global Current Sky (transit coordinates, Moon details, Panchanga) and the User Input Cache (birth parameters, current Vimshottari period, natal planet coordinates, cuspal sublords, natal promise).
2. **7-LAYER MOOD STACK**:
   - MD (Mahadasha)
   - AD (Antardasha)
   - PD (Pratyantardasha)
   - SD (Sukshmadasha)
   - PrD (Prana Dasha)
   - Current Moon Nakshatra (Star Lord)
   - Current Moon Sign (Ruler)
3. **CONVERGENCE & FREQUENCY EVALUATION**:
   - Aggregate frequencies across all 7 layers of house significations.
   - Primary combinations focus on high-frequency KP house clusters matched directly against the *KP Eventbook*.
   - Secondary modifiers: Moon Prana Layer & Moon Sign Overlay.
4. **DOMAIN EXCLUSION**: Absolutely exclude major life events (Marriage, Promotion, Childbirth, Court, Property Purchase, Foreign Settlement) from daily forecasts, as they are strictly reserved for long-term NJEvent evaluations.

## Daily Mood Engine Report Format

The output for the Daily Mood Engine must strictly follow this clean bullet-line format with Summary Guidance and Planetary Influences:

```markdown
### 🌟 Primary KP Eventbook Combination Matches

- **Domestic Pressure & Need for Rest**
  - High domestic focus accompanied by mental fatigue or overthinking.
  - Strong urge to withdraw from routine friction and seek quiet solitude at home.

- **Personal & Family Interactions**
  - Direct engagement with family members, partner, or home environment.
  - Conversations center around domestic responsibilities and personal space.

- **Partnership Friction & Unexpressed Thoughts**
  - Potential for minor misunderstandings or sensitive discussions with partners.
  - Favors quiet introspection over intense public or commercial debates.

- **Deep Analytical Research & Self-Introspection**
  - Excellent for deep problem-solving, confidential work, or technical study.
  - Caution needed against physical fatigue or unnecessary anxiety.

---

### 🌗 Secondary Modifiers ([Prana] Prana & [MoonSign] Moon Sign Overlay)

- **Moon Prana Layer**: Brings temporary waves of emotional warmth, creative ideas, and brief moments of desire fulfillment.
- **Jupiter Moon Sign Layer**: Injects practical duty, higher perspective, and career/duty alignment to keep day-to-day work moving smoothly despite inner fatigue.

---

### 🎛️ Final Mood Parameters & Overall Score

- **Overall Daily Mood**: Moderate / Introspective (Rating: 3.5 / 5 Stars)
- **Energy Level**: Moderate (Needs pacing)
- **Mental Clarity**: Deep & Analytical (High focus on single tasks)
- **Stress Level**: Medium (Elevated by internal reflection)
- **Communication**: Selective & Direct
- **Productivity**: Very High for solitude/research tasks; Moderate for social tasks

---

### 🪐 Planetary Influences & Key Drivers

- **Challenging Planets**: Saturn, Mars, Rahu

#### 🟢 Positive Reasons:
- Exalted Jupiter in Cancer activating House 10 career & status axis for Native
- Mercury in Gemini fueling excellent communication and decision quality
- Providing multi-layered mental stability
- Transit Moon in Nakshatra under Star Lord Moon and Sub Lord Venus enhancing focus and vitality

#### 🔴 Negative Reasons:
- Retrograde Saturn in House 6 requires steady routine discipline to avoid mild fatigue

---

### 💡 Summary Guidance

#### Best For:
- Home-based work, confidential analysis, and deep research.
- Rest, meditation, emotional healing, and quiet planning.
- Resolving pending household or documentation tasks.

#### Avoid:
- Unnecessary arguments or confrontation with partners.
- Overcommitting to large social gatherings or heavy travel schedules today.
- Making impulsive financial or personal commitments under stress.
```

