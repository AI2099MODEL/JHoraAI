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

## Daily Horoscope Engine (KP Only) Architecture Rules

Whenever developing, maintaining, or documenting the Daily Horoscope Engine:
1. **INPUT SPECIFICATION**: Ensure the engine only runs when provided with both the Global Current Sky (transit coordinates, Moon details, Panchanga) and the User Input Cache (birth parameters, current Vimshottari period, natal planet coordinates, cuspal sublords, natal promise).
2. **CONVERGENCE PROCESSING**: Calculate period weights and trigger scores sequentially through DBA -> Transit -> Convergence (Active Planet Objects) -> House Engines.
3. **MODULAR OUTPUT CLUSTERS**: Ensure daily trends are strictly distributed across:
   - **Mood Block**: Uses Houses 1, 3, 4, 5, 6, 12 to yield emotional metrics.
   - **Behaviour Block**: Uses Houses 2, 3, 6, 7, 10, 11 to yield behavioral metrics.
   - **Daily Themes Block**: Uses Primary and Secondary house activations to yield theme probabilities.
4. **DOMAIN EXCLUSION**: Absolutely exclude major life events (Marriage, Promotion, Childbirth, Court, Property Purchase, Foreign Settlement) from daily forecasts, as they are strictly reserved for long-term NJEvent evaluations.

