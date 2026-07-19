# Predictions Module

## Purpose

This module generates all predictions produced by JHoraAI Professional.

The prediction engine **does not perform raw astrology calculations**.
It consumes precomputed astrology data from the engine and applies prediction logic.

---

## Inputs

Prediction Engine receives:

- static_data.json
- birth profile
- computed natal chart
- computed divisional charts
- computed dashas
- computed strengths
- computed yogas
- computed doshas
- computed KP data
- computed Jaimini data
- computed Ashtakavarga
- computed transits
- computed event engine data
- user preferences

---

## Output

Produces:

- Daily Prediction
- Weekly Prediction
- Monthly Prediction
- Yearly Prediction
- Life Area Predictions
- Event Predictions
- Probability Scores
- Confidence Scores
- AI Explanation
- Remedies
- Supporting Factors
- PDF Report

---

## Responsibilities

Prediction module:

✓ Scoring
✓ Ranking
✓ AI Narrative
✓ Confidence Calculation
✓ Event Prioritization
✓ Conflict Resolution
✓ Recommendation Engine

Prediction module DOES NOT:

✗ Calculate planetary positions
✗ Calculate dashas
✗ Calculate yogas
✗ Calculate strengths
✗ Calculate KP significators
✗ Calculate divisional charts

Those are supplied by the astrology engine.

---

## Folder Structure

predictions/
│
├── README.md
├── prediction_schema.json
├── engine_config.json
├── scoring_rules.json
├── confidence_model.json
├── weights.json
├── priorities.json
├── templates.json
├── prompts.json
├── remedies.json
└── ai_output_schema.json
