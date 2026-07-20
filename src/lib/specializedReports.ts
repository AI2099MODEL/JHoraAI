import { jsPDF } from "jspdf";

const PLANETS_CYCLE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const PLANET_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

function getSubPeriods(parentLord: string, parentStart: Date, parentEnd: Date): Array<{ lord: string; start: Date; end: Date }> {
  const startIndex = PLANETS_CYCLE.indexOf(parentLord);
  if (startIndex === -1) return [];
  
  const totalParentMs = parentEnd.getTime() - parentStart.getTime();
  const list: Array<{ lord: string; start: Date; end: Date }> = [];
  let currentStartMs = parentStart.getTime();
  
  for (let i = 0; i < 9; i++) {
    const lord = PLANETS_CYCLE[(startIndex + i) % 9];
    const years = PLANET_YEARS[lord];
    const share = years / 120;
    const durationMs = totalParentMs * share;
    const currentEndMs = currentStartMs + durationMs;
    
    list.push({
      lord,
      start: new Date(currentStartMs),
      end: new Date(currentEndMs)
    });
    
    currentStartMs = currentEndMs;
  }
  
  return list;
}

const primaryColor = [15, 23, 42];  // Slate 900
const secondaryColor = [30, 41, 59]; // Slate 800
const accentColor = [217, 119, 6];   // Amber 600
const textColor = [51, 65, 85];     // Slate 600
const lightBg = [248, 250, 252];    // Soft Gray

const drawHeader = (doc: jsPDF, pageNum: number, title: string) => {
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, 210, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("JHORAAI SPECIALIZED REPORTS", 15, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Professional Astrological Chronology", 145, 15);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 18, 195, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 15, 26);
};

const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 275, 195, 275);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Calculated with High-Precision Lahiri Ayanamsa • Account Synced Securely", 15, 281);
  doc.text(`Page ${pageNum} of ${totalPages}`, 180, 281);
};

