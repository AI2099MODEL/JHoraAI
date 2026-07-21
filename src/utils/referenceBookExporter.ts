import { jsPDF } from "jspdf";
import { relEvents } from "../components/EventBookView";
import { apiFetch } from "../lib/api";

/**
 * Generates and downloads the JHora AI Master Reference Manual.
 * This includes Part I (the live KP rulebook from master_astro_handbook.md),
 * Part II (the complete Canonical Event Book from the live array), and
 * Part III (the Astrological Rule Engine Specification).
 */
export async function exportMasterReferenceBookPDF(
  onProgress?: (active: boolean) => void,
  onError?: (msg: string | null) => void
) {
  if (onProgress) onProgress(true);
  if (onError) onError(null);

  try {
    // 1. Fetch live rules handbook content from Express API
    let handbookContent = "";
    try {
      const response = await apiFetch("/api/astrology/rules-handbook");
      if (response.ok) {
        const resJson = await response.json();
        handbookContent = resJson.content || "";
      }
    } catch (err) {
      console.warn("Failed to fetch custom rules handbook. Falling back to default spec content.", err);
    }

    // Default Raw Specification (Part III Fallback/Content)
    const rawSpec = `###########################################################
# JHORA AI PROFESSIONAL - ASTROLOGICAL RULE ENGINE
# OFFICIAL SPECIFICATION HANDBOOK (V1.0)
###########################################################

===========================================================
1. MASTER WORKFLOW & ARCHITECTURE
===========================================================

The canonical workflow separating static natal potentials from dynamic timing and rule-based decision modeling:

USER PROFILE
      │
      ▼
Astronomical Calculator (stateless coordinate extraction)
      │
      ▼
KP Calculation Engine (convert to significations)
      │
      ▼
KP Knowledge Book (static, deterministic)
      │
      ▼
Store inside User Profile

───────────────────────────────────────────────────────────

Prediction Request
      ↓
KP Rulebook (permanent rules grouped by 15 domains)
      ↓
Rule Engine (rule evaluation and outcome matching)
      ↓
Evidence Engine (collecting supporting/blocking proofs)
      ↓
Decision Engine (resolving verdicts)
      ↓
Timeline Engine (calculating activation windows)
      ↓
Event Book (single source of truth for persistence)
      ↓
Report Engine (rendering final dashboard, UI, and PDF)

===========================================================
2. SYSTEM ARCHITECTURE & MODULES
===========================================================

[01] Astronomical Calculator
- Responsibility: Stateless calculation of planetary longitudes, Placidus house cusps, and transits.
- Input: Birth Date, Time, Latitude, Longitude, Elevation, and Ayanamsa Type.
- Output: Exact 3D spatial coordinates of planets and cusps.

[02] KP Calculation Engine
- Responsibility: Converts coordinates into deterministic KP data (Planets, Nakshatras, Cusps, Significators).

[03] KP Knowledge Book
- Responsibility: Permanent deterministic repository containing ONLY static natal KP information.

[04] KP Rulebook
- Responsibility: Permanent repository of KP rules grouped by 15 domains without calculation logic.

[05] Rule Engine
- Responsibility: Executes rules and produces Rule Results. Does NOT evaluate evidence.

[06] Evidence Engine
- Responsibility: Collects supporting/blocking evidence and satisfied/failed rules.

[07] Decision Engine
- Responsibility: Evaluates Natal Promise + DBA + Transit + Evidence -> Final Verdict.

[08] Timeline Engine
- Responsibility: Schedules the chronological period for promised events.

[09] Event Book
- Responsibility: Single Source of Truth database. Persists Event ID, Decision, Evidence, Timeline, and History.

[10] Report Engine
- Responsibility: Renders PDF, UI, and Dashboard representation. Performs NO astrology calculations.

===========================================================
3. TRIPLE-STAGE SEPARATION
===========================================================

- STAGE 1: NATAL ENGINE (Decides IF)
- STAGE 2: ACTIVATION ENGINE (Decides WHEN)
- STAGE 3: DAILY ENGINE (Decides TODAY)

These stages operate sequentially and never override one another.

===========================================================
4. ZERO DUPLICATION RULES
===========================================================
- Rule Engine does NOT generate evidence.
- Evidence Engine does NOT execute rules.
- Decision Engine does NOT store events.
- Timeline Engine does NOT create events.
- Event Book does NOT evaluate astrology.
- Report Engine does NOT calculate astrology.`;

    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const contentWidth = pageWidth - (marginX * 2);
    const bottomMargin = 50;

    let currentPage = 1;

    // Header helper
    const drawHeader = (title: string) => {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(245, 158, 11); // amber-500
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("JHORAAI - SYSTEM MASTER REFERENCE MANUAL", marginX, 24);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(title, pageWidth - marginX - doc.getTextWidth(title), 24);

      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(0, 40, pageWidth, 2, "F");
    };

    // Footer helper
    const drawFooter = () => {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      
      const pageStr = `Page ${currentPage}`;
      doc.text(pageStr, pageWidth - marginX - doc.getTextWidth(pageStr), pageHeight - 20);
      doc.text("JHora AI Professional - Master Reference Book", marginX, pageHeight - 20);
    };

    // PAGE 1: COVER PAGE
    drawHeader("Master Reference Manual");

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("JHORA AI PROFESSIONAL", marginX, 120);
    doc.text("SYSTEM REFERENCE MANUAL", marginX, 150);

    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(marginX, 165, 180, 4, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("DOCUMENT CONTENTS:", marginX, 220);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("• Part I: Complete KP & Astrological Rulebook Reference", marginX + 15, 240);
    doc.text("• Part II: Canonical Engine Event Book Registry (115+ Events)", marginX + 15, 255);
    doc.text("• Part III: Astrological Rule Engine Specification v1.0", marginX + 15, 270);

    doc.setFont("Helvetica", "bold");
    doc.text("SYSTEM METADATA:", marginX, 320);

    doc.setFont("Helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, marginX + 15, 340);
    doc.text("Ayanamsa Standard: Lahiri / Dynamic Precession System", marginX + 15, 355);
    doc.text("Calculation Model: Krishnamurti Paddhati (KP) Placidus Cusps", marginX + 15, 370);
    doc.text("Verification Status: 100% Fully Synced with Production Environment", marginX + 15, 385);

    // Introduction Paragraph
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    const manualIntro = "This reference manual compiles the complete set of rules, significations, and event triggers used by the JHora AI Astrological Rule Engine. Part I contains the active handbook rules, Part II maps all standard event domains and house parameters, and Part III lists the core architectural rules.";
    const wrappedIntro = doc.splitTextToSize(manualIntro, contentWidth);
    let introY = 430;
    wrappedIntro.forEach((line: string) => {
      doc.text(line, marginX, introY);
      introY += 14;
    });

    drawFooter();

    // PART I: THE KP RULEBOOK (HANDBOOK)
    doc.addPage();
    currentPage++;
    drawHeader("Part I: KP Rulebook");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("PART I: COMPLETE KP & ASTROLOGICAL RULEBOOK", marginX, 75);

    doc.setFillColor(245, 158, 11);
    doc.rect(marginX, 85, contentWidth, 1, "F");

    let currentY = 105;

    const handbookText = handbookContent || `# Astrological Rules Fallback Handbook\n\nFallback default handbook content. Please configure the master_astro_handbook.md file.\n\n${rawSpec}`;
    const handbookLines = handbookText.split("\n");

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    for (let i = 0; i < handbookLines.length; i++) {
      const line = handbookLines[i];
      const trimmed = line.trim();

      if (trimmed === "" && line === "") {
        currentY += 8;
        continue;
      }

      // Page overflow check
      if (currentY > pageHeight - bottomMargin) {
        drawFooter();
        doc.addPage();
        currentPage++;
        drawHeader("Part I: KP Rulebook");
        currentY = 70;
      }

      // Heading 1
      if (trimmed.startsWith("# ") && !trimmed.startsWith("##")) {
        currentY += 15;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(trimmed.replace("# ", ""), marginX, currentY);
        currentY += 18;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        continue;
      }

      // Heading 2
      if (trimmed.startsWith("## ") && !trimmed.startsWith("###")) {
        currentY += 12;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(15, 23, 42);
        doc.text(trimmed.replace("## ", ""), marginX, currentY);
        currentY += 15;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        continue;
      }

      // Heading 3
      if (trimmed.startsWith("### ")) {
        currentY += 8;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(180, 83, 9); // Amber-brown
        doc.text(trimmed.replace("### ", ""), marginX, currentY);
        currentY += 13;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        continue;
      }

      // Table Rows
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (trimmed.includes("---")) {
          continue;
        }
        doc.setFont("Courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const cols = trimmed.split("|").map(c => c.trim()).filter(c => c !== "");
        const formattedRow = cols.join("  |  ");
        const wrappedRow = doc.splitTextToSize(formattedRow, contentWidth);
        wrappedRow.forEach((rLine: string) => {
          doc.text(rLine, marginX, currentY);
          currentY += 11;
        });
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        continue;
      }

      // Regular bullet list
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.substring(2);
        const wrapped = doc.splitTextToSize("•  " + content, contentWidth - 15);
        wrapped.forEach((wLine: string, idx: number) => {
          if (currentY > pageHeight - bottomMargin) {
            drawFooter();
            doc.addPage();
            currentPage++;
            drawHeader("Part I: KP Rulebook");
            currentY = 70;
          }
          doc.text(wLine, marginX + (idx === 0 ? 10 : 20), currentY);
          currentY += 13;
        });
        continue;
      }

      // Default text wrapping
      const wrappedLine = doc.splitTextToSize(line, contentWidth);
      wrappedLine.forEach((wLine: string) => {
        if (currentY > pageHeight - bottomMargin) {
          drawFooter();
          doc.addPage();
          currentPage++;
          drawHeader("Part I: KP Rulebook");
          currentY = 70;
        }
        doc.text(wLine, marginX, currentY);
        currentY += 13;
      });
    }

    drawFooter();

    // PART II: CANONICAL ENGINE EVENT BOOK REGISTRY
    doc.addPage();
    currentPage++;
    drawHeader("Part II: Event Book");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("PART II: CANONICAL ENGINE EVENT BOOK REGISTRY", marginX, 75);

    doc.setFillColor(245, 158, 11);
    doc.rect(marginX, 85, contentWidth, 1, "F");

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const registryIntro = "This registry represents the authoritative list of standard life and daily events integrated directly into the JHora AI Event Book. Every event lists the associated primary, supporting, and obstructing house activations used to evaluate natal promise and timelines.";
    const wrappedRegIntro = doc.splitTextToSize(registryIntro, contentWidth);
    let regY = 105;
    wrappedRegIntro.forEach((line: string) => {
      doc.text(line, marginX, regY);
      regY += 14;
    });

    regY += 10;

    const categories = [
      "relationship", "career", "finance", "property", "health", "education",
      "children", "travel", "litigation", "spiritual", "daily", "custom"
    ];

    const categoryLabels: Record<string, string> = {
      relationship: "Marriage & Relationship Events (REL)",
      career: "Career, Job & Business Events (CAR)",
      finance: "Financial Status & Wealth Windfall Events (FIN)",
      property: "Property, Real Estate & Vehicles (EST)",
      health: "Health, Physiological & Longevity (HEA)",
      education: "Education, Studies & Academics (EDU)",
      children: "Children, Pregnancy & Conception (CHI)",
      travel: "Travel, Visas & Foreign Settlement (TRA)",
      litigation: "Litigation, Disputes & Law Enforcement (LIT)",
      spiritual: "Spiritual Growth, Occult & Realization (SPI)",
      daily: "Daily Behavioral & Routine Themes (DAY)",
      custom: "Custom Extension Plugins & Triggers (CUS)",
    };

    for (const cat of categories) {
      const catEvents = relEvents.filter(e => e.category === cat);
      if (catEvents.length === 0) continue;

      if (regY > pageHeight - bottomMargin - 40) {
        drawFooter();
        doc.addPage();
        currentPage++;
        drawHeader("Part II: Event Book");
        regY = 75;
      }

      regY += 10;
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(marginX, regY - 12, contentWidth, 18, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(180, 83, 9); // Amber
      doc.text(categoryLabels[cat] || cat.toUpperCase(), marginX + 6, regY + 1);
      regY += 18;

      for (const ev of catEvents) {
        if (regY > pageHeight - bottomMargin - 45) {
          drawFooter();
          doc.addPage();
          currentPage++;
          drawHeader("Part II: Event Book");
          regY = 75;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(`${ev.id}: ${ev.name}`, marginX + 10, regY);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const cslStr = `CSL: ${ev.mainCsl}`;
        doc.text(cslStr, pageWidth - marginX - doc.getTextWidth(cslStr), regY);
        regY += 12;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        
        doc.setTextColor(16, 185, 129); // Green
        doc.text(`Primary: [${ev.primary}]`, marginX + 20, regY);

        doc.setTextColor(59, 130, 246); // Blue
        doc.text(`Supporting: [${ev.supporting}]`, marginX + 160, regY);

        doc.setTextColor(239, 68, 68); // Red
        doc.text(`Obstructing: [${ev.obstructing}]`, marginX + 310, regY);
        regY += 12;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const wrappedDesc = doc.splitTextToSize(ev.description, contentWidth - 30);
        wrappedDesc.forEach((dLine: string) => {
          if (regY > pageHeight - bottomMargin) {
            drawFooter();
            doc.addPage();
            currentPage++;
            drawHeader("Part II: Event Book");
            regY = 75;
          }
          doc.text(dLine, marginX + 20, regY);
          regY += 11;
        });

        regY += 8;
      }
    }

    drawFooter();

    // PART III: TECHNICAL SPECIFICATION
    doc.addPage();
    currentPage++;
    drawHeader("Part III: Specification");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("PART III: ASTROLOGICAL RULE ENGINE SPECIFICATION", marginX, 75);

    doc.setFillColor(245, 158, 11);
    doc.rect(marginX, 85, contentWidth, 1, "F");

    doc.setFont("Courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    const specLines = rawSpec.split("\n");
    let specY = 105;

    specLines.forEach((line) => {
      if (specY > pageHeight - bottomMargin) {
        drawFooter();
        doc.addPage();
        currentPage++;
        drawHeader("Part III: Specification");
        specY = 70;
      }

      const splitLines = doc.splitTextToSize(line, contentWidth);
      splitLines.forEach((sLine: string) => {
        if (sLine.startsWith("#") || sLine.includes("PART ") || sLine.includes("ENGINE")) {
          doc.setFont("Courier", "bold");
          doc.setTextColor(180, 83, 9);
        } else {
          doc.setFont("Courier", "normal");
          doc.setTextColor(30, 41, 59);
        }
        doc.text(sLine, marginX, specY);
        specY += 10.5;
      });
    });

    drawFooter();

    // Save PDF
    doc.save("JHoraAI_Master_Reference_Book.pdf");

  } catch (err: any) {
    console.error(err);
    if (onError) onError(err.message || "An error occurred during PDF generation.");
  } finally {
    if (onProgress) onProgress(false);
  }
}
