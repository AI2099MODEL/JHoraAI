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