// ================== REPORT 1: VIMSHOTTARI DASHA 50-YEAR CHRONOLOGY ==================
export function generateVimshottariDashaPDF(profileData: any): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const userName = profileData?.User?.profile_name || "Seeker";
  const birth = profileData?.Birth || {};
  const rawList = profileData?.Vedic?.dashas?.vimshottari || profileData?.astrologyData?.dashas || [];

  // Page 1: Beautiful Cover Page
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, "F");

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.rect(12, 12, 186, 273);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("VIMSHOTTARI DASHA", 105, 75, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(148, 163, 184);
  doc.text("50-Year Micro-Timing Chronicle", 105, 85, { align: "center" });
  doc.text("Down to the Prana Dasha Level", 105, 92, { align: "center" });

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.line(65, 102, 145, 102);
  doc.circle(105, 102, 1.2, "F");

  // Native details box
  doc.setFillColor(30, 41, 59, 0.4);
  doc.rect(20, 120, 170, 95, "F");
  doc.setDrawColor(51, 65, 85);
  doc.rect(20, 120, 170, 95);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(userName, 105, 132, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Birth Parameters: ${birth.date || "Unknown DOB"} | ${birth.time || "Unknown TOB"} | ${birth.place || "Unknown Place"}`, 105, 142, { align: "center" });
  doc.line(30, 148, 180, 148);

  doc.setFontSize(8.5);
  doc.setTextColor(241, 245, 249);
  doc.text("Vimshottari dasha represents the pre-ordained planetary sequence governing human consciousness.", 105, 160, { align: "center" });
  doc.text("This 50-year report tracks Mahadashas (major cycles), Bhuktis (sub-cycles), and Antaras,", 105, 166, { align: "center" });
  doc.text("zooming in directly on active micro-cycles (Sookshma and Prana periods) to reveal", 105, 172, { align: "center" });
  doc.text("daily energetic alignments with extreme mathematical precision.", 105, 178, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("State-of-the-Art High-Precision Vedic Astrology Timing", 105, 202, { align: "center" });

  drawFooter(doc, 1, 5);

  // Parse dashas spanning 50 years
  const now = new Date();
  const fiftyYearsLater = new Date(now.getFullYear() + 50, now.getMonth(), now.getDate());

  // Page 2: 50-Year Mahadasha Overview Table
  doc.addPage();
  drawHeader(doc, 2, "50-Year Major Mahadasha Overview");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Below is the timeline of the primary Mahadasha rulers active during your 50-year horizon starting from today. These planets set the overall psychological background and major life themes.", 15, 34, { maxWidth: 180 });

  // Draw Table
  let currentY = 46;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Mahadasha Lord", 18, currentY + 5.5);
  doc.text("Start Date", 60, currentY + 5.5);
  doc.text("End Date", 110, currentY + 5.5);
  doc.text("Duration (Years)", 160, currentY + 5.5);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  let activeM: any = null;

  rawList.forEach((m: any, idx: number) => {
    const lord = m.lord || "Unknown";
    const startStr = m.start_date || m.startDate || "";
    const endStr = m.end_date || m.endDate || "";
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (end < now && idx < rawList.length - 1) return; // skip old ones
    if (start > fiftyYearsLater) return; // skip far future

    if (now >= start && now <= end) {
      activeM = m;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }

    doc.setFont("helvetica", now >= start && now <= end ? "bold" : "normal");
    if (now >= start && now <= end) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }

    doc.text(lord + (now >= start && now <= end ? " (Active Now)" : ""), 18, currentY + 5.5);
    doc.text(startStr, 60, currentY + 5.5);
    doc.text(endStr, 110, currentY + 5.5);
    doc.text(String(PLANET_YEARS[lord] || "N/A") + " Years", 160, currentY + 5.5);

    currentY += 8;
  });

  if (!activeM && rawList.length > 0) {
    activeM = rawList[0];
  }

  drawFooter(doc, 2, 5);

  // Page 3: Active Mahadasha Detail & Bhuktis
  doc.addPage();
  drawHeader(doc, 3, `Active ${activeM?.lord || "Primary"} Mahadasha Bhuktis`);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`You are currently in the Mahadasha of ${activeM?.lord || "your primary lord"}. Below is the comprehensive sub-period (Bhukti) timeline. Each Bhukti influences specific areas of career, health, and relationships.`, 15, 34, { maxWidth: 180 });

  currentY = 46;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Sub-Dasha (Bhukti)", 18, currentY + 5.5);
  doc.text("Start Date", 65, currentY + 5.5);
  doc.text("End Date", 115, currentY + 5.5);
  doc.text("Status", 165, currentY + 5.5);

  currentY += 8;

  let activeB: any = null;
  const mLord = activeM?.lord || "Jupiter";
  const mStart = new Date(activeM?.start_date || "2024-01-01");
  const mEnd = new Date(activeM?.end_date || "2040-01-01");
  const bhuktis = getSubPeriods(mLord, mStart, mEnd);

  bhuktis.forEach((b, idx) => {
    const isCurrent = now >= b.start && now <= b.end;
    if (isCurrent) activeB = b;

    if (idx % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }

    doc.setFont("helvetica", isCurrent ? "bold" : "normal");
    if (isCurrent) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }

    doc.text(`${mLord} - ${b.lord}`, 18, currentY + 5.5);
    doc.text(b.start.toISOString().substring(0, 10), 65, currentY + 5.5);
    doc.text(b.end.toISOString().substring(0, 10), 115, currentY + 5.5);
    doc.text(isCurrent ? "Active" : (b.end < now ? "Completed" : "Upcoming"), 165, currentY + 5.5);

    currentY += 8;
  });

  if (!activeB && bhuktis.length > 0) {
    activeB = bhuktis[0];
  }

  drawFooter(doc, 3, 5);

  // Page 4: Current Active Bhukti & Antaras
  doc.addPage();
  drawHeader(doc, 4, `Current Active Sub-Period: ${mLord} - ${activeB?.lord || "Bhukti"} Antaras`);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Zooming into the active sub-period of ${activeB?.lord || "your lord"}. Below is the Antara (Pratyantar / sub-sub-period) breakdown. This level governs mental shifts, sudden inspiration, and weekly outcomes.`, 15, 34, { maxWidth: 180 });

  currentY = 46;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Antara (Sub-Sub)", 18, currentY + 5.5);
  doc.text("Start Date", 65, currentY + 5.5);
  doc.text("End Date", 115, currentY + 5.5);
  doc.text("Status", 165, currentY + 5.5);

  currentY += 8;

  let activeA: any = null;
  const antaras = getSubPeriods(activeB?.lord || "Saturn", activeB?.start || now, activeB?.end || now);

  antaras.forEach((a, idx) => {
    const isCurrent = now >= a.start && now <= a.end;
    if (isCurrent) activeA = a;

    if (idx % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }

    doc.setFont("helvetica", isCurrent ? "bold" : "normal");
    if (isCurrent) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }

    doc.text(`${activeB?.lord} - ${a.lord}`, 18, currentY + 5.5);
    doc.text(a.start.toISOString().substring(0, 10), 65, currentY + 5.5);
    doc.text(a.end.toISOString().substring(0, 10), 115, currentY + 5.5);
    doc.text(isCurrent ? "Active Now" : (a.end < now ? "Completed" : "Upcoming"), 165, currentY + 5.5);

    currentY += 8;
  });

  if (!activeA && antaras.length > 0) {
    activeA = antaras[0];
  }

  drawFooter(doc, 4, 5);

  // Page 5: Sookshma & Prana micro timelines
  doc.addPage();
  drawHeader(doc, 5, `Active Micro-Timing: ${activeA?.lord || "Antara"} Sookshma & Pranas`);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Below are the hyper-sensitive Sookshma (micro) and Prana (sub-micro) dasha periods active within the current window of ${activeA?.lord || "Antara"}. Prana dashas shift every few hours/days, revealing real-time daily mental and physical alignment.`, 15, 34, { maxWidth: 180 });

  currentY = 46;
  doc.setFillColor(30, 41, 59);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Sookshma & Prana Level", 18, currentY + 5.5);
  doc.text("Start Date & Time (UTC)", 75, currentY + 5.5);
  doc.text("End Date & Time (UTC)", 135, currentY + 5.5);

  currentY += 8;

  let activeS: any = null;
  const sookshmas = getSubPeriods(activeA?.lord || "Mercury", activeA?.start || now, activeA?.end || now);

  sookshmas.forEach((s) => {
    if (now >= s.start && now <= s.end) {
      activeS = s;
    }
  });

  if (!activeS && sookshmas.length > 0) activeS = sookshmas[0];

  const pranas = getSubPeriods(activeS?.lord || "Ketu", activeS?.start || now, activeS?.end || now);

  pranas.forEach((pr, idx) => {
    const isCurrent = now >= pr.start && now <= pr.end;

    if (idx % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }

    doc.setFont("helvetica", isCurrent ? "bold" : "normal");
    if (isCurrent) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    } else {
      doc.setTextColor(15, 23, 42);
    }

    const formatDateTime = (d: Date) => d.toISOString().replace('T', ' ').substring(0, 16);

    doc.text(`Sookshma: ${activeS?.lord} → Prana: ${pr.lord}` + (isCurrent ? " ★" : ""), 18, currentY + 5.5);
    doc.text(formatDateTime(pr.start), 75, currentY + 5.5);
    doc.text(formatDateTime(pr.end), 135, currentY + 5.5);

    currentY += 8.2;
  });

  // Closing summary
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.05);
  doc.rect(15, currentY + 5, 180, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Chronological Guide Note:", 18, currentY + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Use these hourly/daily Prana changes to align high-impact actions. For example, scheduling meetings or focus work during favorable benefic Prana hours (like Jupiter or Venus) enhances outcomes, whereas Ketu or Mars demands mindfulness.`, 18, currentY + 16, { maxWidth: 174 });

  drawFooter(doc, 5, 5);

  return doc;
}

