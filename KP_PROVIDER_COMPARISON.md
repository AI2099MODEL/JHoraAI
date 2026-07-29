# KP Stellar Astrology Provider Comparison

This document provides a comparative analysis of the leading astrological engines and API providers for **Krishnamurti Paddhati (KP) Stellar Astrology**, evaluating them on readiness, licenses, maintenance, self-hosting capability, and native KP feature coverage.

---

## 1. Executive Summary

| Provider | Type | Core Language | License | KP Suitability | Recommendation |
|---|---|---|---|---|---|
| **VedicAstro** *(Custom Sidecar)* | Self-Hosted API | Python | Open-Source / MIT | **EXCELLENT** | **Primary Choice for KP** |
| **AstrologyAPI.com** | Commercial API | Cloud REST | Proprietary | **HIGH** | Secondary (Premium Cloud fallback) |
| **Prokerala Astrology API** | Commercial API | Cloud REST | Proprietary | **HIGH** | Secondary (Premium Cloud fallback) |
| **VedAstro** | Open-Source | C# (.NET) | MIT | **LOW** | Not Recommended (Traditional Vedic only) |
| **Jyotish API** *(JyotishAPI.com)*| Commercial API | Cloud REST | Proprietary | **MEDIUM** | Not Recommended (Basic Vedic planetary lords only) |
| **OpenKundali** | Open-Source | Python / JS | GPL-3.0 | **NONE** | Unsuitable (Basic Parashari Kundli only) |
| **Kerykeion** | Open-Source | Python | GPL-3.0 | **NONE** | Unsuitable (Western Astrology only) |

---

## 2. In-Depth Comparison Table

| Comparative Dimension | VedicAstro (Sidecar) | AstrologyAPI.com | Prokerala API | VedAstro | Jyotish API (Commercial) | Kerykeion |
|---|---|---|---|---|---|---|
| **License / Cost** | MIT / $0 (Local/Self-host) | Paid ($15 - $150+/mo) | Paid ($15 - $150+/mo) | MIT / $0 | Paid ($19 - $99/mo) | GPL-3.0 / $0 |
| **Git Stars / Activity** | Proprietary (Built-in) | Closed SDKs (~20 stars) | Closed SDKs | ~250+ / High | Closed SDKs | ~450+ / High |
| **Swiss Ephemeris Support**| Yes (`pyswisseph`) | Yes | Yes | Yes | Yes | Yes (`pyswisseph`) |
| **Self-Hosting Ready** | **100% (FastAPI/Docker)** | No (Cloud Only) | No (Cloud Only) | Yes (Docker/.NET Core) | No (Cloud Only) | Yes (Python package) |
| **Authentication Needs** | None (Internal Proxy) | API Key & App ID | OAuth 2.0 / Client ID| None | API Key | None |
| **Rate Limits** | Unlimited | Plan-based (1k-50k/mo)| Plan-based (1k-50k/mo)| Unlimited | Plan-based | Unlimited |
| **Vimshottari Dashas** | Fully Supported | Fully Supported | Fully Supported | Fully Supported | Fully Supported | Not Supported |
| **KP Sublord Divisions** | **100% Math Accurate** | Fully Supported | Fully Supported | Not Supported | Not Supported | Not Supported |
| **Astro-Calculations** | Local / Offline | Remote HTTP Calls | Remote HTTP Calls | Local / Remote API | Remote HTTP Calls | Local / Offline |

---

## 3. Detailed Provider Profiles

### A. VedicAstro (Custom Python Sidecar)
*   **Aesthetic & Technical Vibe:** Highly precise, optimized, and localized. 
*   **Architecture:** Designed as a Python-based FastAPI service wrapping the Swiss Ephemeris (`pyswisseph`) and utilizing Python's `flatlib` for core chart structures. Custom mathematical overlays calculate the precise KP 1-249 sublord and sub-sublord spans recursively, as well as planet/house significators.
*   **Pros:** 
    *   **Zero execution cost:** High-performance local calculations with zero recurring billing.
    *   **Absolute data privacy:** No user birth details ever leave the hosting container, matching enterprise security standards.
    *   **Microsecond latencies:** Zero network latency overhead compared to external HTTP requests.
    *   **Scale-to-zero ready:** 100% stateless Docker image ready for serverless deployments like Google Cloud Run.
*   **Cons:** Requires manual server deployment (handled smoothly by sidecar configuration).

### B. AstrologyAPI.com
*   **Aesthetic & Technical Vibe:** Enterprise-grade cloud service.
*   **Architecture:** Closed-source cloud REST API. Requires API authentication.
*   **Pros:** Robust, multi-language SDKs (Node, PHP, Python), rich features covering both Western and Vedic. High uptime SLAs.
*   **Cons:** Expensive at scale; exposes sensitive user coordinates and birth data to a third-party server; subject to network failures and rate limits.

### C. Prokerala Astrology API
*   **Aesthetic & Technical Vibe:** High-fidelity regional astrology.
*   **Architecture:** High-performance REST API specialized in Indian Vedic and KP astrology systems.
*   **Pros:** Native, highly accurate KP astrology plans including cusps, planet-wise star/sub/sub-sub lords, and detailed planet/house significator matrices. Great documentation and developer support.
*   **Cons:** Commercial subscription model; requires outbound HTTP traffic which increases page load times.

### D. VedAstro
*   **Aesthetic & Technical Vibe:** Open-source .NET enthusiast project.
*   **Architecture:** Written primarily in C# (.NET Core) with Python and JavaScript wrappers. Offers a free public API.
*   **Pros:** Active community, excellent documentation, beautiful web client, fully open source.
*   **Cons:** No native support for Krishnamurti Paddhati (KP) subdivisions (no KP 1-249 sublords, no planet/house ABCD significator rules). It is optimized for traditional Parashari (Vedic) astrology.

### E. Jyotish API (JyotishAPI.com)
*   **Aesthetic & Technical Vibe:** Simplified modern REST API.
*   **Pros:** Clean JSON structures for standard Vedic calculations, easy-to-use endpoints.
*   **Cons:** Lacks deep KP features. Does not calculate KP ABCD significator tables, cuspal interlinks, or KP Horary coordinates.

### F. Kerykeion & OpenKundali
*   **Aesthetic & Technical Vibe:** Highly specialized.
*   **Verdict:** Both are **unusable** for KP. Kerykeion is purely Western (tropical longitude, modern house systems, no concept of nakshatras, star lords, or dashas). OpenKundali is a basic, inactive Python/JS repository that produces standard Parashari rasi wheels, lacking any advanced mathematical divisions required by KP Stellar Astrology.
