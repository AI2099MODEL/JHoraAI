# JHoraAI User Profile Analysis Repository

This folder is dedicated to storing results of deep astrological analyses and their corresponding calculated data for specific user profiles, tagged by profile identifiers (such as username, email, birth date, or UID).

## Naming & Tagging Conventions

- **Astrological Analysis Report**: Stored as `<normalized_name>_analysis.md` (Markdown format) or tagged with the profile's unique identifier.
- **Corresponding Calculation Data**: Stored as `<normalized_name>_data.json` containing the raw JSON payloads and computed states.

## AI Assistant Integration

The Master AI Astrologer (`/api/astrology/master-ask`) scans this folder dynamically. Whenever a query is made, it looks for any files tagged with the active user's details, merges their contents, and uses them as deep, authoritative context to answer user queries with perfect precision.