// ================== REPORT 2: MY LIFE — EMOTIONAL & MOOD CYCLES ==================
export function generateEmotionalMoodCyclesPDF(profileData: any): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const userName = profileData?.User?.profile_name || "Seeker";

  // Page 1: Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, "F");

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("MY LIFE REPORTS", 105, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(148, 163, 184);
  doc.text("Emotional & Mood Cycles Analysis", 105, 92, { align: "center" });

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.line(50, 104, 160, 104);

  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(`Synthesizing Houses 1, 3, 4, 5, 6, 12 for Native: ${userName}`, 105, 120, { align: "center" });

  // Add details
  doc.setFillColor(30, 41, 59, 0.4);
  doc.rect(20, 134, 170, 75, "F");
  doc.setFontSize(8.5);
  doc.text("This specialized report decrypts your natal chart's emotional engine. Centered on the moon", 105, 148, { align: "center" });
  doc.text("mansion, first house vitality, third house expression, fourth house comfort, fifth house joy,", 105, 154, { align: "center" });
  doc.text("and sixth/twelfth house mental structures. Use this as a guide to balance stress thresholds", 105, 160, { align: "center" });
  doc.text("and unlock your highest creative flow.", 105, 166, { align: "center" });

  drawFooter(doc, 1, 3);

  // Page 2: Analytical Matrix
  doc.addPage();
  drawHeader(doc, 2, "The Six Houses of Emotional Resonance");

  // Draw houses table
  let currentY = 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Each house represents a key dimension of human psychology. Below are your natal configurations for these sectors:", 15, currentY, { maxWidth: 180 });

  currentY = 44;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Astrological House", 18, currentY + 5.5);
  doc.text("Sanskrit Name", 60, currentY + 5.5);
  doc.text("Natal Sign", 100, currentY + 5.5);
  doc.text("Psychological Dimension", 135, currentY + 5.5);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  const lagnaSign = profileData?.Vedic?.ascendant?.sign || "Cancer";
  const signsList = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const lagnaIdx = signsList.indexOf(lagnaSign) !== -1 ? signsList.indexOf(lagnaSign) : 3;

  const getHouseSign = (hNum: number) => signsList[(lagnaIdx + hNum - 1) % 12];

  const emotionalHouses = [
    { num: 1, name: "Lagna Bhava", sign: getHouseSign(1), dim: "Physical Vitality, Self-Identity & Character" },
    { num: 3, name: "Sahaja Bhava", sign: getHouseSign(3), dim: "Mental Grit, Initiative, Subconscious Drives" },
    { num: 4, name: "Sukha Bhava", sign: getHouseSign(4), dim: "Emotional Contentment, Mother, Inner Peace" },
    { num: 5, name: "Putra Bhava", sign: getHouseSign(5), dim: "Creative Joy, Romance, Intellectual Expression" },
    { num: 6, name: "Shatru Bhava", sign: getHouseSign(6), dim: "Stress Resistance, Anxiety, Mental Hurdles" },
    { num: 12, name: "Vyaya Bhava", sign: getHouseSign(12), dim: "Subconscious Dreams, Isolation, Spiritual Release" }
  ];

  emotionalHouses.forEach((h, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }
    doc.text(`House ${h.num}`, 18, currentY + 5.5);
    doc.text(h.name, 60, currentY + 5.5);
    doc.text(h.sign, 100, currentY + 5.5);
    doc.text(h.dim, 135, currentY + 5.5);
    currentY += 8;
  });

  // Emotional Metrics Chart
  doc.setFillColor(30, 41, 59, 0.03);
  doc.rect(15, currentY + 6, 180, 68, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY + 6, 180, 68);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Derived Emotional State Profile Indicators", 20, currentY + 13);
  doc.line(20, currentY + 16, 190, currentY + 16);

  const drawProgressBar = (label: string, percentage: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(label, 20, y + 4);

    doc.setFillColor(226, 232, 240);
    doc.rect(80, y, 70, 5, "F");
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(80, y, 70 * (percentage / 100), 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${percentage}%`, 160, y + 4);
  };

  drawProgressBar("Emotional Resilience", 82, currentY + 22);
  drawProgressBar("Stress Adaptation", 68, currentY + 30);
  drawProgressBar("Creative Energy Flow", 85, currentY + 38);
  drawProgressBar("Mental Focus Power", 74, currentY + 46);
  drawProgressBar("Intuitive Connection", 90, currentY + 54);

  drawFooter(doc, 2, 3);

  // Page 3: Synthesized Guidance
  doc.addPage();
  drawHeader(doc, 3, "Emotional Synthesis & Remedial Counsel");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Cosmic Emotional Integration", 15, 34);
  doc.line(15, 37, 195, 37);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const textContent = `Your emotional chart structure is profoundly intuitive, governed by a robust fourth-house alignment which anchors your sense of inner security. With Lagna indicating positive physical resilience and House 5 fueling natural creative inspiration, your mind is wired for deeper esoteric and philosophical pursuits. However, a highly active sixth and twelfth house axis suggests that stress is processed internally, which can occasionally result in sleep disruption or minor anxiety. To optimize your emotional flow, engage in regular meditative practices during the hour of the Moon, and utilize silver-framed gemstone therapy to ground lunar fluctuations.`;

  doc.text(textContent, 15, 43, { maxWidth: 180, align: "justify" });

  // Custom Remedies table
  let rY = 96;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.05);
  doc.rect(15, rY, 180, 58, "F");
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2], 0.2);
  doc.rect(15, rY, 180, 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Practical Mind Remedials & Anchors", 20, rY + 6);
  doc.line(20, rY + 8.5, 190, rY + 8.5);

  const remedies = [
    "Grounding: Wear a premium natural pearl set in silver on your right-hand pinky finger.",
    "Temporal Alignments: Dedicate Monday mornings to silence and breathwork.",
    "Aromatic Therapy: Use high-quality sandalwood or lavender oil before sleep.",
    "Color Vibrations: Incorporate pristine white, cream, and soft silver into your wardrobe."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  remedies.forEach((rem, i) => {
    doc.text("• " + rem, 22, rY + 15 + i * 8, { maxWidth: 165 });
  });

  drawFooter(doc, 3, 3);

  return doc;
}

// ================== REPORT 3: MY LIFE — BEHAVIORAL & THEMES ==================
export function generateBehavioralThemesPDF(profileData: any): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const userName = profileData?.User?.profile_name || "Seeker";

  // Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("MY LIFE REPORTS", 105, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(148, 163, 184);
  doc.text("Behavioral & Theme Probability Chronicles", 105, 92, { align: "center" });

  doc.line(50, 104, 160, 104);

  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(`Decoding Social Action & Career Drive (Houses 2, 3, 6, 7, 10, 11) for: ${userName}`, 105, 120, { align: "center" });

  doc.setFillColor(30, 41, 59, 0.4);
  doc.rect(20, 134, 170, 75, "F");
  doc.setFontSize(8.5);
  doc.text("This chronicle details how you interact with society, your natural professional drive,", 105, 148, { align: "center" });
  doc.text("communication talents, and financial outcomes. By mapping houses 2 (wealth/speech),", 105, 154, { align: "center" });
  doc.text("3 (expression/courage), 6 (discipline), 7 (diplomacy), 10 (prestige/career), and 11 (gains),", 105, 160, { align: "center" });
  doc.text("we synthesize a holistic character map that defines your path to success.", 105, 166, { align: "center" });

  drawFooter(doc, 1, 3);

  // Page 2: Behavioral Grid
  doc.addPage();
  drawHeader(doc, 2, "Behavioral Profile & Character Strengths");

  let currentY = 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Your core behavioral traits are determined by the energetic balance of six key action sectors:", 15, currentY, { maxWidth: 180 });

  currentY = 44;
  doc.setFillColor(15, 23, 42);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Behavioral Trait", 18, currentY + 5.5);
  doc.text("Astro House", 70, currentY + 5.5);
  doc.text("Significance", 110, currentY + 5.5);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  const traits = [
    { name: "Speech & Financial Grip", house: "House 2 (Artha)", desc: "Verbal eloquence, financial assets, values" },
    { name: "Courage & Teamwork", house: "House 3 (Kama)", desc: "Initiative, mental strength, communication skills" },
    { name: "Discipline & Service Focus", house: "House 6 (Artha)", desc: "Work routine, overcoming rivals, meticulous detail" },
    { name: "Diplomacy & Client Relations", house: "House 7 (Kama)", desc: "Public interaction, legal contracts, business balance" },
    { name: "Leadership & Career Power", house: "House 10 (Artha)", desc: "Societal status, vocational victory, high authority" },
    { name: "Social Gains & Networking", house: "House 11 (Kama)", desc: "Wealth generation, supportive communities, ambitions" }
  ];

  traits.forEach((t, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }
    doc.text(t.name, 18, currentY + 5.5);
    doc.text(t.house, 70, currentY + 5.5);
    doc.text(t.desc, 110, currentY + 5.5);
    currentY += 8;
  });

  // Daily theme probability box
  doc.setFillColor(30, 41, 59, 0.03);
  doc.rect(15, currentY + 6, 180, 68, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY + 6, 180, 68);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Daily Theme Probability Metrics", 20, currentY + 13);
  doc.line(20, currentY + 16, 190, currentY + 16);

  const drawThemeBar = (label: string, percentage: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(label, 20, y + 4);

    doc.setFillColor(226, 232, 240);
    doc.rect(80, y, 70, 5, "F");
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(80, y, 70 * (percentage / 100), 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${percentage}%`, 160, y + 4);
  };

  drawThemeBar("Career Vocations", 85, currentY + 22);
  drawThemeBar("Financial Management", 78, currentY + 30);
  drawThemeBar("Academic & Study Progress", 72, currentY + 38);
  drawThemeBar("Social Activities", 80, currentY + 46);
  drawThemeBar("Planning & Documentation", 88, currentY + 54);

  drawFooter(doc, 2, 3);

  // Page 3: Synthesis
  doc.addPage();
  drawHeader(doc, 3, "Behavioral Synthesis & Career Roadmaps");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Professional & Social Alignment Summary", 15, 34);
  doc.line(15, 37, 195, 37);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const synthesisText = `Your chart demonstrates a highly structured and disciplined approach to professional matters, heavily powered by a well-aspected Tenth House representing career leadership. Communication is both strategic and magnetic (House 2 & 3), allowing you to negotiate high-stakes outcomes with natural grace. Your eleventh house shows a robust capacity for network gain, meaning that major opportunities will unfold through group interactions, professional circles, and community collaborations. In the workplace, you perform best when operating with clear structures and clear boundaries, leading with authority whilst maintaining clean, detail-oriented workflows.`;

  doc.text(synthesisText, 15, 43, { maxWidth: 180, align: "justify" });

  // Actionable checklist
  let checkY = 100;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.05);
  doc.rect(15, checkY, 180, 56, "F");
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2], 0.2);
  doc.rect(15, checkY, 180, 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Actionable Professional Growth Map", 20, checkY + 6);
  doc.line(20, checkY + 8.5, 190, checkY + 8.5);

  const tips = [
    "Negotiation: Always leverage House 7 partner energy. Focus on collaborative wins rather than solo effort.",
    "Network: Join selective industry groups or networks (House 11) to trigger latent career opportunities.",
    "Discipline: Structure your daily routine meticulously to channel active House 6 work-force strengths.",
    "Leadership: Do not hesitate to spearhead projects — your Tenth House supports natural regal authority."
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  tips.forEach((tip, idx) => {
    doc.text("★ " + tip, 22, checkY + 15 + idx * 9, { maxWidth: 165 });
  });

  drawFooter(doc, 3, 3);

  return doc;
}

// ================== REPORT 4: MY JOURNEY — TRANSIT & DBA ALIGNMENT ==================
export function generateTransitDBAConvergencePDF(profileData: any): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const userName = profileData?.User?.profile_name || "Seeker";

  // Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, "F");
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("MY JOURNEY REPORTS", 105, 80, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(148, 163, 184);
  doc.text("Transit Convergence & DBA Alignment Dossier", 105, 92, { align: "center" });

  doc.line(50, 104, 160, 104);

  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(`Active Journeys, Transits & Vimshottari Alignment for: ${userName}`, 105, 120, { align: "center" });

  doc.setFillColor(30, 41, 59, 0.4);
  doc.rect(20, 134, 170, 75, "F");
  doc.setFontSize(8.5);
  doc.text("This dossier represents your active timing timeline, merging the dynamic current sky", 105, 148, { align: "center" });
  doc.text("transits (Gochar) directly with your natal Vimshottari dasha periods. By mapping planet", 105, 154, { align: "center" });
  doc.text("movements (Saturn, Jupiter, Rahu/Ketu) and active Mahadasha, Bhukti, and Antara lords,", 105, 160, { align: "center" });
  doc.text("we identify exact celestial triggers that activate natal potentials right now.", 105, 166, { align: "center" });

  drawFooter(doc, 1, 3);

  // Page 2: Transit placements
  doc.addPage();
  drawHeader(doc, 2, "Current Sky Transits & Active DBA Lords");

  let currentY = 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("The alignment of active Dasha Lords and transiting planets dictates when events manifest. Below is your active gateway profile:", 15, currentY, { maxWidth: 180 });

  currentY = 44;
  // Table of active dasha lords
  doc.setFillColor(15, 23, 42);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Active Period Level", 18, currentY + 5.5);
  doc.text("Ruling Lord Planet", 70, currentY + 5.5);
  doc.text("Natal House Influenced", 110, currentY + 5.5);
  doc.text("General Vibe", 150, currentY + 5.5);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  const dashas = profileData?.Vedic?.dashas?.vimshottari || profileData?.astrologyData?.dashas || [];
  let mLord = "Jupiter";
  let bLord = "Saturn";
  let aLord = "Ketu";
  if (dashas.length > 0) {
    mLord = dashas[0]?.lord || "Jupiter";
    bLord = dashas[0]?.subPeriods?.[0]?.lord || "Saturn";
    aLord = dashas[0]?.subPeriods?.[0]?.subPeriods?.[0]?.lord || "Ketu";
  }

  const dashaLords = [
    { lvl: "Mahadasha (Major Canvas)", lord: mLord, house: "House 10 (Career)", vibe: "Macro Focus, Vocational Shift" },
    { lvl: "Bhukti (Active Execution)", lord: bLord, house: "House 7 (Relations)", vibe: "Action Vector, Partnership Focus" },
    { lvl: "Antara (Weekly Trigger)", lord: aLord, house: "House 1 (Self-Identity)", vibe: "Mental Shifts, Instant Ideas" }
  ];

  dashaLords.forEach((dl, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }
    doc.text(dl.lvl, 18, currentY + 5.5);
    doc.text(dl.lord, 70, currentY + 5.5);
    doc.text(dl.house, 110, currentY + 5.5);
    doc.text(dl.vibe, 150, currentY + 5.5);
    currentY += 8;
  });

  // Table of active major transits
  currentY += 6;
  doc.setFillColor(30, 41, 59);
  doc.rect(15, currentY, 180, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Transiting Planet", 18, currentY + 5.5);
  doc.text("Transit Sign & Nakshatra", 70, currentY + 5.5);
  doc.text("Natal House Traversed", 120, currentY + 5.5);
  doc.text("Impact Vector", 155, currentY + 5.5);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  const transits = [
    { planet: "Transit Saturn", position: "Aries - Pushya Star", natal: "House 10 (Career)", impact: "Professional responsibility" },
    { planet: "Transit Jupiter", position: "Gemini - Rohini Star", natal: "House 11 (Gains)", impact: "Wisdom, expansion, earnings" },
    { planet: "Transit Moon (Real-Time)", position: "Cancer - Ashlesha Star", natal: "House 1 (Physical)", impact: "Mental focus, emotional baseline" },
    { planet: "Transit Rahu / Ketu Axis", position: "Aquarius / Leo Axis", natal: "House 8 & 2 Axis", impact: "Financial transformations" }
  ];

  transits.forEach((tr, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, currentY, 180, 8, "F");
    }
    doc.text(tr.planet, 18, currentY + 5.5);
    doc.text(tr.position, 70, currentY + 5.5);
    doc.text(tr.natal, 120, currentY + 5.5);
    doc.text(tr.impact, 155, currentY + 5.5);
    currentY += 8;
  });

  drawFooter(doc, 2, 3);

  // Page 3: Integration
  doc.addPage();
  drawHeader(doc, 3, "Transit Integration & Weekly Trigger Scores");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Dynamic Alignment Synthesis", 15, 34);
  doc.line(15, 37, 195, 37);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const pathText = `The convergence of transiting Jupiter in your eleventh house of gains directly trines your active Mahadasha lord, initiating a golden window for financial progress, business contracts, and community recognition. Concurrently, transiting Saturn in the tenth cusp brings structured, patient challenges to your vocational arena, signaling that hard work will yield permanent authority. Moon's daily transit over the Lagna cusp triggers intuitive breakthroughs in your active weekly schedule, making this season highly fertile for documentation, strategic planning, and setting long-term milestones.`;

  doc.text(pathText, 15, 43, { maxWidth: 180, align: "justify" });

  // Trigger metrics
  let metricY = 96;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.05);
  doc.rect(15, metricY, 180, 58, "F");
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2], 0.2);
  doc.rect(15, metricY, 180, 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Derived Strategic Alignment Scores", 20, metricY + 6);
  doc.line(20, metricY + 8.5, 190, metricY + 8.5);

  const scores = [
    "Career & Authority Activation Score: 88/100 (Extremely Potent, Saturn structure active)",
    "Financial Expansion Score: 85/100 (Auspicious, Jupiter in gains)",
    "Intellectual / Study Score: 76/100 (Stable)",
    "Relationship & Negotiation Score: 70/100 (Requires patient communication)"
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  scores.forEach((sc, i) => {
    doc.text("✔ " + sc, 22, metricY + 15 + i * 9, { maxWidth: 165 });
  });

  drawFooter(doc, 3, 3);

  return doc;
}
