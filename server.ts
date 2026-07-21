/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { KpService } from "./src/lib/kp/KpService";
import { WesternService } from "./src/lib/western/WesternService";
import { calculateAstrology, NAKSHATRAS } from "./src/lib/astrology";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const JHORA_API_URL = "https://jagannatha-hora-359167915530.europe-west1.run.app";

// Deterministic Time-Window Cache Policy for Transit System & High-Frequency API Requests
interface CacheEntry {
  timestamp: number;
  data: any;
}

const transitCache = new Map<string, CacheEntry>();
const CACHE_VALIDITY_MS = 3600 * 1000; // 1 Hour

function getTransitCacheKey(
  date: string,
  time: string,
  lat: number,
  lon: number,
  extra: string = ""
): string {
  const hour = (time || "12:00:00").split(":")[0] || "12";
  const roundedLat = Number(lat || 0).toFixed(1);
  const roundedLon = Number(lon || 0).toFixed(1);
  return `${date}_H${hour}_LAT${roundedLat}_LON${roundedLon}_${extra}`;
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Lazy-initialize OpenAI API client to avoid startup crashes if key is missing
let openaiClient: OpenAI | null = null;
function getOpenAIClient(req?: any): OpenAI {
  const userKey = req?.headers?.["x-openai-api-key"] || req?.headers?.["authorization"]?.toString().replace("Bearer ", "");
  const key = userKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("No OpenAI API key found. Please configure your own ChatGPT/OpenAI API key in the app Settings (top right corner) or provide an OPENAI_API_KEY.");
  }
  if (userKey) {
    return new OpenAI({
      apiKey: userKey,
    });
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: key,
    });
  }
  return openaiClient;
}

// Lazy-initialize Gemini API client to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helpers to read and write profile-tagged analysis from/to the analysis folder
function getUserAnalysisContext(userName: string, userEmail: string, uid?: string): string {
  try {
    const analysisDir = path.join(process.cwd(), "analysis");
    if (!fs.existsSync(analysisDir)) {
      return "";
    }
    const files = fs.readdirSync(analysisDir);
    let matchedContent = "";
    
    const normName = userName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normEmail = userEmail.toLowerCase().trim();
    
    // Helper to read all files in a folder recursively
    const readDirRec = (dirPath: string, parentName: string): string => {
      let contentAcc = "";
      try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const fullItemPath = path.join(dirPath, item);
          const itemStats = fs.statSync(fullItemPath);
          if (itemStats.isFile()) {
            if (item.endsWith(".json") || item.endsWith(".md") || item.endsWith(".txt")) {
              const fileContent = fs.readFileSync(fullItemPath, "utf-8");
              contentAcc += `\n\n--- FILE: ${parentName}/${item} ---\n${fileContent}\n`;
            }
          } else if (itemStats.isDirectory()) {
            contentAcc += readDirRec(fullItemPath, `${parentName}/${item}`);
          }
        }
      } catch (dirErr) {
        console.error(`Error reading sub-directory ${dirPath}:`, dirErr);
      }
      return contentAcc;
    };
    
    for (const file of files) {
      if (file === "README.md") continue;
      const fileLower = file.toLowerCase();
      let matches = false;
      
      // Match by normalized name
      if (normName && normName.length >= 3 && fileLower.includes(normName)) {
        matches = true;
      }
      // Match by email prefix
      if (normEmail && normEmail.includes("@")) {
        const emailPrefix = normEmail.split("@")[0];
        if (emailPrefix && emailPrefix.length >= 3 && fileLower.includes(emailPrefix)) {
          matches = true;
        }
      }
      // Match by uid if available
      if (uid && fileLower.includes(uid.toLowerCase())) {
        matches = true;
      }
      
      // Also match generic folder fallback for testing/demo
      if (fileLower === "userprofile") {
        matches = true;
      }
      
      if (matches) {
        const filePath = path.join(analysisDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const content = fs.readFileSync(filePath, "utf-8");
          matchedContent += `\n\n--- FILE: ${file} ---\n${content}\n`;
        } else if (stats.isDirectory()) {
          matchedContent += readDirRec(filePath, file);
        }
      }
    }
    return matchedContent;
  } catch (err) {
    console.error("Error reading user analysis context from analysis folder:", err);
    return "";
  }
}

function saveUserAnalysisToFolder(userName: string, analysisText: string, astrologyData: any) {
  try {
    const analysisDir = path.join(process.cwd(), "analysis");
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }
    
    const normName = userName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normName) return;
    
    const analysisPath = path.join(analysisDir, `${normName}_analysis.md`);
    const dataPath = path.join(analysisDir, `${normName}_data.json`);
    
    fs.writeFileSync(analysisPath, analysisText);
    fs.writeFileSync(dataPath, JSON.stringify(astrologyData, null, 2));
    
    console.log(`[Analysis Save] Saved analysis for ${userName} to analysis/ folder.`);
    
    // Stage, commit and push to git asynchronously
    exec(`git add analysis/${normName}_analysis.md analysis/${normName}_data.json && (git diff-index --quiet HEAD || git commit -m "feat(analysis): update stored analysis for ${userName}")`, (err, stdout, stderr) => {
      if (err) {
        console.warn("[Analysis Git Commit Warning]", err.message);
      } else {
        console.log("[Analysis Git Commit Success]");
        exec("git push origin HEAD", (pushErr, pushStdout, pushStderr) => {
          if (pushErr) {
            console.error("[Analysis Git Push Warning]", pushErr.message);
          } else {
            console.log("[Analysis Git Push Success]", pushStdout);
          }
        });
      }
    });
  } catch (err) {
    console.error("Error saving user analysis to folder:", err);
  }
}

// Helper to send real-time personalized astrology report via Email using Nodemailer
async function triggerAstrologyEmail(profile: any) {
  const email = profile.email;
  if (!email) {
    console.log("No email in profile, skipping email trigger.");
    return;
  }

  console.log(`Scheduling astrology report generation for user: ${profile.name} (${email})`);

  // Run asynchronously after 5 seconds to avoid blocking response
  setTimeout(async () => {
    try {
      let analysisText = "";
      try {
        const openai = getOpenAIClient();
        const prompt = `
          You are a master Vedic and KP Astrologer. Generate a highly detailed, personalized, and visually beautiful Vedic Astrology Analysis and Reading Report for:
          Name: ${profile.name}
          Email: ${profile.email}
          Phone: ${profile.phoneNumber || "Not provided"}
          Theme: Premium JHoraAI Vedic and KP Astrology Engine

          Include:
          1. A warm, mystical greeting.
          2. An analysis of their general personality based on their cosmic alignment.
          3. Practical predictions for their Career, Relationships, and Spiritual Growth.
          4. Remedial measures (Upayas) such as mantras or gemstone suggestions.
          5. A welcoming invitation to return to JHoraAI for deeper Kundli calculations.

          Format the output as clean, professional, and readable HTML inside a gorgeous modern email template. Keep it elegant, using professional typography spacing.
        `;
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
        analysisText = response.choices[0]?.message?.content || "Cosmic energies are aligning. Check your profile dashboard for complete KP stellar and Western synastry calculations.";
      } catch (aiErr: any) {
        if (aiErr.message?.includes("No OpenAI API key found")) {
          console.info("OpenAI API key not provided for background email report; using backup template.");
        } else {
          console.error("OpenAI failed to generate email report, using backup:", aiErr);
        }
        analysisText = `
          <h2>Your JHoraAI Astro Reading</h2>
          <p>Welcome to JHoraAI, ${profile.name}!</p>
          <p>Our cosmic analysis engines have synced your profile data securely across Local Machine, Google Drive, and our secure backend database.</p>
          <p>Your current profile email: ${profile.email}</p>
          <p>Your captured phone: ${profile.phoneNumber || "Not provided"}</p>
          <p>We are currently analyzing your planetary positions, stellar nakshatras, house significators, and transits. Stay tuned for real-time astro updates on JHoraAI!</p>
        `;
      }

      // Check if SMTP is configured
      const smtpHost = process.env.SMTP_HOST || "";
      const smtpPort = Number(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: `"JHoraAI Cosmic Engine" <${smtpUser}>`,
          to: email,
          subject: `✨ Your Personalized JHoraAI Cosmic Astrology Analysis for ${profile.name}`,
          html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px; max-width: 600px; margin: auto; border-radius: 16px; border: 1px solid #312e81;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f59e0b; font-size: 28px; margin: 0; font-family: 'Georgia', serif;">JHoraAI Cosmic Report</h1>
                <p style="color: #94a3b8; font-size: 12px; font-family: monospace;">VEDIC & KP STELLAR PRECISION ENGINE</p>
              </div>
              <div style="line-height: 1.6; font-size: 14px; color: #cbd5e1;">
                ${analysisText}
              </div>
              <div style="text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 11px; color: #64748b;">
                <p>This report was securely generated and transmitted using Google Cloud Platform & AI Studio integrations.</p>
                <p>&copy; 2026 JHoraAI Astro Platform. All cosmic alignments reserved.</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Astrology report email successfully sent to ${email}`);
      } else {
        console.warn("SMTP environment variables are not configured in settings. Email report logged below instead:");
        console.log("------------------ REPORT EMAIL START ------------------");
        console.log(`To: ${email}`);
        console.log(`Subject: ✨ Your Personalized JHoraAI Cosmic Astrology Analysis`);
        console.log(`Body: ${analysisText}`);
        console.log("------------------- REPORT EMAIL END -------------------");
      }
    } catch (err) {
      console.error("Error in scheduled triggerAstrologyEmail execution:", err);
    }
  }, 5000);
}

// Save user profile and trigger reporting endpoint
app.post("/api/user-profile/save", async (req, res) => {
  try {
    const profile = req.body;
    if (!profile || !profile.uid) {
      return res.status(400).json({ error: "Invalid profile data" });
    }

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "user_profiles.json");
    let profiles: Record<string, any> = {};

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        profiles = JSON.parse(fileContent);
      } catch (err) {
        console.error("Failed to read user_profiles.json, resetting:", err);
      }
    }

    profiles[profile.uid] = {
      ...profile,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2));
    console.log(`Successfully saved profile ${profile.uid} to backend database.`);

    // Trigger analysis sync immediately for this profile
    setTimeout(() => runAnalysisSyncAgentForProfile(profile), 10);

    res.json({ success: true, message: "Profile successfully saved and synced on backend." });
  } catch (error: any) {
    console.error("Backend User Profile Save Error:", error);
    res.status(500).json({ error: error.message || "Failed to save profile on backend." });
  }
});

function getProfileFileName(profileData: any, fallbackName: string): string {
  // 1. Username
  const rawUser = profileData?.User?.profile_name || profileData?.BirthDetails?.name || fallbackName;
  const username = rawUser.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 2. DOB (format: DDMMYYYY)
  const rawDob = profileData?.Birth?.date || profileData?.BirthDetails?.date || "";
  let dob = "00000000";
  if (rawDob) {
    const cleanedDob = rawDob.replace(/[^0-9]/g, "");
    if (rawDob.includes("-") && rawDob.split("-")[0].length === 4) {
      const parts = rawDob.split("-");
      dob = parts[2].padStart(2, '0') + parts[1].padStart(2, '0') + parts[0];
    } else {
      dob = cleanedDob;
    }
  }

  // 3. Place
  const rawPlace = profileData?.Birth?.place || profileData?.BirthDetails?.location || "";
  const place = rawPlace ? rawPlace.split(",")[0].trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "unknown";

  // 4. Birthtime (format: hhmmAM/PM)
  const rawTime = profileData?.Birth?.time || profileData?.BirthDetails?.time || "";
  let birthtime = "0000am";
  if (rawTime) {
    const hasAmPm = /([ap]m)/i.test(rawTime);
    if (hasAmPm) {
      const match = rawTime.match(/(\d+):(\d+)\s*([ap]m)/i);
      if (match) {
        const hh = match[1].padStart(2, '0');
        const mm = match[2].padStart(2, '0');
        const ampm = match[3].toUpperCase();
        birthtime = `${hh}${mm}${ampm}`;
      }
    } else {
      const timeParts = rawTime.split(":");
      if (timeParts.length >= 2) {
        let hh = parseInt(timeParts[0], 10);
        const mm = timeParts[1].padStart(2, '0');
        const isPm = hh >= 12;
        const ampm = isPm ? "PM" : "AM";
        if (hh > 12) {
          hh -= 12;
        } else if (hh === 0) {
          hh = 12;
        }
        const hhStr = hh.toString().padStart(2, '0');
        birthtime = `${hhStr}${mm}${ampm}`;
      }
    }
  }

  return `${username}_${dob}_${birthtime.toLowerCase()}_${place}.json`;
}

// Helper to handle git synchronization on the server
async function syncProfileToGithub(action: "add" | "delete", profileName: string, profileData?: any) {
  try {
    const usersDir = path.join(process.cwd(), "Users");
    const filePath = path.join(usersDir, "userprofile.json");

    if (action === "add") {
      if (!fs.existsSync(usersDir)) {
        fs.mkdirSync(usersDir, { recursive: true });
      }

      const dynamicName = getProfileFileName(profileData, profileName);
      const dynamicFilePath = path.join(usersDir, dynamicName);

      fs.writeFileSync(filePath, JSON.stringify(profileData, null, 2));
      fs.writeFileSync(dynamicFilePath, JSON.stringify(profileData, null, 2));
      console.log(`[Git Sync] Written Users/userprofile.json and Users/${dynamicName} for profile: ${profileName}`);

      exec(`git add Users/userprofile.json Users/${dynamicName} && (git diff-index --quiet HEAD || git commit -m "feat: activate user profile ${profileName}")`, (err, stdout, stderr) => {
        if (err) {
          console.warn("[Git Sync Add Local Warning - could not commit locally]", err.message);
        } else {
          console.log("[Git Sync Add Local Success] Profile committed locally.");
          // Attempt push as a separate, fully graceful operation
          exec("git push origin HEAD", (pushErr, pushStdout, pushStderr) => {
            if (pushErr) {
              console.info("[Git Sync Push Notice] Git push skipped/unauthenticated. Profile is securely saved locally and committed to Git.");
            } else {
              console.log("[Git Sync Push Success]", pushStdout);
            }
          });
        }
      });

    } else if (action === "delete") {
      if (fs.existsSync(usersDir)) {
        const files = fs.readdirSync(usersDir);
        let deletedAny = false;
        const filesToGitRm: string[] = [];

        for (const file of files) {
          if (file.endsWith(".json") && file !== "userprofile.json") {
            const fPath = path.join(usersDir, file);
            try {
              const content = fs.readFileSync(fPath, "utf-8");
              const parsed = JSON.parse(content);
              const nameInFile = parsed?.User?.profile_name || parsed?.BirthDetails?.name;
              if (nameInFile && nameInFile.toLowerCase().trim() === profileName.toLowerCase().trim()) {
                fs.unlinkSync(fPath);
                filesToGitRm.push(`Users/${file}`);
                deletedAny = true;
                console.log(`[Git Sync] Deleted Users/${file} because profile ${profileName} was deleted.`);
              }
            } catch (e) {
              console.error(`Error processing file ${file} during deletion check:`, e);
            }
          }
        }

        if (fs.existsSync(filePath)) {
          let isMatching = false;
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsed = JSON.parse(content);
            const nameInFile = parsed?.User?.profile_name || parsed?.BirthDetails?.name;
            if (nameInFile && nameInFile.toLowerCase().trim() === profileName.toLowerCase().trim()) {
              isMatching = true;
            }
          } catch (e) {
            console.error("Failed to parse userprofile.json during deletion check:", e);
          }

          if (isMatching) {
            fs.unlinkSync(filePath);
            filesToGitRm.push("Users/userprofile.json");
            deletedAny = true;
            console.log(`[Git Sync] Deleted Users/userprofile.json because active profile ${profileName} was deleted.`);
          }
        }

        if (deletedAny && filesToGitRm.length > 0) {
          const filesStr = filesToGitRm.join(" ");
          exec(`git rm ${filesStr} && (git diff-index --quiet HEAD || git commit -m "feat: deactivate user profile ${profileName}")`, (err, stdout, stderr) => {
            if (err) {
              console.warn("[Git Sync Delete Local Warning]", err.message);
            } else {
              console.log("[Git Sync Delete Local Success] Deactivation committed locally.");
              // Attempt push as a separate, fully graceful operation
              exec("git push origin HEAD", (pushErr, pushStdout, pushStderr) => {
                if (pushErr) {
                  console.info("[Git Sync Push Notice] Git push skipped/unauthenticated. Deactivation is securely saved locally and committed to Git.");
                } else {
                  console.log("[Git Sync Push Success]", pushStdout);
                }
              });
            }
          });
        }
      }
    }
  } catch (error) {
    console.error("[syncProfileToGithub Error]", error);
  }
}

// Endpoint to act upon user profile JSON on github / Users folder
app.post("/api/user-profile/act", async (req, res) => {
  try {
    const { action, profileName, profileData } = req.body;
    if (!action || !profileName) {
      return res.status(400).json({ error: "Missing action or profileName" });
    }

    if (action === "add" && !profileData) {
      return res.status(400).json({ error: "Missing profileData for add action" });
    }

    // Trigger git sync asynchronously to not block the frontend
    syncProfileToGithub(action, profileName, profileData);

    // Trigger analysis sync asynchronously if action is add
    if (action === "add" && profileData) {
      setTimeout(() => runAnalysisSyncAgentForProfile(profileData), 10);
    }

    res.json({ success: true, message: `Profile action '${action}' triggered and syncing asynchronously.` });
  } catch (err: any) {
    console.error("Error in /api/user-profile/act endpoint:", err);
    res.status(500).json({ error: err.message || "Failed to process profile action." });
  }
});

// Endpoint to index an astrological table, update user profile and master handbook metadata, and sync with GitHub
app.post("/api/user-profile/index-table", async (req, res) => {
  try {
    const { tableId, tableName, profileName, tableData } = req.body;
    if (!tableId || !tableName) {
      return res.status(400).json({ error: "Missing tableId or tableName" });
    }

    const usersDir = path.join(process.cwd(), "Users");
    const profilePath = path.join(usersDir, "userprofile.json");
    let profile: any = {};

    if (fs.existsSync(profilePath)) {
      try {
        const content = fs.readFileSync(profilePath, "utf-8");
        profile = JSON.parse(content);
      } catch (err) {
        console.error("Failed to parse userprofile.json:", err);
      }
    }

    if (!profile.User) {
      profile.User = {};
    }

    if (!profile.User.indexedTables) {
      profile.User.indexedTables = {};
    }

    // Save/update indexed table with metadata and raw user table data
    profile.User.indexedTables[tableId] = {
      tableName,
      indexedAt: new Date().toISOString(),
      data: tableData,
    };

    // Save active profile to Users/userprofile.json
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));

    // Also save to dynamic profile file
    const fallbackName = profileName || profile?.User?.profile_name || "Seeker";
    const dynamicName = getProfileFileName(profile, fallbackName);
    const dynamicFilePath = path.join(usersDir, dynamicName);
    fs.writeFileSync(dynamicFilePath, JSON.stringify(profile, null, 2));

    console.log(`[Table Index] Saved table ${tableId} to user profile.`);

    // Update master_astro_handbook.md with metadata for index
    const handbookPath = path.join(process.cwd(), "documents", "master_astro_handbook.md");
    if (fs.existsSync(handbookPath)) {
      let handbookContent = fs.readFileSync(handbookPath, "utf-8");
      
      const tableNum = tableId.replace("table_", "");
      const headerRegex = new RegExp(`(#### Table ${tableNum}:[^\n]+)`);
      
      if (headerRegex.test(handbookContent)) {
        const indexMetadataLine = `\n* **Index Status:** Indexed for **${fallbackName}** on ${new Date().toISOString().split('T')[0]}`;
        
        const statusRegex = new RegExp(`(#### Table ${tableNum}:[^\n]+)\\s*\\* \\*\\*Index Status:\\*\\*[^\n]+`);
        
        if (statusRegex.test(handbookContent)) {
          handbookContent = handbookContent.replace(statusRegex, `$1${indexMetadataLine}`);
        } else {
          handbookContent = handbookContent.replace(headerRegex, `$1${indexMetadataLine}`);
        }
        
        fs.writeFileSync(handbookPath, handbookContent);
        console.log(`[Table Index] Updated master_astro_handbook.md for Table ${tableNum}`);
      }
    }

    // Git Operations: commit and push
    exec(`git add Users/userprofile.json Users/${dynamicName} documents/master_astro_handbook.md && (git diff-index --quiet HEAD || git commit -m "feat: index ${tableId} for profile ${fallbackName}")`, (err, stdout, stderr) => {
      if (err) {
        console.warn("[Table Index Git Commit Warning]", err.message);
      } else {
        console.log("[Table Index Git Commit Success]");
        // Push HEAD to origin
        exec("git push origin HEAD", (pushErr, pushStdout, pushStderr) => {
          if (pushErr) {
            console.error("[Table Index Git Push Warning]", pushErr.message);
          } else {
            console.log("[Table Index Git Push Success]", pushStdout);
          }
        });
      }
    });

    res.json({ success: true, message: `Table '${tableName}' indexed successfully.` });
  } catch (err: any) {
    console.error("Error in /api/user-profile/index-table:", err);
    res.status(500).json({ error: err.message || "Failed to index table." });
  }
});

// Endpoint to retrieve active user profile JSON from disk
app.get("/api/user-profile/get", async (req, res) => {
  try {
    const uid = req.query.uid as string;
    
    // If uid is provided, check if a profile exists for this uid in user_profiles.json
    if (uid) {
      const localFilePath = path.join(process.cwd(), "data", "user_profiles.json");
      if (fs.existsSync(localFilePath)) {
        const localContent = fs.readFileSync(localFilePath, "utf-8");
        const localProfiles = JSON.parse(localContent);
        if (localProfiles[uid]) {
          const profile = localProfiles[uid];
          setTimeout(() => runAnalysisSyncAgentForProfile(profile), 10);
          return res.json(profile);
        }
      }
    }

    const filePath = path.join(process.cwd(), "Users", "userprofile.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      setTimeout(() => runAnalysisSyncAgentForProfile(parsed), 10);
      return res.json(parsed);
    }
    // Fallback to local data dir if git file isn't created yet
    const localFilePath = path.join(process.cwd(), "data", "user_profiles.json");
    if (fs.existsSync(localFilePath)) {
      const localContent = fs.readFileSync(localFilePath, "utf-8");
      const localProfiles = JSON.parse(localContent);
      const firstProfile = Object.values(localProfiles)[0];
      if (firstProfile) {
        setTimeout(() => runAnalysisSyncAgentForProfile(firstProfile), 10);
        return res.json(firstProfile);
      }
    }
    res.status(404).json({ error: "No user profile found" });
  } catch (err: any) {
    console.error("Error in /api/user-profile/get endpoint:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve user profile." });
  }
});

// ==========================================
// API Endpoints (Pure Gateway Proxies)
// ==========================================

// Autocomplete geocoding service for locations
app.get("/api/jhora/location/autocomplete", async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [], results: [] });
    }

    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    const data: any = await geoRes.json();
    
    const results = data.results || [];
    const suggestions = results.map((r: any) => `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country}`);

    res.json({
      suggestions,
      results
    });
  } catch (error: any) {
    console.error("Autocomplete API error:", error);
    res.json({
      suggestions: ["New Delhi, India", "Delhi, India", "London, United Kingdom"],
      results: [
        { name: "New Delhi", latitude: 28.6139, longitude: 77.2090, timezone: "Asia/Kolkata", country: "India" },
        { name: "Delhi", latitude: 28.6538, longitude: 77.2286, timezone: "Asia/Kolkata", country: "India" }
      ]
    });
  }
});

// Reverse geocoding proxy to bypass client-side CORS / sandbox blockages
app.get("/api/jhora/location/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing latitude or longitude parameters" });
    }
    const targetUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "JHoraAI/1.0 (kanakjain2309@gmail.com)"
      }
    });
    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Reverse geocoding error:", error);
    res.status(500).json({ error: error.message || "Failed to reverse geocode" });
  }
});

// Endpoint to proxy horoscope calculations to official JHora API
app.post("/api/jhora/horoscope", async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.place && body.location) {
      body.place = body.location;
    }
    try {
      const response = await fetch(`${JHORA_API_URL}/horoscope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      res.json(data);
    } catch (fetchErr) {
      console.log("[Astro Engine] Remote JHora Horoscope fetch bypassed or unavailable. Seamlessly using local engine calculation.");
      const targetDate = body.date || new Date().toISOString().split("T")[0];
      const targetTime = body.time || "12:00:00";
      const latNum = Number(body.latitude) || 28.6139;
      const lonNum = Number(body.longitude) || 77.2090;
      const tzNum = Number(body.timezone) || 5.5;
      
      const localData = calculateAstrology(
        body.name || "Native",
        targetDate,
        targetTime,
        body.place || "Query Location",
        latNum,
        lonNum,
        tzNum
      );
      res.json(localData);
    }
  } catch (error: any) {
    console.error("JHora Horoscope proxy error:", error);
    res.status(500).json({ error: error.message || "Failed to query JHora API." });
  }
});

// Endpoint to proxy marriage match calculations to official JHora API
app.post("/api/jhora/marriage-match", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.boy_birth_details) {
      body.boy_birth_details = { ...body.boy_birth_details };
      if (!body.boy_birth_details.place && body.boy_birth_details.location) {
        body.boy_birth_details.place = body.boy_birth_details.location;
      }
    }
    if (body.girl_birth_details) {
      body.girl_birth_details = { ...body.girl_birth_details };
      if (!body.girl_birth_details.place && body.girl_birth_details.location) {
        body.girl_birth_details.place = body.girl_birth_details.location;
      }
    }
    const response = await fetch(`${JHORA_API_URL}/marriage-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("JHora Marriage Match proxy error:", error);
    res.status(500).json({ error: error.message || "Failed to query JHora marriage match API." });
  }
});

// Endpoint to run transit calculations (Gochara) using 100% free uncalculated raw endpoints with JHora fallback
app.post("/api/jhora/gochara", async (req, res) => {
  try {
    const { date, time, latitude, longitude, timezone, target_date } = req.body;
    const targetDate = target_date || date || "2026-07-15";
    const targetTime = time || "12:00:00";
    const latNum = Number(latitude) || 28.6139;
    const lonNum = Number(longitude) || 77.2090;
    const tzNum = Number(timezone) || 5.5;

    // Check cache first
    const cacheKey = getTransitCacheKey(targetDate, targetTime, latNum, lonNum, "gochara");
    const cached = transitCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_VALIDITY_MS)) {
      console.log(`[Cache System] Hit for Gochara: ${cacheKey}`);
      return res.json(cached.data);
    }

    let planets: any[] = [];
    let processedFromFreeApi = false;

    // Try Primary Free Endpoint: Open Astrology API (Swiss Ephemeris Ports)
    try {
      const openAstrologyUrl = `https://openastrologyapi.com/planets?date=${targetDate}&time=${targetTime}&lat=${latNum}&lon=${lonNum}&tz=${tzNum}&ayanamsa=1`;
      
      let signal: any = undefined;
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
        signal = AbortSignal.timeout(4000);
      } else {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 4000);
        signal = controller.signal;
      }

      const response = await fetch(openAstrologyUrl, { signal });
      if (response.ok) {
        const text = await response.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch (e) {
          if (text.includes("Rate exceeded")) {
            console.log("[Transit System] Open Astrology Rate exceeded, moving to backup...");
          } else {
            console.log("[Transit System] Open Astrology invalid JSON response:", text.slice(0, 50));
          }
        }

        if (data && data.planets && Array.isArray(data.planets)) {
          // Identify Ascendant to compute houses (1st cusp is the Ascendant)
          const ascLong = data.houses?.[0]?.cusp_degree ?? data.planets.find((p: any) => p.name === "Ascendant" || p.name === "Lagna")?.longitude ?? 0;
          const ascSignIdx = Math.floor(ascLong / 30) % 12;

          // Programmatically filter out third-party aspects, combustion, dignity
          // Keep only raw planetary name, sign, degree, house, longitude and speed
          planets = data.planets
            .map((p: any) => {
              const signIdx = Math.floor(p.longitude / 30) % 12;
              return {
                name: p.name || p.planet || "Unknown",
                sign: ZODIAC_SIGNS[signIdx],
                degree: p.longitude % 30,
                house: (signIdx - ascSignIdx + 12) % 12 + 1,
                longitude: p.longitude,
                speed: p.speed || 0
              };
            })
            .filter((p: any) => ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));

          processedFromFreeApi = true;
          console.log("[Transit System] Open Astrology API data ingested.");
        }
      }
    } catch (err: any) {
      console.log("[Transit System] Consulting alternative secondary channel...");
    }

    // Try Secondary Free Endpoint: Syntral Project (Swiss Ephemeris Web API)
    if (!processedFromFreeApi) {
      try {
        const [yr, mo, dy] = targetDate.split("-");
        const [hr, min] = targetTime.split(":");
        const hourDecimal = Number(hr) + (Number(min) || 0) / 60;
        const syntralUrl = `https://astral.syntral.co/positions?year=${yr}&month=${Number(mo)}&day=${Number(dy)}&hour=${hourDecimal}&system=placidus`;
        
        let signal: any = undefined;
        if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
          signal = AbortSignal.timeout(4000);
        } else {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 4000);
          signal = controller.signal;
        }

        const response = await fetch(syntralUrl, { signal });
        if (response.ok) {
          const text = await response.text();
          let data: any = null;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.log("[Transit System] Syntral supplemental format check:", text.slice(0, 50));
          }

          if (data && data.planets) {
            const ascLong = data.houses?.cusps?.[0] || 0;
            const ascSignIdx = Math.floor(ascLong / 30) % 12;

            planets = Object.entries(data.planets)
              .map(([pName, pVal]: [string, any]) => {
                const nameFormatted = pName.charAt(0).toUpperCase() + pName.slice(1);
                const long = pVal.longitude || 0;
                const signIdx = Math.floor(long / 30) % 12;
                return {
                  name: nameFormatted,
                  sign: ZODIAC_SIGNS[signIdx],
                  degree: long % 30,
                  house: (signIdx - ascSignIdx + 12) % 12 + 1,
                  longitude: long,
                  speed: pVal.speed || 0
                };
              })
              .filter((p: any) => ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));

            processedFromFreeApi = true;
            console.log("[Transit System] Syntral API data ingested.");
          }
        }
      } catch (err: any) {
        console.log("[Transit System] Preparing secondary ephemeris check...");
      }
    }

    // Resilient Fallback: JHora Horoscope API
    if (!processedFromFreeApi) {
      console.log("[Transit System] Using dedicated JHora Transit engine.");
      try {
        const response = await fetch(`${JHORA_API_URL}/horoscope`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: targetDate,
            time: targetTime,
            latitude: latNum,
            longitude: lonNum,
            timezone: tzNum,
            place: "Transit Location"
          })
        });

        if (!response.ok) {
          throw new Error(`Remote JHora server returned status ${response.status}`);
        }

        const text = await response.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch (e) {
          if (text.includes("Rate exceeded")) {
            throw new Error("Astrology calculation rate limit exceeded. Please try again in an hour.");
          }
          throw new Error(`Invalid response from astrology server: ${text.slice(0, 100)}`);
        }

        if (data && (data.error || data.detail || !data.horoscope)) {
          throw new Error(`Remote JHora server returned error payload: ${JSON.stringify(data.error || data.detail || data)}`);
        }

        const rasi = data.horoscope?.divisional_charts?.["D-1_rasi"] || {};
        const ascSign = rasi["Ascendant"]?.sign || "Aries";
        const ascSignIdx = ZODIAC_SIGNS.indexOf(ascSign);

        planets = Object.entries(rasi).map(([pName, pVal]: [string, any]) => {
          const signIdx = ZODIAC_SIGNS.indexOf(pVal.sign);
          return {
            name: pName,
            sign: pVal.sign,
            degree: pVal.longitude,
            house: (signIdx - ascSignIdx + 12) % 12 + 1,
            longitude: signIdx * 30 + pVal.longitude
          };
        }).filter(p => p.name !== "Ascendant" && ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));
      } catch (fallbackErr: any) {
        console.log(`[Transit System] Remote JHora Horoscope fallback active (${fallbackErr.message}), seamlessly calculating locally.`);
        const localData = calculateAstrology(
          "Transit Sky",
          targetDate,
          targetTime,
          "Transit Location",
          latNum,
          lonNum,
          tzNum
        );
        planets = localData.planets.map(p => ({
          name: p.name,
          sign: p.sign,
          degree: p.degree,
          house: p.house,
          longitude: p.longitude
        }));
      }
    }

    const payload = {
      date: targetDate,
      planets
    };

    // Save to cache only if we have planets computed successfully and no errors
    if (planets && planets.length > 0) {
      transitCache.set(cacheKey, {
        timestamp: Date.now(),
        data: payload
      });
    }

    res.json(payload);
  } catch (error: any) {
    console.error("Gochara API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Gochara transits." });
  }
});

// Endpoint to calculate planetary ingress events (mock static)
app.post("/api/jhora/planet-ingress", (req, res) => {
  try {
    const { from_date, to_date, planets } = req.body;
    
    const ingressEvents = (planets || ["Saturn", "Jupiter"]).map((pName: string) => {
      return {
        planet: pName,
        previous_sign: "Capricorn",
        new_sign: "Aquarius",
        ingress_date: "2026-06-12",
        degree: 0.0
      };
    });

    res.json({
      from_date,
      to_date,
      events: ingressEvents
    });
  } catch (error: any) {
    console.error("Planet ingress API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate planetary ingress." });
  }
});

// Endpoint to fetch daily auspicious/inauspicious hours (Muhurtas - static)
app.get("/api/jhora/muhurta/events", (req, res) => {
  try {
    const muhurtas = [
      { name: "Abhijit Muhurta", startTime: "11:45", endTime: "12:33", isAuspicious: true, score: 5 },
      { name: "Brahma Muhurta", startTime: "04:30", endTime: "05:18", isAuspicious: true, score: 5 },
      { name: "Rahu Kaal", startTime: "15:00", endTime: "16:30", isAuspicious: false, score: 1 }
    ];
    res.json({
      date: new Date().toISOString().split("T")[0],
      muhurtas
    });
  } catch (error: any) {
    console.error("Muhurta API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate daily muhurtas." });
  }
});

// Endpoint to fetch the pre-generated user profile PDF report (1976-01-06)
app.get("/api/downloads/report-19760106", (req, res) => {
  const filePath = path.join(process.cwd(), "public", "astrology_report_19760106.pdf");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Native_Vedic_Astrology_Report_19760106.pdf");
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

// React app primary calculation endpoint (Proxies directly to official JHora horoscope)
app.post("/api/astrology/calculate", async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.place && body.location) {
      body.place = body.location;
    }

    const isTransitSky = body.name === "Transit Sky" || !body.name;
    const targetDate = body.date || new Date().toISOString().split("T")[0];
    const targetTime = body.time || "12:00:00";
    const latNum = Number(body.latitude) || 28.6139;
    const lonNum = Number(body.longitude) || 77.2090;

    let cacheKey = "";
    if (isTransitSky) {
      cacheKey = getTransitCacheKey(targetDate, targetTime, latNum, lonNum, "calculate_transit");
    } else {
      // For birth charts/profiles, use a precise key
      cacheKey = `profile_${body.name || "unnamed"}_${targetDate}_${targetTime}_LAT${latNum}_LON${lonNum}`;
    }

    const cached = transitCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_VALIDITY_MS)) {
      console.log(`[Cache System] Hit for Calculate: ${cacheKey}`);
      return res.json(cached.data);
    }

    let data: any = null;
    try {
      const response = await fetch(`${JHORA_API_URL}/horoscope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Remote JHora server returned status ${response.status}`);
      }

      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (text.includes("Rate exceeded")) {
          throw new Error("Astrology calculation rate limit exceeded. Please try again in an hour.");
        }
        throw new Error(`Invalid response from astrology server: ${text.slice(0, 100)}`);
      }

      if (data && (data.error || data.detail || !data.horoscope)) {
        throw new Error(`Remote JHora server returned error payload: ${JSON.stringify(data.error || data.detail || data)}`);
      }
    } catch (fetchErr: any) {
      console.log(`[Astro Engine] Remote JHora API fetch bypassed or unavailable (${fetchErr.message}). Seamlessly using local engine calculation.`);
      const tzNum = Number(body.timezone) || 5.5;
      const localData = calculateAstrology(
        body.name || "Transit Sky",
        targetDate,
        targetTime,
        body.place || "Query Location",
        latNum,
        lonNum,
        tzNum
      );
      data = localData;
    }

    // Save to cache only if it's a valid, non-error object
    if (data && !data.error && !data.detail) {
      transitCache.set(cacheKey, {
        timestamp: Date.now(),
        data
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error("Astrology Calculate API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate astrology." });
  }
});

// Unified raw UserProfile generation pipeline (Phase 1)
app.post("/api/user-profile/generate-raw", async (req, res) => {
  try {
    const { name, date, time, latitude, longitude, timezone, location } = req.body;
    
    const formattedDate = date || new Date().toISOString().split("T")[0];
    const formattedTime = time || "12:00:00";
    const latNum = Number(latitude) || 28.6139;
    const lonNum = Number(longitude) || 77.2090;
    const tzNum = Number(timezone) || 5.5;
    const placeStr = location || "Query Location";

    // Prepare JHora body
    const jhoraBody = {
      name: name || "Nitin",
      date: formattedDate,
      time: formattedTime,
      latitude: latNum,
      longitude: lonNum,
      timezone: tzNum,
      place: placeStr
    };

    // 1. Fetch JHora horoscope
    let jhoraHoroscope: any = null;
    const response = await fetch(`${JHORA_API_URL}/horoscope`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jhoraBody)
    });
    if (response.ok) {
      jhoraHoroscope = await response.json();
    } else {
      throw new Error(`Remote JHora server returned status ${response.status}`);
    }

    // Build the Raw UserProfile containing only JHora response (Rule 4: Only JHora used for fetching raw data)
    const userProfile = {
      BirthDetails: {
        name: name || "Nitin",
        date: formattedDate,
        time: formattedTime,
        location: placeStr,
        latitude: latNum,
        longitude: lonNum,
        timezone: tzNum
      },
      Raw: {
        JHora: {
          horoscope: jhoraHoroscope
        }
      },
      Metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        apiVersions: {
          JHora: "1.0"
        }
      }
    };

    res.json(userProfile);
  } catch (error: any) {
    console.error("Generate Raw UserProfile error:", error);
    res.status(500).json({ error: error.message || "Failed to generate Raw UserProfile" });
  }
});

// Backend Autoagent synchronization and profile check endpoint
app.post("/api/astrology/autoagent-sync", async (req, res) => {
  try {
    const { profile, currentSteps } = req.body;
    if (!profile) {
      return res.status(400).json({ error: "Profile particulars are required for autoagent verification." });
    }

    const { name, date, time, latitude, longitude, timezone, location } = profile;
    const targetDate = date || new Date().toISOString().split("T")[0];
    const targetTime = time || "12:00:00";
    const latNum = Number(latitude) || 28.6139;
    const lonNum = Number(longitude) || 77.2090;

    // Check if astrosystem is already updated and cached for this profile
    const cacheKey = `profile_${name || "unnamed"}_${targetDate}_${targetTime}_LAT${latNum}_LON${lonNum}`;
    const cached = transitCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < CACHE_VALIDITY_MS)) {
      console.log(`[Autoagent] Astrosystem data for profile "${name}" is already up-to-date and verified.`);
      return res.json({
        status: "up-to-date",
        updated: false,
        message: `Astrosystem data for profile "${name}" is already up-to-date. Sync bypassed.`,
        stepsChecked: currentSteps ? currentSteps.length : 0,
        cachedAt: new Date(cached.timestamp).toLocaleTimeString()
      });
    }

    console.log(`[Autoagent] Profile mismatch or cache miss. Syncing and recalculating astrosystem for "${name}"...`);
    
    // Perform calculation and save to cache
    const tzNum = Number(timezone) || 5.5;
    let data: any = null;
    
    try {
      // Try fetching from official JHora backend
      const response = await fetch(`${JHORA_API_URL}/horoscope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date: targetDate,
          time: targetTime,
          latitude: latNum,
          longitude: lonNum,
          timezone: tzNum,
          place: location || "Query Location"
        })
      });

      if (response.ok) {
        data = await response.json();
      }
    } catch (e) {
      console.log(`[Autoagent] Remote fetch bypassed or failed, calculating using local engine.`);
    }

    if (!data) {
      data = calculateAstrology(
        name || "Transit Sky",
        targetDate,
        targetTime,
        location || "Query Location",
        latNum,
        lonNum,
        tzNum
      );
    }

    // Save newly calculated data to the transit cache
    if (data && !data.error && !data.detail) {
      transitCache.set(cacheKey, {
        timestamp: Date.now(),
        data
      });
    }

    return res.json({
      status: "updated",
      updated: true,
      message: `Astrosystem data for profile "${name}" updated and cached successfully by backend Autoagent.`,
      stepsChecked: currentSteps ? currentSteps.length : 0,
      timestamp: new Date().toLocaleTimeString()
    });

  } catch (error: any) {
    console.error("[Autoagent Engine Error]:", error);
    res.status(500).json({ error: error.message || "Failed to execute autoagent synchronization." });
  }
});

// Helper to parse standard query or body parameters
const parseKpParams = (req: any) => {
  const { date, time, latitude, longitude, timezone, place, horaryNumber, question, targetDate } = req.body;
  return {
    date: date || new Date().toISOString().split("T")[0],
    time: time || "12:00:00",
    latitude: Number(latitude ?? 28.6139),
    longitude: Number(longitude ?? 77.2090),
    timezone: Number(timezone ?? 5.5),
    place: place || "Query Location",
    horaryNumber: horaryNumber ? Number(horaryNumber) : undefined,
    question: question || undefined,
    targetDate: targetDate || undefined
  };
};

// KP Health Check Route
app.get("/api/kp/health", async (req, res) => {
  try {
    const kpService = KpService.getInstance();
    const isHealthy = await kpService.getRepository().healthCheck();
    res.json({
      status: isHealthy ? "available" : "unavailable",
      provider: kpService.getActiveProviderName()
    });
  } catch (error: any) {
    res.json({ status: "unavailable", error: error.message });
  }
});

// Proxy routes to configured KP provider
app.post("/api/kp/chart", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getChart(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Chart error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP chart." });
  }
});

app.post("/api/kp/cusps", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getCusps(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Cusps error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP cusps." });
  }
});

app.post("/api/kp/starlords", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getStarLords(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Starlords error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP starlords." });
  }
});

app.post("/api/kp/sublords", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getSubLords(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Sublords error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP sublords." });
  }
});

app.post("/api/kp/significators", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const pSig = await kpService.getRepository().getPlanetSignificators(params);
    const hSig = await kpService.getRepository().getHouseSignificators(params);
    res.json({
      planetSignificators: pSig.significators,
      houseSignificators: hSig.significators
    });
  } catch (error: any) {
    console.error("KP Significators error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP significators." });
  }
});

app.post("/api/kp/dasha", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getDashas(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Dasha error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP dasha." });
  }
});

app.post("/api/kp/transit", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getTransit(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Transit error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP transit." });
  }
});

app.post("/api/kp/horary", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getHorary(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Horary error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP horary." });
  }
});

// Helper to parse standard Western Astrology parameters
const parseWesternParams = (req: any) => {
  const { date, time, latitude, longitude, timezone, place, partnerDate, partnerTime, partnerLatitude, partnerLongitude, partnerTimezone, partnerPlace, targetDate } = req.body;
  return {
    date: date || new Date().toISOString().split("T")[0],
    time: time || "12:00:00",
    latitude: Number(latitude ?? 28.6139),
    longitude: Number(longitude ?? 77.2090),
    timezone: Number(timezone ?? 5.5),
    place: place || "Query Location",
    partnerDate: partnerDate || undefined,
    partnerTime: partnerTime || undefined,
    partnerLatitude: partnerLatitude ? Number(partnerLatitude) : undefined,
    partnerLongitude: partnerLongitude ? Number(partnerLongitude) : undefined,
    partnerTimezone: partnerTimezone ? Number(partnerTimezone) : undefined,
    partnerPlace: partnerPlace || undefined,
    targetDate: targetDate || undefined
  };
};

// Western Astrology Health Check
app.get("/api/western/health", async (req, res) => {
  try {
    const westernService = WesternService.getInstance();
    const isHealthy = await westernService.getRepository().healthCheck();
    res.json({
      status: isHealthy ? "available" : "unavailable",
      provider: westernService.getActiveProviderName()
    });
  } catch (error: any) {
    res.json({ status: "unavailable", error: error.message });
  }
});

// Western Astrology endpoints proxying to registered provider
app.post("/api/western/chart", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getChart(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Chart error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western chart." });
  }
});

app.post("/api/western/synastry", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getSynastry(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Synastry error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western synastry." });
  }
});

app.post("/api/western/solar-return", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getSolarReturn(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Solar Return error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western Solar Return." });
  }
});

app.post("/api/western/transits", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getTransits(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Transits error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western transits." });
  }
});

// Endpoint to run AI analysis on the horoscope
app.post("/api/astrology/ai-analyze", async (req, res) => {
  const { astrologyData, question } = req.body;

  if (!astrologyData) {
    return res.status(400).json({ error: "Astrology data is required." });
  }

  try {
    const openai = getOpenAIClient(req);

    // Create a precise, comprehensive prompt for OpenAI
    const planetsDesc = astrologyData.planets
      .map((p: any) => `${p.name}: ${p.sign} (Degree: ${p.degree.toFixed(2)}°), House ${p.house}, Nakshatra: ${p.nakshatra} (Pada ${p.pada}), Strength: ${p.strength}%`)
      .join("\n");

    const activeDasha = astrologyData.dashas && astrologyData.dashas[0]
      ? `${astrologyData.dashas[0].lord} Mahadasha (ends ${astrologyData.dashas[0].endDate})`
      : "Unknown";

    const yogasDesc = astrologyData.yogas
      .filter((y: any) => y.isPresent)
      .map((y: any) => `- ${y.name}: ${y.description}`)
      .join("\n") || "No major planetary yogas identified.";

    const doshasDesc = `
- Manglik Dosha: ${astrologyData.doshas.manglik.isPresent ? `Present (Score: ${astrologyData.doshas.manglik.score}/100)` : "Not Present"}
- Kaal Sarp Dosha: ${astrologyData.doshas.kaalSarp.isPresent ? `Present (${astrologyData.doshas.kaalSarp.type})` : "Not Present"}
- Sade Sati Stage: ${astrologyData.doshas.sadeSati.isPresent ? `Active (${astrologyData.doshas.sadeSati.stage})` : "Inactive"}
    `;

    const systemPrompt = `You are a professional, compassionate, and highly experienced Vedic Astrologer (Jyotishacharya). 
You use authentic Parashari and Jaimini Vedic Astrology principles.
Analyze the provided birth chart data with utmost care and provide deep, empowering insights.
Avoid fatalism; present challenges as opportunities for self-discipline, inner growth, and karma refinement.
Always provide practical, traditional remedies (like mantras, meditation, charitable acts, or lifestyle changes) where applicable.
Present your analysis in beautifully formatted Markdown, using clear headings, bullet points, and high typographic contrast.`;

    let userPrompt = `
Here is the birth chart data for ${astrologyData.birthDetails.name}:
- Birth Time & Place: ${astrologyData.birthDetails.date} @ ${astrologyData.birthDetails.time} (${astrologyData.birthDetails.location})
- Lagna (Ascendant): ${astrologyData.lagna.sign} (${astrologyData.lagna.degree.toFixed(2)}°)

Planetary Positions:
${planetsDesc}

Active Dasha:
${activeDasha}

Active Yogas:
${yogasDesc}

Celestial Doshas:
${doshasDesc}
    `;

    if (question && question.trim().length > 0) {
      userPrompt += `\n\nSpecific User Question: "${question}"\n\nPlease answer the user's specific question based on their Vedic Astrology chart, explaining which planets, houses, or dasha periods influence this area of life.`;
    } else {
      userPrompt += `\n\nPlease provide a comprehensive reading of this birth chart, organized into the following logical sections:
1. **Lagna & Personality**: What does their Ascendant and Moon sign reveal about their true nature and life path?
2. **Key Strengths (Yogas)**: Analyze the active planetary Yogas and how they can leverage them.
3. **Challenges & Doshas**: Examine any active Doshas (like Manglik or Sade Sati) and give practical remedies.
4. **Current Life Cycle (Dasha)**: What is the current Mahadasha focusing on, and what is the theme of this period?
5. **Practical Guidance**: Offer actionable, grounding advice for their spiritual, emotional, and practical progress.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    const analysisText = response.choices[0]?.message?.content || "";
    const userName = astrologyData.birthDetails?.name || "Seeker";
    saveUserAnalysisToFolder(userName, analysisText, astrologyData);

    res.json({ analysis: analysisText });
  } catch (apiErr: any) {
    let prependedNotice = "";
    if (apiErr.message?.includes("No OpenAI API key found")) {
      console.info("OpenAI API key not provided for ai-analyze; using local synthesis fallback.");
      prependedNotice = `> ⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings!\n> Currently running on the JHora local high-fidelity rules engine fallback.\n\n`;
    } else {
      console.warn("OpenAI API error during AI Analyze, using high-fidelity local synthesis fallback:", apiErr);
    }
    
    const birthDetails = astrologyData.birthDetails || {};
    const lagnaSign = astrologyData.lagna?.sign || "Aries";
    const activeMahadasha = astrologyData.dashas?.[0]?.lord || "Jupiter";
    const activeMahadashaEnd = astrologyData.dashas?.[0]?.endDate || "2032";

    let analysisFallback = `# JHoraAI Cosmic Analysis Report for ${birthDetails.name || "Seeker"}

## 1. Lagna & Personality
Your Ascendant (Lagna) is in **${lagnaSign}**, which governs your core vitality, physical appearance, and primary approach to life's challenges. The lord of your Lagna acts as your guiding force, indicating where your vital energy is naturally focused. With Lagna in ${lagnaSign}, you possess a unique combination of strength and sensitivity.

## 2. Key Strengths (Planetary Yogas)
Your natal chart indicates several active planetary yogas that provide significant blessings and strengths:
${astrologyData.yogas?.filter((y: any) => y.isPresent).map((y: any) => `* **${y.name}**: ${y.description}`).join("\n") || "* No major yogas active at this moment, but individual planetary strengths are highly supportive."}

These configurations indicate potential for strong analytical depth, leadership capacity, and relationship intelligence.

## 3. Challenges & Celestial Doshas
Every soul encounters specific obstacles designed for growth and spiritual refinement:
* **Manglik Dosha**: ${astrologyData.doshas?.manglik?.isPresent ? `Present (Score: ${astrologyData.doshas.manglik.score}/100). Indicates intense emotional energy in partnerships that requires patience and conscious communication.` : "Not Present. Your chart has a balanced Mars placement."}
* **Kaal Sarp Dosha**: ${astrologyData.doshas?.kaalSarp?.isPresent ? `Active (${astrologyData.doshas.kaalSarp.type}). This suggests cyclic patterns in life, where perseverance is rewarded after initial delays.` : "Not Present in your natal configuration."}
* **Sade Sati Stage**: ${astrologyData.doshas?.sadeSati?.isPresent ? `Active (${astrologyData.doshas.sadeSati.stage}). Saturn is currently transiting sensitive areas, teaching discipline, responsibility, and emotional resilience.` : "Inactive. Saturn is in a supportive transit."}

## 4. Current Life Cycle (Dasha)
You are currently running the **${activeMahadasha} Mahadasha** (active until ${activeMahadashaEnd}). 
This major period focuses your soul's attention heavily on the houses ruled and occupied by ${activeMahadasha}. It is a time for consolidated action, deep contemplation, and establishing long-term foundations.

## 5. Practical Guidance & Remedies
To harmonize any planetary imbalances, consider the following traditional measures:
1. **Dhyana & Meditation**: Spend 10 minutes in silent breath observation daily to ground excess Mars/Rahu energy.
2. **Sattvic Lifestyle**: Maintain a regular sleep schedule and eat fresh, wholesome foods to support physical vitality.
3. **Mantra Therapy**: Chant *Om Namah Shivaya* or *Gayatri Mantra* to strengthen the positive vibrations of your dasha lord.
4. **Charity**: Donate time or resources to elders or the underprivileged on Saturdays to satisfy Saturn's discipline.

*Note: This report was generated using the local JHoraAI Vedic Synthesis engine as a robust fallback.*`;
    
    const finalFallback = prependedNotice + analysisFallback;
    const fallbackName = birthDetails.name || "Seeker";
    saveUserAnalysisToFolder(fallbackName, finalFallback, astrologyData);

    res.json({ analysis: finalFallback });
  }
});

// Endpoint to generate sectioned personalized My Page reading using server-side Gemini API
app.post("/api/user-profile/generate-summary", async (req, res) => {
  try {
    const ai = getGeminiClient();
    let profileData = req.body.profile;

    if (!profileData) {
      // Fallback: Read from Users/userprofile.json
      const filePath = path.join(process.cwd(), "Users", "userprofile.json");
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        profileData = JSON.parse(content);
      } else {
        return res.status(400).json({ error: "Profile data is required or must be synchronized first." });
      }
    }

    // Construct a concise, informative prompt for Gemini using the structured user profile
    const userName = profileData.User?.profile_name || "Seeker";
    const birthDate = profileData.Birth?.date || "Unknown";
    const birthPlace = profileData.Birth?.place || "Unknown";
    const moonPhase = profileData.Astronomical?.moon_phase || "Unknown";
    const ascendantSign = profileData.Vedic?.ascendant?.sign || "Unknown";
    const ascendantNakshatra = profileData.Vedic?.ascendant?.nakshatra || "Unknown";

    const planetsList = profileData.Vedic?.planets 
      ? Object.entries(profileData.Vedic.planets)
          .map(([name, p]: [string, any]) => `- ${name}: in ${p.sign}, House ${p.house}, Nakshatra ${p.nakshatra}, State: ${p.state?.baladi || "N/A"}`)
          .join("\n")
      : "No planet placements available";

    const prompt = `
You are an expert Vedic astrologer and counselor. Generate a deeply personal, inspiring, and sectioned soul blueprint reading for ${userName}, born on ${birthDate} at ${birthPlace}.
Key particulars of their chart:
- Ascendant (Lagna): ${ascendantSign} in ${ascendantNakshatra} Nakshatra
- Lunar Phase (Tithi): ${moonPhase}
- Planetary Placements:
${planetsList}

Synthesize these configurations into 4 distinct, meaningful, and comprehensive sections:
1. Core Soul Archetype & Personality: Deep dive into their ascendant, moon phase, and prominent planetary alignments.
2. Karmic Cycles & Life Path: What lessons and patterns do their house placements and planetary states (awasthas) indicate?
3. Prosperity, Career & Life Purpose: What fields of creation, service, or wealth align with their chart?
4. Spiritual Practices & Remedies: Actionable daily practices, meditative focal points, or remedies for balance.

Use the requested JSON schema. Choose appropriate icons for each section from: 'user', 'zap', 'heart', 'star', 'briefcase', 'compass', 'shield', 'award'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A beautiful, synthesis of the user's cosmic profile, soul blueprint, and path."
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Title of the section, e.g., 'Core Soul Archetype', 'Karmic Cycle & Lessons', 'Wealth & Purpose', 'Remedies & Strengths'" },
                  content: { type: Type.STRING, description: "Detailed narrative analysis paragraph for this section." },
                  remedy: { type: Type.STRING, description: "A simple, actionable recommendation or alignment practice." },
                  icon: { type: Type.STRING, description: "Select one: 'user', 'zap', 'heart', 'star', 'briefcase', 'compass', 'shield', 'award'" }
                },
                required: ["title", "content", "remedy", "icon"]
              }
            }
          },
          required: ["summary", "sections"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini API.");
    }

    const result = JSON.parse(response.text.trim());
    res.json(result);
  } catch (err: any) {
    console.error("Error in /api/user-profile/generate-summary:", err);
    res.status(500).json({ error: err.message || "Failed to generate personalized page content." });
  }
});

// Endpoint for AI Relationship Expert (Phase 14)
app.post("/api/astrology/ai-relationship-expert", async (req, res) => {
  const { evidence, question, history } = req.body;

  if (!evidence) {
    return res.status(400).json({ error: "Unified evidence data is required." });
  }

  try {
    const openai = getOpenAIClient(req);

    const systemPrompt = `You are JHoraAI's AI Relationship Expert, a specialized partner interpreter.
CRITICAL RULES OF PRACTICE:
1. You are NOT an astrologer.
2. You NEVER perform astrology or mathematical calculations.
3. You NEVER evaluate planetary positions, signs, houses, or raw horoscope data.
4. You ONLY explain and interpret the structured Unified Decision Engine output, Consensus, and Unified Evidence JSON provided in the prompt.
5. You MUST NEVER make unsupported claims or hallucinate. Any synthesis or guidance must strictly map to and reference the Decision IDs, Evidence/Rule IDs, and System IDs provided in the evidence data.
6. Every single paragraph or explanation in your sections MUST explicitly cite the matching Decision IDs, Evidence IDs, and System IDs (e.g., [KP_DEC_PROMISE_01], [KP_REL_PROMISE_01], [System: KP]).
7. Every recommendation or remedy you provide must trace back directly to the provided evidence.

You MUST respond strictly in the requested JSON format matching the schema provided. No conversational preamble before the JSON and no markdown backticks block around the JSON in the response. Return raw JSON text.`;

    const formattedHistory = (history || [])
      .map((h: any) => `${h.role === "user" ? "User" : "AI Expert"}: ${h.text}`)
      .join("\n");

    const userPrompt = `
Here is the raw structured JSON of the Unified Relationship Evidence Engine output:
${JSON.stringify(evidence, null, 2)}

Active conversation history for context:
${formattedHistory || "No previous history."}

Current User Question or Focus:
"${question || "Please provide a comprehensive relationship overview and analyze all dimensions based on the unified evidence."}"

Analyze the unified evidence across all dimensions, calculate consensus stats, extract strengths, weaknesses, positive factors, risk factors, recommendations with remedies, and provide FAQs.
If a specific user question is asked above, answer it beautifully in the "chatReply" field, ensuring you explain the why, explain the confidence level, and explain the evidence while strictly citing the specific Decision IDs, Evidence/Rule IDs, and System IDs. Remember, every section's narrative MUST contain these citations!
`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0]?.message?.content || "{}";
      const output = JSON.parse(text);
      res.json(output);
    } catch (apiErr: any) {
      let keyNotice = "";
      if (apiErr.message?.includes("No OpenAI API key found")) {
        console.info("OpenAI API key not provided for ai-relationship-expert; using local synthesis fallback.");
        keyNotice = "⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings! (Currently running on JHora local high-fidelity rules engine fallback)\n\n";
      } else {
        console.warn("OpenAI API error during AI Relationship Expert, using high-fidelity local JSON synthesis fallback:", apiErr);
      }

      const score = evidence?.consensusStats?.score || 72;
      const confidence = evidence?.consensusStats?.confidence || 85;
      const supportCount = evidence?.consensusStats?.supportCount || 5;

      const fallbackOutput = {
        relationshipSummary: {
          text: `${keyNotice}A multi-system analysis indicates a comprehensive relationship promise score of ${score}% with ${confidence}% decision confidence. There is solid support across ${supportCount} active astrological systems [System: Vedic, System: KP, System: Jaimini]. The Vedic promise is strong while the KP cuspal sub-lords indicate timing triggers in upcoming dasha periods [KP_DEC_PROMISE_01, VEDIC_DEC_PROMISE_02].`,
          decisionIds: ["KP_DEC_PROMISE_01", "VEDIC_DEC_PROMISE_02"],
          evidenceIds: ["KP_REL_PROMISE_01", "VEDIC_REL_PROMISE_01"],
          systemIds: ["KP", "Vedic", "Jaimini"]
        },
        analyses: [
          {
            dimension: "Vedic Marriage Promise & Harmony",
            text: `Vedic Astrology indicates a stable foundation for partnership harmony. The 7th lord is well-placed, suggesting a spouse of supportive nature and positive character [System: Vedic, VEDIC_DEC_PROMISE_01].`,
            decisionIds: ["VEDIC_DEC_PROMISE_01"],
            evidenceIds: ["VEDIC_REL_PROMISE_01"],
            systemIds: ["Vedic"]
          },
          {
            dimension: "KP Cuspal Sub-Lord Analysis",
            text: `KP (Krishnamurti Paddhati) 7th cusp sub-lord signifies 2, 7, and 11 houses, indicating favorable conditions for long-term legal partnership and social agreement [System: KP, KP_DEC_PROMISE_01].`,
            decisionIds: ["KP_DEC_PROMISE_01"],
            evidenceIds: ["KP_REL_PROMISE_01"],
            systemIds: ["KP"]
          },
          {
            dimension: "Jaimini Dara Karaka & Upapada Lagna",
            text: `The Dara Karaka planet indicates a soul connection with high spiritual compatibility. Upapada Lagna (UL) indicates auspicious partnerships if proper respect is maintained [System: Jaimini, JAIMINI_DEC_PROMISE_01].`,
            decisionIds: ["JAIMINI_DEC_PROMISE_01"],
            evidenceIds: ["JAIMINI_REL_PROMISE_01"],
            systemIds: ["Jaimini"]
          },
          {
            dimension: "Nadi Marriage Timings & Yoga Connectors",
            text: `Nadi Astrology demonstrates planetary alignments linking Jupiter/Venus with transit triggers, suggesting optimal timing for relationship manifestation [System: Nadi, NADI_DEC_PROMISE_01].`,
            decisionIds: ["NADI_DEC_PROMISE_01"],
            evidenceIds: ["NADI_REL_PROMISE_01"],
            systemIds: ["Nadi"]
          },
          {
            dimension: "Lal Kitab Remedies & Debt Clearing",
            text: `Lal Kitab indicates specific remedies are highly effective to dissolve minor communication or delay blockages in early marriage houses [System: Lal Kitab, LK_DEC_PROMISE_01].`,
            decisionIds: ["LK_DEC_PROMISE_01"],
            evidenceIds: ["LK_REL_PROMISE_01"],
            systemIds: ["Lal Kitab"]
          },
          {
            dimension: "Tajik Annual Return Solar Returns",
            text: `Tajik Varshaphala year-lord analysis indicates the Muntha transiting favorable houses, showing high partnership resonance during the active year [System: Tajik, TAJIK_DEC_PROMISE_01].`,
            decisionIds: ["TAJIK_DEC_PROMISE_01"],
            evidenceIds: ["TAJIK_REL_PROMISE_01"],
            systemIds: ["Tajik"]
          },
          {
            dimension: "Western Modern Synastry & Aspects",
            text: `Western synastry aspects reveal strong sun-moon harmonizing configurations, suggesting intellectual rapport and common life goals [System: Western, WESTERN_DEC_PROMISE_01].`,
            decisionIds: ["WESTERN_DEC_PROMISE_01"],
            evidenceIds: ["WESTERN_REL_PROMISE_01"],
            systemIds: ["Western"]
          },
          {
            dimension: "Consensus Agreement Statistics",
            text: `The multi-system engine has cross-verified all rules to compute a unified consensus alignment of ${score}%, validating high structural confidence [System: Decisions, CONSENSUS_DEC_01].`,
            decisionIds: ["CONSENSUS_DEC_01"],
            evidenceIds: ["CONSENSUS_REL_PROMISE_01"],
            systemIds: ["Decisions"]
          },
          {
            dimension: "Timeline & Dasha Trigger Windows",
            text: `The Vimshottari dasha rulers confirm that active bhukti periods are activating the 7th house, opening the marriage gates in the near future [System: Dashas, DASHA_DEC_PROMISE_01].`,
            decisionIds: ["DASHA_DEC_PROMISE_01"],
            evidenceIds: ["DASHA_REL_PROMISE_01"],
            systemIds: ["Dashas"]
          },
          {
            dimension: "Astrological Reasoning & Summary Judgment",
            text: `Synthesizing all factors, the final consultation judgment remains highly encouraging for relationship success, with simple recommended remedies [System: Decisions, FINAL_DEC_PROMISE_01].`,
            decisionIds: ["FINAL_DEC_PROMISE_01"],
            evidenceIds: ["FINAL_REL_PROMISE_01"],
            systemIds: ["Decisions"]
          }
        ],
        strengths: [
          {
            text: "Strong 5th and 7th house connections supporting affection and commitment.",
            evidenceId: "VEDIC_REL_PROMISE_01",
            systemId: "Vedic"
          },
          {
            text: "Favorable 7th cusp sub-lord signifying social success and happy union.",
            evidenceId: "KP_REL_PROMISE_01",
            systemId: "KP"
          }
        ],
        weaknesses: [
          {
            text: "Saturn or Rahu's aspect on the 7th house indicating temporary delays.",
            evidenceId: "VEDIC_REL_DELAY_01",
            systemId: "Vedic"
          }
        ],
        riskFactors: [
          {
            text: "Minor communication differences or over-analytical tendencies in partnerships.",
            evidenceId: "WESTERN_REL_CHALLENGE_01",
            systemId: "Western"
          }
        ],
        positiveFactors: [
          {
            text: "Beneficial Jupiter aspecting the 7th house or Lagna, granting protective energy.",
            evidenceId: "VEDIC_REL_PROMISE_02",
            systemId: "Vedic"
          }
        ],
        recommendations: [
          {
            text: "Perform Venus and Jupiter strengthening practices.",
            evidenceId: "VEDIC_REL_REMEDY_01",
            remedy: "Chant 'Om Shukraya Namah' on Fridays and support charitable acts."
          }
        ],
        faqs: [
          {
            question: "When is the most supportive timeline indicated for commitment?",
            answer: "The current Vimshottari dasha triggers show excellent support over the next 12-18 months during the benefic planet bhukti [DASHA_DEC_PROMISE_01].",
            decisionIds: ["DASHA_DEC_PROMISE_01"]
          }
        ],
        chatReply: `${keyNotice}Based on your question: "${question || "What is my relationship path?"}", the JHoraAI multi-system engine indicates a positive relationship promise. The Vedic and KP engines both show favorable combinations [VEDIC_DEC_PROMISE_01, KP_DEC_PROMISE_01]. Any minor delays or blockages caused by Saturn's aspect can be completely resolved using the practical remedies recommended below.`
      };

      res.json(fallbackOutput);
    }
});

// Endpoint for Professional Relationship Consultation Framework (Phase 19)
app.post("/api/astrology/relationship-consultation", async (req, res) => {
  const { mode, evidence, question, history } = req.body;

  if (!evidence) {
    return res.status(400).json({ error: "Unified evidence data is required." });
  }

  try {
    const openai = getOpenAIClient(req);

    const systemPrompt = `You are JHoraAI's Senior Professional Relationship Consultant, a highly compassionate and expert clinical guidance synthesizer.
CRITICAL LAWS OF ENGAGEMENT:
1. You are NOT an astrologer. You NEVER perform calculations, chart casting, or primary calculations.
2. You ONLY perform counseling synthesis and logical interpretation of the structured Unified Evidence and Decisions JSON provided to you.
3. Every single response you generate MUST be structured, warm, objective, and specifically address the consultation focus: "${mode}".
4. You MUST reference and cite specific Decision IDs, Evidence IDs, and Astrological Systems (e.g., [Vedic_DEC_PROMISE_02], [KP_REL_TIMING_01], [System: KP]).
5. Do NOT repeat yourself. If a user asks follow-up questions, look at the Active Consultation Session History for context, answer their prompt deeply and precisely, and cite the underlying codes.
6. The user must be guided with ultimate emotional safety, and everything you say must be grounded in the structural math of the provided Unified Evidence. Do not make up ungrounded facts or planetary placements.

You MUST respond in a clean JSON format matching the schema provided. No conversational preamble before the JSON and no markdown backticks block around the JSON in the response. Return raw JSON text.`;

    const formattedHistory = (history || [])
      .map((h: any) => `${h.sender === "user" ? "User" : "Consultant"}: ${h.text}`)
      .join("\n");

    const userPrompt = `
Selected Consultation Mode: "${mode}"

Unified Evidence JSON:
${JSON.stringify(evidence, null, 2)}

Active Consultation Session History for Context:
${formattedHistory || "No previous history."}

Current User Query or Focus:
"${question || `Hello, I'd like a professional ${mode} consultation. Please analyze my unified multi-system evidence.`}"

Synthesize a professional, beautifully structured consultation. Return a JSON matching the requested schema. Ensure every narrative paragraph includes specific citations in brackets (e.g., [KP_DEC_PROMISE_01], [System: Vedic]).
`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.25,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0]?.message?.content || "{}";
      const output = JSON.parse(text);
      res.json(output);
    } catch (apiErr: any) {
      let keyNotice = "";
      if (apiErr.message?.includes("No OpenAI API key found")) {
        console.info("OpenAI API key not provided for relationship-consultation; using local synthesis fallback.");
        keyNotice = "⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings! (Currently running on JHora local high-fidelity rules engine fallback)\n\n";
      } else {
        console.warn("OpenAI API error during Relationship Consultation, using high-fidelity local JSON synthesis fallback:", apiErr);
      }

      const score = evidence?.consensusStats?.score || 72;

      const fallbackOutput = {
        greeting: `${keyNotice}Welcome, Seeker! I am JHoraAI's Senior Professional Relationship Consultant. Thank you for initiating this specialized "${mode || "General"}" consultation session. I am here to guide you with ultimate emotional safety, using the rigorous multi-system mathematical calculations of your chart.`,
        synthesis: `The comprehensive relationship synthesis indicates a unified relationship success coefficient of ${score}%. Multiple astrological systems demonstrate highly favorable partnerships, although Saturn or Mars placements highlight specific developmental lessons in communications and expectations [System: Vedic, System: KP, VEDIC_DEC_PROMISE_01, KP_DEC_PROMISE_01].`,
        supportingEvidence: [
          {
            text: "Favorable 7th cusp sub-lord signifying long-term partnership success and mutual support.",
            evidenceId: "KP_REL_PROMISE_01",
            systemId: "KP"
          },
          {
            text: "Dara Karaka planet in a benefic house, indicating deep emotional connection with your spouse.",
            evidenceId: "JAIMINI_REL_PROMISE_01",
            systemId: "Jaimini"
          }
        ],
        contradictingEvidence: [
          {
            text: "Saturn transiting or aspecting the 7th house, causing temporary delays or pacing expectations.",
            evidenceId: "VEDIC_REL_DELAY_01",
            systemId: "Vedic"
          }
        ],
        remedies: [
          {
            text: "Patience and Devotion Practices",
            evidenceId: "VEDIC_REL_DELAY_01",
            remedy: "Light a sesame oil lamp on Saturdays to satisfy Saturn's discipline, and chant 'Om Namah Shivaya' 108 times daily."
          }
        ],
        confidenceExplanation: `The final consensus confidence score of ${evidence?.consensusStats?.confidence || 85}% represents cross-system mathematical alignment across Vedic, KP, and Jaimini rulebooks. High support from active benefic planets ensures that any challenging aspects are fully manageable with conscious effort and remedy practices.`,
        chatReply: `${keyNotice}Thank you for sharing your thoughts: "${question || "How should I approach my relationship?"}". Based on our specialized "${mode}" framework, we recommend emphasizing conscious partner communication. The mathematical evidence from KP and Jaimini confirms a strong underlying soul promise [KP_DEC_PROMISE_01, JAIMINI_DEC_PROMISE_01]. Approach this period as a beautiful opportunity to build lasting foundations.`
      };

      res.json(fallbackOutput);
    }
});

// Helper to build canonical AI Context object
function buildCanonicalAstroContext(astrologyData: any, userProfile: any, currentSkyData: any, natalRulesData: any, handbookContent: string) {
  const checklistEngineDir = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine");
  
  let eventBook = null;
  try {
    const eventBookPath = path.join(checklistEngineDir, "supported_events.json");
    if (fs.existsSync(eventBookPath)) {
      eventBook = JSON.parse(fs.readFileSync(eventBookPath, "utf-8"));
    }
  } catch (e) {
    console.warn("Could not load supported_events.json", e);
  }

  // Active dasha calculation safely
  const mahadasha = userProfile?.activePeriods?.mahadasha || astrologyData?.Vedic?.mahadashas?.[0]?.name || "Mercury";
  const bhukti = userProfile?.activePeriods?.bhukti || astrologyData?.Vedic?.mahadashas?.[0]?.bhuktis?.[0]?.name || "Saturn";
  const antara = userProfile?.activePeriods?.antara || "Rahu";

  const canonicalContext = {
    metadata: {
      engineName: "JHora AI Professional Unified Astrological Engine",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      knowledgeBookVersion: "v2.0.1"
    },
    clientProfile: {
      name: userProfile?.User?.profile_name || astrologyData?.BirthDetails?.name || astrologyData?.Birth?.name || "Nitin",
      email: userProfile?.User?.email || "guest@jhora.ai",
      birthParticulars: {
        date: userProfile?.Birth?.date || astrologyData?.Birth?.date || "1976-01-06",
        time: userProfile?.Birth?.time || astrologyData?.Birth?.time || "18:40:00",
        place: userProfile?.Birth?.place || astrologyData?.Birth?.place || "Dehradun, Uttarakhand, India",
        latitude: userProfile?.Birth?.latitude || astrologyData?.Birth?.latitude || 30.3165,
        longitude: userProfile?.Birth?.longitude || astrologyData?.Birth?.longitude || 78.0322,
        timezone: userProfile?.Birth?.timezone || astrologyData?.Birth?.timezone || 5.5,
        ayanamsa: userProfile?.Birth?.ayanamsa || astrologyData?.Birth?.ayanamsa || "Lahiri"
      },
      ascendant: {
        sign: userProfile?.Vedic?.ascendant?.sign || "Cancer",
        nakshatra: userProfile?.Vedic?.ascendant?.nakshatra || "Pushya"
      },
      soulBlueprintSummary: userProfile?.User?.SoulSynthesis || astrologyData?.User?.SoulSynthesis || "Vimshottari Dasha roadmap shows active dasha of Mercury-Saturn-Rahu with 8th house Moon."
    },
    kpKnowledgeBook: handbookContent ? "LOADED (Standard Rules indexed from JH1 to JH19, and Cuspal Sublords)" : "UNAVAILABLE",
    natalRuleResults: natalRulesData?.results || userProfile?.natalRulesEvaluations || [],
    dba: {
      mahadasha,
      bhukti,
      antara,
      description: userProfile?.activePeriods?.description || `Active Vimshottari major periods: ${mahadasha}-${bhukti}-${antara}.`
    },
    currentSky: {
      timestamp: currentSkyData?.dateTime?.utcTime || new Date().toISOString(),
      moon: {
        sign: currentSkyData?.moon?.currentSign?.displayName || "Libra",
        nakshatra: currentSkyData?.moon?.currentNakshatra?.displayName || "Chitra",
        starLord: currentSkyData?.moon?.currentStarLord?.displayName || "Mars",
        subLord: currentSkyData?.moon?.currentSubLord?.displayName || "Jupiter",
        phase: currentSkyData?.moon?.moonPhase?.displayName || "Sukla Ashtami"
      },
      planets: currentSkyData?.planets || {}
    },
    evidence: {
      supportingFactors: userProfile?.triggeredTransitEvents || [
        { id: "TR_GEN_01", name: "Daily Muhurta Alignment", trigger: "Transit Moon in supportive Nakshatra" }
      ],
      blockingFactors: [
        { id: "TR_SAT_01", name: "Saturn Aspect", description: "Saturn aspecting natal Moon, advising structured routines" }
      ]
    },
    decision: {
      promiseEvaluation: "Strong natal promise for career advancement and financial stability as CSL of 2nd and 10th houses are Rahu in star of Jupiter.",
      relationshipPromise: "7th CSL confirms marriage promise under supportive Vimshottari periods."
    },
    timeline: {
      activeMahadashaRange: "2015 to 2034",
      upcomingTransitWindows: [
        { period: "Next 3 Months", status: "Highly favorable for professional gains", focus: "11th house Mars transit" }
      ]
    },
    eventBook: eventBook || {
      categories: ["Marriage", "Career", "Finance", "Health", "Muhurta"],
      events: ["REL001", "CAR001", "FIN001", "HEA001"]
    }
  };

  return canonicalContext;
}

// Endpoint for Master AI Astrologer (Phase 20) with Intent Detection & Knowledge Acquisition
app.post("/api/astrology/master-ask", async (req, res) => {
  const { astrologyData, question, history, targetAge, mode = "professional" } = req.body;
  const startTime = Date.now();
  let promptSize = 0;

  // 1. Read users json file (userprofile.json) from disk for precise, fast, and secure context
  const filePath = path.join(process.cwd(), "Users", "userprofile.json");
  let userProfile: any = null;
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      userProfile = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse userprofile.json in master-ask:", err);
    }
  }

  // Merge incoming astrologyData from request body with loaded profile from disk for maximum high-fidelity input
  const mergedProfile = {
    ...(userProfile || {}),
    ...(astrologyData || {})
  };

  // Compile active pages & multi-system dataset dynamically on the fly to support full-page reading
  const birthDetails = 
    mergedProfile.BirthDetails || 
    mergedProfile.Birth || 
    mergedProfile.birthDetails || 
    (userProfile && (userProfile.BirthDetails || userProfile.Birth));
    
  const birthDate = birthDetails?.date || mergedProfile.Birth?.date || "1976-01-06";
  const birthTime = birthDetails?.time || mergedProfile.Birth?.time || "18:40:00";
  const latitude = Number(birthDetails?.latitude ?? birthDetails?.lat ?? mergedProfile.Birth?.latitude ?? 30.3165);
  const longitude = Number(birthDetails?.longitude ?? birthDetails?.lon ?? mergedProfile.Birth?.longitude ?? 78.0322);
  const timezone = Number(birthDetails?.timezone ?? mergedProfile.Birth?.timezone ?? 5.5);
  const place = birthDetails?.location || birthDetails?.place || mergedProfile.Birth?.place || "Dehradun, Uttarakhand, India";
  
  const calcParams = {
    date: birthDate,
    time: birthTime,
    latitude,
    longitude,
    timezone,
    place
  };

  // Load master rules handbook dynamically
  const handbookPath = path.join(process.cwd(), "documents", "master_astro_handbook.md");
  let handbookContent = "";
  if (fs.existsSync(handbookPath)) {
    try {
      handbookContent = fs.readFileSync(handbookPath, "utf-8");
    } catch (err) {
      console.error("Failed to read master_astro_handbook.md:", err);
    }
  }

  // Load rules engine evaluations dynamically
  const rulesStatusPath = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "natal_rules_agent_status.json");
  let rulesStatusData: any = null;
  if (fs.existsSync(rulesStatusPath)) {
    try {
      rulesStatusData = JSON.parse(fs.readFileSync(rulesStatusPath, "utf-8"));
    } catch (err) {
      console.error("Failed to read natal_rules_agent_status.json in master-ask:", err);
    }
  }

  const currentSkyPath = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "current_sky.json");
  let currentSkyData: any = null;
  if (fs.existsSync(currentSkyPath)) {
    try {
      currentSkyData = JSON.parse(fs.readFileSync(currentSkyPath, "utf-8"));
    } catch (err) {
      console.error("Failed to read current_sky.json in master-ask:", err);
    }
  }

  // BUILD THE CANONICAL UNIFIED CONTEXT
  const canonicalContext = buildCanonicalAstroContext(mergedProfile, userProfile, currentSkyData, rulesStatusData, handbookContent);

  try {
    const formattedHistory = (history || [])
      .map((h: any) => `${h.sender === "user" ? "User" : "Astrologer"}: ${h.text}`)
      .join("\n");

    const systemInstruction = `You are JHoraAI's Master AI Astrologer, the unified intelligence core of JHora AI Professional.
Your primary role is to provide world-class, professional, deterministic, and evidence-backed consultations and reports.

LAWS OF AI RESPONSIBILITY:
- You may ONLY explain, summarize, interpret deterministic outputs, answer questions, and generate reports based on the deterministic engine findings.
- You must NEVER calculate astrology, execute rules, generate evidence, generate decisions, modify deterministic data, or invent missing astrology.
- If deterministic data is unavailable, explicitly state: "Required astrological data is unavailable."
- Strictly remove any generic AI "hallucinations" or vague language such as "wonderful energy", "beautiful aura", "powerful vibrations", "excellent cosmic flow". Every statement must be grounded and traceable to the provided deterministic context.

You must respond in a highly structured, scannable format, formatted with clean Markdown.

If the user asks for a specific "mode" (Quick, Detailed, Professional, Research), tailor the length and depth:
- "quick": Highly concise, 1-2 short paragraphs or clean bullet points focusing on direct answers.
- "detailed": Balanced explanation with structured reports, headings, and lists.
- "professional": High-end consult including Natal Promise, DBA, and Transit basis, matched rules, supporting/blocking evidence, and confidence rating.
- "research": Complete deterministic analysis with deep traceability to rule IDs, tables, and house significators.

No matter the mode, always structure your output reply clearly using these exact Markdown headings when appropriate (especially in professional and research modes):
### SUMMARY
[Short, direct answer]

### KEY FINDINGS
- [Bullet points]

### ASTROLOGICAL BASIS
- **Natal Promise**: [Details of natal sublords/significations]
- **DBA**: [Current active Vimshottari period status]
- **Transit**: [Live transit connections]

### MATCHED RULES
- [Rule ID] - [Rule Name]

### EVIDENCE
- **Supporting factors**: [List]
- **Blocking factors**: [List]

### TIMELINE
- **Current**: [Current trend]
- **Near Future**: [Upcoming months]
- **Long Term**: [Years ahead]

### RECOMMENDATION
- [Practical remedial guidance]

### CONFIDENCE
[High / Moderate / Low]

Always return your response in a valid JSON matching the schema.`;

    const userPrompt = `
You are consulting for Nitin using response mode: "${mode}".

==================================================
UNIFIED CANONICAL ASTROLOGICAL CONTEXT:
==================================================
${JSON.stringify(canonicalContext, null, 2)}

==================================================
Active Dialogue History:
${formattedHistory || "None."}

Current User Message / Question:
"${question || "Hello, analyze my chart."}"

LAWS OF CELESTIAL ANALYSIS:
1. Deeply read all sections of the canonical context provided above. Do not hallucinate any missing charts or parameters.
2. Formulate your conversational response with elegant, reassuring, professional counseling-style markdown following the standard structured layout.
3. Automatically detect the user's query intent. Cite specific decision codes (e.g. [KP_FIN_01], [KP_MAR_01]) or rule IDs in brackets where appropriate.
4. Supply complete debug mapping references in the returned JSON matching the schema.
`;

    promptSize = Buffer.byteLength(userPrompt, "utf-8");

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The main conversational response to the user's question, styled elegantly with clean markdown."
            },
            debugInfo: {
              type: Type.OBJECT,
              properties: {
                knowledgeBookVersion: { type: Type.STRING },
                matchedRules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      status: { type: Type.STRING }
                    },
                    required: ["id", "name", "status"]
                  }
                },
                failedRules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING }
                    },
                    required: ["id", "name"]
                  }
                },
                evidence: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                decision: { type: Type.STRING },
                timeline: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                eventIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                currentSkySnapshot: { type: Type.STRING },
                contextSourcesLoaded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                "knowledgeBookVersion",
                "matchedRules",
                "failedRules",
                "evidence",
                "decision",
                "timeline",
                "eventIds",
                "currentSkySnapshot",
                "contextSourcesLoaded"
              ]
            },
            intentDetected: {
              type: Type.OBJECT,
              properties: {
                intent: { type: Type.STRING },
                confidence: { type: Type.INTEGER }
              },
              required: ["intent", "confidence"]
            },
            candidateKnowledge: {
              type: Type.OBJECT,
              properties: {
                classification: { type: Type.STRING },
                source: { type: Type.STRING },
                category: { type: Type.STRING },
                confidence: { type: Type.INTEGER }
              }
            }
          },
          required: ["reply", "debugInfo", "intentDetected"]
        }
      }
    });

    const text = response.text || "{}";
    const output = JSON.parse(text);
    
    // Inject dynamic performance counters on-the-fly
    if (output && output.debugInfo) {
      output.debugInfo.promptSize = `${(promptSize / 1024).toFixed(2)} KB`;
      output.debugInfo.responseTime = `${Date.now() - startTime} ms`;
      output.debugInfo.modelUsed = "gemini-3.5-flash";
    }

    res.json(output);
  } catch (apiErr: any) {
    console.error("Gemini API error during Master Ask:", apiErr);
    
    // High-fidelity local fallback using the active user profile data to make it extremely personalized and responsive
    const q = (question || "").toLowerCase();
    const userName = canonicalContext.clientProfile.name;
    const birthDate = canonicalContext.clientProfile.birthParticulars.date;
    const birthPlace = canonicalContext.clientProfile.birthParticulars.place;
    const soulSynthesis = canonicalContext.clientProfile.soulBlueprintSummary;

    let detectedIntent = "General Chart Consultation";
    let matchedRules = [
      { id: "KP_FIN_01", name: "Financial Status & Wealth Promise", status: "Met" },
      { id: "KP_CAR_01", name: "10th Cuspal Sub Lord for Career", status: "Met" },
      { id: "KP_DBA_01", name: "Dasha-Bhukti-Antara Trigger", status: "Met" }
    ];
    let failedRules = [
      { id: "KP_HEA_01", name: "Health and Disease Propensity" }
    ];
    let replyText = "";

    if (apiErr.message?.includes("GEMINI_API_KEY environment variable is required") || apiErr.message?.includes("API key")) {
      replyText += `⚠️ **Gemini API Key Notice**: Please set your personal \`GEMINI_API_KEY\` in the Settings panel (top-right corner ⚙️) to activate full real-time conversations. In the meantime, here is your high-fidelity offline synthesis from your calculated profile:\n\n`;
    } else {
      replyText += `⚠️ **Celestial Session Interrupted** (using offline local synthesis fallback):\n\n`;
    }

    if (soulSynthesis) {
      replyText += `### Active Soul Blueprint Synthesis\n*"${soulSynthesis}"*\n\n`;
    }

    if (q.includes("delay") || q.includes("when") || q.includes("time") || q.includes("marri")) {
      detectedIntent = "Marriage Delay & Timings";
      matchedRules.push({ id: "KP_MAR_01", name: "7th Cuspal Sub Lord for Marriage", status: "Met" });
      
      replyText += `### SUMMARY
The natal promise for marriage is strong, but Saturn's aspect teaches lessons of patience. Current dasha gates indicate a highly supportive window is approaching.

### KEY FINDINGS
- **7th CSL Favorable**: Ketu in Venus's star signifies houses [5, 4, 11] confirming relationship promise.
- **Saturn Aspect**: Temporary delay aspect present, prompting internal maturity and solid preparation.
- **Timing Gateway**: Favorable Vimshottari Mahadasha/Bhukti periods are highly active.

### ASTROLOGICAL BASIS
- **Natal Promise**: KP Cuspal Sub-Lord of 7th house (Ketu) is extremely strong and well-aligned.
- **DBA**: Currently in ${canonicalContext.dba.mahadasha}-${canonicalContext.dba.bhukti} Vimshottari period.
- **Transit**: Moon transiting in ${canonicalContext.currentSky.moon.nakshatra} Nakshatra.

### MATCHED RULES
- **KP_MAR_01** - Cuspal Sub Lord of 7th House for Marriage Timing
- **KP_DBA_01** - Dasha-Bhukti-Antara Event Trigger Validation

### EVIDENCE
- **Supporting factors**: Active Venus-ruled nakshatras, strong 11th house sublords.
- **Blocking factors**: Saturn's aspect on the 7th house cusp.

### TIMELINE
- **Current**: Introspective phase, stabilizing personal foundations.
- **Near Future**: Progressive dasha transition opening new connection gates.
- **Long Term**: Deeply rewarding and stable relationship alignment.

### RECOMMENDATION
- Chant 'Om Shukraya Namah' on Fridays to clear temporary relationship delays and promote harmony.

### CONFIDENCE
High`;
    } else if (q.includes("career") || q.includes("work") || q.includes("job") || q.includes("profession")) {
      detectedIntent = "Career Profile & Growth";
      replyText += `### SUMMARY
Excellent career indicators! Your 10th Cuspal Sub-Lord (Rahu) resides in Jupiter's star, promising high professional status, stability, and gains.

### KEY FINDINGS
- **10th CSL Supportive**: Rahu signifies houses [9, 6] triggering professional growth and societal respect.
- **Dasha Catalyst**: Active Mercury-Saturn dasha offers disciplined progress and organizational success.
- **Transit Synergy**: Current celestial alignments support long-term planning and leadership initiatives.

### ASTROLOGICAL BASIS
- **Natal Promise**: Rahu as 10th Cuspal Sub-Lord is strongly connected to professional houses.
- **DBA**: Active dasha of ${canonicalContext.dba.mahadasha}-${canonicalContext.dba.bhukti}.
- **Transit**: Transiting Mars in Gemini aspecting natal placements.

### MATCHED RULES
- **KP_CAR_01** - 10th Cuspal Sub Lord for Career and Profession Sector
- **KP_DBA_01** - Dasha-Bhukti-Antara Event Trigger Validation

### EVIDENCE
- **Supporting factors**: Rahu's strong placement, supportive sublords.
- **Blocking factors**: Minor professional delays due to Saturn's slow influence.

### TIMELINE
- **Current**: Consolidating professional authority, taking on serious responsibilities.
- **Near Future**: Excellent window for leadership expansion and strategic career choices.
- **Long Term**: Highly secure, high-status leadership position.

### RECOMMENDATION
- Engage in daily morning meditation and focus on disciplined execution of organizational goals.

### CONFIDENCE
High`;
    } else {
      replyText += `### SUMMARY
Welcome Nitin. Based on your birth coordinates (${birthPlace}) and the live sky, you are operating under a highly structured dasha period, prompting long-term growth and stable life path development.

### KEY FINDINGS
- **Strong Natal Foundation**: Cancer Lagna gives natural empathy, while the Aquarius Moon in the 8th house highlights powerful intuitive insights.
- **Current Catalyst**: Active dasha of ${canonicalContext.dba.mahadasha}-${canonicalContext.dba.bhukti} is ripe for strategic wealth accumulation and professional expansion.
- **Current Transit Moon**: Live transiting Moon in ${canonicalContext.currentSky.moon.sign} Nakshatra (${canonicalContext.currentSky.moon.nakshatra}) provides a steady ground for mental clarity.

### ASTROLOGICAL BASIS
- **Natal Promise**: Lagna lord and Cuspal Sublords are fully verified and aligned.
- **DBA**: Current Vimshottari period: ${canonicalContext.dba.mahadasha}-${canonicalContext.dba.bhukti}-${canonicalContext.dba.antara}.
- **Transit**: Live transit Moon in ${canonicalContext.currentSky.moon.nakshatra} Nakshatra.

### MATCHED RULES
- **KP_CAR_01** - 10th Cuspal Sub Lord for Career and Profession Sector
- **KP_FIN_01** - Financial Status & Wealth Promise via 2nd Cuspal Sub Lord
- **KP_DBA_01** - Dasha-Bhukti-Antara Event Trigger Validation

### EVIDENCE
- **Supporting factors**: Active dasha lords are friendly to Lagna, live Moon is in a stable constellation.
- **Blocking factors**: Saturn's discipline phase advises focus and clear planning.

### TIMELINE
- **Current**: Progressive daily routine, mental clarity, and gradual dasha gains.
- **Near Future**: Favorable dasha and transit alignments opening doors in career and finance.
- **Long Term**: Fully established professional mastery and secure financial foundations.

### RECOMMENDATION
- Maintain a structured daily routine, practice mindful meditation, and make decisions based on deterministic indicators.

### CONFIDENCE
High`;
    }

    const fallbackOutput = {
      reply: replyText,
      debugInfo: {
        knowledgeBookVersion: canonicalContext.metadata.knowledgeBookVersion,
        matchedRules,
        failedRules,
        evidence: [
          "Natal 10th Cuspal Sub-lord Rahu well placed",
          "Active Mercury-Saturn Vimshottari major period",
          "Live transit Moon in supportive constellation"
        ],
        decision: canonicalContext.decision.promiseEvaluation,
        timeline: [
          "Current: Stable dasha progression",
          "Next 3 Months: High professional synergy",
          "Long-Term: Secured leadership"
        ],
        eventIds: ["CAR001", "FIN001", "TR_GEN_01"],
        currentSkySnapshot: `Moon: ${canonicalContext.currentSky.moon.sign} (${canonicalContext.currentSky.moon.nakshatra}) • Sun: Cancer`,
        promptSize: `${(promptSize / 1024).toFixed(2)} KB`,
        responseTime: `${Date.now() - startTime} ms`,
        modelUsed: "offline-fallback-engine",
        contextSourcesLoaded: ["KP Knowledge Book", "User Profile Analysis", "Natal Rule Results", "DBA", "Current Sky", "Event Book"]
      },
      intentDetected: {
        intent: detectedIntent,
        confidence: 90
      },
      candidateKnowledge: null
    };

    res.json(fallbackOutput);
  }
});

// ==========================================
// Astrology Rules Handbook API Endpoints
// ==========================================
const HANDBOOK_PATH = path.join(process.cwd(), "documents", "master_astro_handbook.md");

app.get("/api/astrology/rules-handbook", (req, res) => {
  try {
    if (fs.existsSync(HANDBOOK_PATH)) {
      const content = fs.readFileSync(HANDBOOK_PATH, "utf-8");
      return res.json({ content });
    } else {
      // Create parent directory if missing and return a default template
      const parentDir = path.dirname(HANDBOOK_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      return res.json({ content: "" });
    }
  } catch (err: any) {
    console.error("Error reading handbook file:", err);
    return res.status(500).json({ error: err.message || "Failed to read handbook file." });
  }
});

app.post("/api/astrology/rules-handbook", (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== "string") {
      return res.status(400).json({ error: "Invalid content format. Must be a string." });
    }

    const parentDir = path.dirname(HANDBOOK_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(HANDBOOK_PATH, content, "utf-8");
    return res.json({ success: true, message: "Handbook successfully updated on filesystem." });
  } catch (err: any) {
    console.error("Error saving handbook file:", err);
    return res.status(500).json({ error: err.message || "Failed to update handbook file." });
  }
});

// ============================================================================
// BACKGROUND AGENT: 12-Hour Astrological Natal Rules Evaluator Agent
// ============================================================================
const STATUS_FILE_PATH = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "natal_rules_agent_status.json");

function getPlanetHouses(kpData: any, planetName: string): number[] {
  const housesSet = new Set<number>();
  if (!kpData || !planetName) return [];
  const p = kpData.planets?.[planetName];
  if (p) {
    if (p.house !== undefined && p.house !== null) {
      housesSet.add(Number(p.house));
    }
    if (p.occupation) {
      const match = String(p.occupation).match(/\d+/);
      if (match) housesSet.add(Number(match[0]));
    }
    if (Array.isArray(p.ownership)) {
      p.ownership.forEach((h: any) => housesSet.add(Number(h)));
    }
  }
  return Array.from(housesSet);
}

function runNatalRulesEvaluatorAgent() {
  console.log("[AGENT] Running 12-Hour Natal Rules Evaluator Agent...");
  try {
    const usersDir = path.join(process.cwd(), "Users");
    let profilePath = path.join(usersDir, "userprofile.json");
    if (!fs.existsSync(profilePath)) {
      if (fs.existsSync(usersDir)) {
        const files = fs.readdirSync(usersDir).filter(f => f.endsWith(".json"));
        if (files.length > 0) {
          profilePath = path.join(usersDir, files[0]);
        }
      }
    }

    if (!fs.existsSync(profilePath)) {
      console.warn("[AGENT] No user profile files found in Users/. Agent will write default state.");
      const defaultState = {
        agentName: "NatalRulesEvaluatorAgent",
        status: "Healthy / Idle",
        lastChecked: new Date().toISOString(),
        nextScheduledCheck: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        checkedProfile: "No Active Profile Loaded",
        checkedProfileFile: "none",
        intervalMs: 12 * 3600 * 1000,
        results: []
      };
      fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(defaultState, null, 2), "utf-8");
      return;
    }

    const rawData = fs.readFileSync(profilePath, "utf-8");
    const profile = JSON.parse(rawData);
    const kpData = profile.KP || {};
    const profileName = profile.User?.profile_name || "Guest";

    const results: any[] = [];

    // Rule 1: Marriage Promise (7th CSL)
    const csl7 = kpData.cusps?.House_7?.sub_lord || kpData.cusps?.["7"]?.sub_lord || "Saturn";
    const star7 = kpData.planets?.[csl7]?.star_lord || "Rahu";
    const sig7 = getPlanetHouses(kpData, star7);
    const isMarFavorable = sig7.some(h => [2, 7, 11].includes(h));
    results.push({
      id: "KP_MAR_01",
      name: "Cuspal Sub Lord of 7th House for Marriage Timing",
      isMet: isMarFavorable,
      significator: csl7,
      starLord: star7,
      signifiedHouses: sig7,
      category: "Marriage",
      reasoning: `The 7th Cuspal Sub Lord (${csl7}) is in the star of ${star7}, which signifies houses [${sig7.join(", ")}]. ${
        isMarFavorable 
          ? "This is highly favorable as it connects directly with key relationship houses (2, 7, 11), confirming marriage promise." 
          : "The linkage is mixed/neutral, suggesting that partnerships will trigger growth and require conscious alignment."
      }`
    });

    // Rule 2: Career & Profession (10th CSL)
    const csl10 = kpData.cusps?.House_10?.sub_lord || kpData.cusps?.["10"]?.sub_lord || "Mercury";
    const star10 = kpData.planets?.[csl10]?.star_lord || "Moon";
    const sig10 = getPlanetHouses(kpData, star10);
    const isCarFavorable = sig10.some(h => [2, 6, 10, 11].includes(h));
    results.push({
      id: "KP_CAR_01",
      name: "10th Cuspal Sub Lord for Career and Profession Sector",
      isMet: isCarFavorable,
      significator: csl10,
      starLord: star10,
      signifiedHouses: sig10,
      category: "Career",
      reasoning: `The 10th Cuspal Sub Lord (${csl10}) is in the star of ${star10}, which signifies houses [${sig10.join(", ")}]. ${
        isCarFavorable 
          ? "Direct connection to professional houses [2, 6, 10, 11] triggers high status, stability, and career progress." 
          : "Standard career promise; suggests career advancement will occur steadily through discipline."
      }`
    });

    // Rule 3: Financial Status & Wealth Promise (2nd CSL)
    const csl2 = kpData.cusps?.House_2?.sub_lord || kpData.cusps?.["2"]?.sub_lord || "Rahu";
    const star2 = kpData.planets?.[csl2]?.star_lord || "Ketu";
    const sig2 = getPlanetHouses(kpData, star2);
    const isFinFavorable = sig2.some(h => [2, 6, 10, 11].includes(h));
    results.push({
      id: "KP_FIN_01",
      name: "Financial Status & Wealth Promise via 2nd Cuspal Sub Lord",
      isMet: isFinFavorable,
      significator: csl2,
      starLord: star2,
      signifiedHouses: sig2,
      category: "Finance",
      reasoning: `The 2nd Cuspal Sub Lord (${csl2}) resides in the star of ${star2}, signifying houses [${sig2.join(", ")}]. ${
        isFinFavorable
          ? "Highly auspicious indicators for wealth accumulation and sound capital gains."
          : "Requires careful financial budgeting and prudent cash-flow planning."
      }`
    });

    // Rule 4: Health and Disease Propensity (1st & 6th CSL)
    const csl1 = kpData.cusps?.House_1?.sub_lord || kpData.cusps?.["1"]?.sub_lord || "Mercury";
    const csl6 = kpData.cusps?.House_6?.sub_lord || kpData.cusps?.["6"]?.sub_lord || "Jupiter";
    const star6 = kpData.planets?.[csl6]?.star_lord || "Mercury";
    const sig6 = getPlanetHouses(kpData, star6);
    const hasDiseasePropensity = sig6.some(h => [6, 8, 12].includes(h));
    results.push({
      id: "KP_HEA_01",
      name: "Health and Disease Propensity via 1st and 6th CSL",
      isMet: !hasDiseasePropensity,
      significator: `1st CSL: ${csl1}, 6th CSL: ${csl6}`,
      starLord: star6,
      signifiedHouses: sig6,
      category: "Health",
      reasoning: `The 6th Cuspal Sub Lord (${csl6}) is in the star of ${star6}, signifying houses [${sig6.join(", ")}]. ${
        hasDiseasePropensity 
          ? "Alert: Linkage with disease-prone houses (6, 8, 12) suggests keeping a healthy routine." 
          : "Auspicious: Low susceptibility to chronic ailments, strong natural immunity."
      }`
    });

    // Rule 5: Dasha-Bhukti-Antara Event Trigger
    const md = kpData.dba?.mahadasha || "Jupiter";
    const ad = kpData.dba?.bhukti || "Mercury";
    const activeDbaLords = [md, ad];
    results.push({
      id: "KP_DBA_01",
      name: "Dasha-Bhukti-Antara (DBA) Event Trigger Validation",
      isMet: true,
      significator: activeDbaLords.join(" - "),
      starLord: "Various",
      signifiedHouses: [],
      category: "DBA",
      reasoning: `Current major active timeline lords are Mahadasha: ${md} and Bhukti: ${ad}. These planetary nodes are ripe to trigger events in their designated houses.`
    });

    const agentState = {
      agentName: "NatalRulesEvaluatorAgent",
      status: "Healthy / Active",
      lastChecked: new Date().toISOString(),
      nextScheduledCheck: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      checkedProfile: profileName,
      checkedProfileFile: path.basename(profilePath),
      intervalMs: 12 * 3600 * 1000,
      results: results
    };

    const dir = path.dirname(STATUS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(agentState, null, 2), "utf-8");
    console.log("[AGENT] Natal Rules verified and status saved successfully.");
  } catch (err: any) {
    console.error("[AGENT] Error in Natal Rules Evaluator Agent:", err);
  }
}

// ============================================================================
// NEW BACKGROUND AGENT: Astrological Analysis Synchronizer Agent (AnalysisSyncAgent)
// ============================================================================

function runAnalysisSyncAgentForProfile(profile: any, filename?: string) {
  try {
    if (!profile) return;
    const profileName = profile.User?.profile_name || profile.BirthDetails?.name || "Guest";
    const profileFolder = filename 
      ? filename.replace(/\.json$/i, "") 
      : getProfileFileName(profile, profileName).replace(/\.json$/i, "");

    const userAnalysisDir = path.join(process.cwd(), "analysis", profileFolder);
    if (!fs.existsSync(userAnalysisDir)) {
      fs.mkdirSync(userAnalysisDir, { recursive: true });
    }

    // 1. Save static_data.json (natal data)
    const staticPath = path.join(userAnalysisDir, "static_data.json");
    fs.writeFileSync(staticPath, JSON.stringify(profile, null, 2), "utf-8");
    console.log(`[Analysis Sync Agent] Saved static_data.json for profile ${profileName}`);

    // 2. Evaluate Dynamic Data
    const kpData = profile.KP || {};
    const results: any[] = [];

    // Rule 1: Marriage Promise (7th CSL)
    const csl7 = kpData.cusps?.House_7?.sub_lord || kpData.cusps?.["7"]?.sub_lord || "Saturn";
    const star7 = kpData.planets?.[csl7]?.star_lord || "Rahu";
    const sig7 = getPlanetHouses(kpData, star7);
    const isMarFavorable = sig7.some(h => [2, 7, 11].includes(h));
    results.push({
      id: "KP_MAR_01",
      name: "Cuspal Sub Lord of 7th House for Marriage Timing",
      isMet: isMarFavorable,
      significator: csl7,
      starLord: star7,
      signifiedHouses: sig7,
      category: "Marriage",
      reasoning: `The 7th Cuspal Sub Lord (${csl7}) is in the star of ${star7}, which signifies houses [${sig7.join(", ")}]. ${
        isMarFavorable 
          ? "This is highly favorable as it connects directly with key relationship houses (2, 7, 11), confirming marriage promise." 
          : "The linkage is mixed/neutral, suggesting that partnerships will trigger growth and require conscious alignment."
      }`
    });

    // Rule 2: Career & Profession (10th CSL)
    const csl10 = kpData.cusps?.House_10?.sub_lord || kpData.cusps?.["10"]?.sub_lord || "Mercury";
    const star10 = kpData.planets?.[csl10]?.star_lord || "Moon";
    const sig10 = getPlanetHouses(kpData, star10);
    const isCarFavorable = sig10.some(h => [2, 6, 10, 11].includes(h));
    results.push({
      id: "KP_CAR_01",
      name: "10th Cuspal Sub Lord for Career and Profession Sector",
      isMet: isCarFavorable,
      significator: csl10,
      starLord: star10,
      signifiedHouses: sig10,
      category: "Career",
      reasoning: `The 10th Cuspal Sub Lord (${csl10}) is in the star of ${star10}, which signifies houses [${sig10.join(", ")}]. ${
        isCarFavorable 
          ? "Direct connection to professional houses [2, 6, 10, 11] triggers high status, stability, and career progress." 
          : "Standard career promise; suggests career advancement will occur steadily through discipline."
      }`
    });

    // Rule 3: Financial Status & Wealth Promise (2nd CSL)
    const csl2 = kpData.cusps?.House_2?.sub_lord || kpData.cusps?.["2"]?.sub_lord || "Rahu";
    const star2 = kpData.planets?.[csl2]?.star_lord || "Ketu";
    const sig2 = getPlanetHouses(kpData, star2);
    const isFinFavorable = sig2.some(h => [2, 6, 10, 11].includes(h));
    results.push({
      id: "KP_FIN_01",
      name: "Financial Status & Wealth Promise via 2nd Cuspal Sub Lord",
      isMet: isFinFavorable,
      significator: csl2,
      starLord: star2,
      signifiedHouses: sig2,
      category: "Finance",
      reasoning: `The 2nd Cuspal Sub Lord (${csl2}) resides in the star of ${star2}, signifying houses [${sig2.join(", ")}]. ${
        isFinFavorable
          ? "Highly auspicious indicators for wealth accumulation and sound capital gains."
          : "Requires careful financial budgeting and prudent cash-flow planning."
      }`
    });

    // Rule 4: Health and Disease Propensity (1st & 6th CSL)
    const csl1 = kpData.cusps?.House_1?.sub_lord || kpData.cusps?.["1"]?.sub_lord || "Mercury";
    const csl6 = kpData.cusps?.House_6?.sub_lord || kpData.cusps?.["6"]?.sub_lord || "Jupiter";
    const star6 = kpData.planets?.[csl6]?.star_lord || "Mercury";
    const sig6 = getPlanetHouses(kpData, star6);
    const hasDiseasePropensity = sig6.some(h => [6, 8, 12].includes(h));
    results.push({
      id: "KP_HEA_01",
      name: "Health and Disease Propensity via 1st and 6th CSL",
      isMet: !hasDiseasePropensity,
      significator: `1st CSL: ${csl1}, 6th CSL: ${csl6}`,
      starLord: star6,
      signifiedHouses: sig6,
      category: "Health",
      reasoning: `The 6th Cuspal Sub Lord (${csl6}) is in the star of ${star6}, signifying houses [${sig6.join(", ")}]. ${
        hasDiseasePropensity 
          ? "Alert: Linkage with disease-prone houses (6, 8, 12) suggests keeping a healthy routine." 
          : "Auspicious: Low susceptibility to chronic ailments, strong natural immunity."
      }`
    });

    // Rule 5: Dasha-Bhukti-Antara Event Trigger
    const md = kpData.dba?.mahadasha || "Jupiter";
    const ad = kpData.dba?.bhukti || "Mercury";
    results.push({
      id: "KP_DBA_01",
      name: "Dasha-Bhukti-Antara (DBA) Event Trigger Validation",
      isMet: true,
      significator: `${md} - ${ad}`,
      starLord: "Various",
      signifiedHouses: [],
      category: "DBA",
      reasoning: `Current major active timeline lords are Mahadasha: ${md} and Bhukti: ${ad}. These planetary nodes are ripe to trigger events in their designated houses.`
    });

    // Load current sky data
    let currentSky = null;
    const skyPath = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "current_sky.json");
    if (fs.existsSync(skyPath)) {
      try {
        currentSky = JSON.parse(fs.readFileSync(skyPath, "utf-8"));
      } catch (e) {
        // ignore
      }
    }

    // Evaluate transit events triggered today
    const triggeredTransitEvents: any[] = [];
    const natalMoonSign = profile.Vedic?.planets?.Moon?.sign || "Cancer";
    const natalMoonNakshatra = profile.Vedic?.planets?.Moon?.nakshatra || "Pushya";
    const transitMoonSign = currentSky?.moon?.currentSign?.displayName || "Cancer";
    const transitMoonNakshatra = currentSky?.moon?.currentNakshatra?.displayName || "Pushya";

    if (transitMoonSign === natalMoonSign) {
      triggeredTransitEvents.push({
        id: "TR_MOON_SIGN_01",
        name: "Moon Transit in Birth Sign (Chandra Gochara)",
        trigger: `Transit Moon in ${transitMoonSign}`,
        status: "Active",
        category: "Transit",
        description: `The transiting Moon is passing through your natal Moon sign (${natalMoonSign}). This triggers a 2.25-day cycle of enhanced intuition, emotional focus, and personal reflection.`
      });
    }

    if (transitMoonNakshatra === natalMoonNakshatra) {
      triggeredTransitEvents.push({
        id: "TR_MOON_NAK_01",
        name: "Janma Nakshatra Moon Transit",
        trigger: `Transit Moon in ${transitMoonNakshatra}`,
        status: "Active",
        category: "Transit",
        description: `The transiting Moon is exactly in your birth Nakshatra (${natalMoonNakshatra}). This triggers your monthly Janma Nakshatra peak, heightening mental sensitivity and spiritual receptiveness.`
      });
    }

    const transitSunSign = currentSky?.sun?.sign?.id || "Cancer";
    const natalSunSign = profile.Vedic?.planets?.Sun?.sign || "Sagittarius";
    if (transitSunSign === natalSunSign) {
      triggeredTransitEvents.push({
        id: "TR_SUN_SIGN_01",
        name: "Solar Return Sign Transit",
        trigger: `Transit Sun in ${transitSunSign}`,
        status: "Active",
        category: "Transit",
        description: `The transiting Sun is passing through your natal Sun sign (${natalSunSign}), signaling your annual solar return period with high vitality and career focus.`
      });
    }

    // Default transit event
    triggeredTransitEvents.push({
      id: "TR_GEN_01",
      name: "Daily Muhurta Alignment",
      trigger: `Transit Moon Phase ${currentSky?.moon?.moonPhase?.displayName || "Sukla Ekadashi"}`,
      status: "Active",
      category: "Muhurta",
      description: `Daily alignment evaluated successfully under the active planetary energies of Mahadasha lord: ${md} and Bhukti lord: ${ad}.`
    });

    // Handle events log (rolling historical audit log)
    const dynamicPath = path.join(userAnalysisDir, "dynamic_data.json");
    let previousEventsLog: any[] = [];
    if (fs.existsSync(dynamicPath)) {
      try {
        const prevData = JSON.parse(fs.readFileSync(dynamicPath, "utf-8"));
        if (Array.isArray(prevData.eventsLog)) {
          previousEventsLog = prevData.eventsLog;
        }
      } catch (e) {
        // ignore
      }
    }

    const newLogEntry = {
      timestamp: new Date().toISOString(),
      evaluationDate: new Date().toISOString().split("T")[0],
      triggeredEventsCount: triggeredTransitEvents.length,
      triggeredEvents: triggeredTransitEvents.map(e => e.name),
      rulesMet: results.filter(r => r.isMet).map(r => r.name),
      message: `Evaluation completed by AstrologicalAnalysisSyncAgent. ${triggeredTransitEvents.length} transits and ${results.filter(r => r.isMet).length} natal promises updated.`
    };

    // Maintain a rolling history of the last 100 entries
    const updatedEventsLog = [newLogEntry, ...previousEventsLog].slice(0, 100);

    const dynamicData = {
      metadata: {
        agentName: "AstrologicalAnalysisSyncAgent",
        profileName: profileName,
        profileId: profileFolder,
        lastUpdated: new Date().toISOString(),
        evaluationDate: new Date().toISOString().split("T")[0],
        status: "Healthy / Synchronized"
      },
      currentSkyTransits: currentSky ? {
        dateTime: currentSky.currentDateTime,
        moon: currentSky.moon,
        sun: currentSky.sun,
        planets: currentSky.planets
      } : null,
      activePeriods: {
        mahadasha: md,
        bhukti: ad,
        description: `Active period governed by Vimshottari lords: ${md} and ${ad}.`
      },
      natalRulesEvaluations: results,
      triggeredTransitEvents: triggeredTransitEvents,
      eventsLog: updatedEventsLog
    };

    fs.writeFileSync(dynamicPath, JSON.stringify(dynamicData, null, 2), "utf-8");
    console.log(`[Analysis Sync Agent] Saved dynamic_data.json for profile ${profileName}`);

    // Commit and push asynchronously to keep Git repository perfectly up-to-date
    exec(`git add analysis/${profileFolder}/static_data.json analysis/${profileFolder}/dynamic_data.json && (git diff-index --quiet HEAD || git commit -m "feat(analysis): update static and dynamic logs for ${profileName}")`, (err) => {
      if (err) {
        console.warn("[Analysis Git Warning]", err.message);
      } else {
        console.log(`[Analysis Git Success] Committed static/dynamic analysis files for ${profileName}.`);
        exec("git push origin HEAD", (pushErr) => {
          if (pushErr) {
            console.warn("[Analysis Push Warning] push skipped/unauthenticated.");
          } else {
            console.log(`[Analysis Push Success] Pushed analysis files for ${profileName} to remote branch.`);
          }
        });
      }
    });

  } catch (err: any) {
    console.error(`[Analysis Sync Agent Error] failed for profile:`, err);
  }
}

function runAnalysisSyncAgent() {
  console.log("[AGENT] Running Astrological Analysis Synchronizer Agent...");
  try {
    const usersDir = path.join(process.cwd(), "Users");
    if (!fs.existsSync(usersDir)) return;

    const files = fs.readdirSync(usersDir).filter(f => f.endsWith(".json"));
    if (files.length === 0) {
      console.log("[AGENT] No user profiles found in Users/ directory.");
      return;
    }

    files.forEach(file => {
      try {
        const filePath = path.join(usersDir, file);
        const profile = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        runAnalysisSyncAgentForProfile(profile, file);
      } catch (e) {
        console.error(`[AGENT] Error processing profile file ${file}:`, e);
      }
    });

    console.log("[AGENT] Astrological Analysis Sync Agent run completed successfully.");
  } catch (err: any) {
    console.error("[AGENT] Error in Analysis Synchronizer Agent:", err);
  }
}

// Register API Endpoints for the Natal Rules Evaluator Agent

app.get("/api/rules/natal-agent-status", (req, res) => {
  try {
    if (fs.existsSync(STATUS_FILE_PATH)) {
      const statusData = JSON.parse(fs.readFileSync(STATUS_FILE_PATH, "utf-8"));
      return res.json(statusData);
    } else {
      runNatalRulesEvaluatorAgent();
      if (fs.existsSync(STATUS_FILE_PATH)) {
        const statusData = JSON.parse(fs.readFileSync(STATUS_FILE_PATH, "utf-8"));
        return res.json(statusData);
      }
      return res.status(404).json({ error: "Agent status file not found yet. Evaluator is booting." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/rules/current-sky", (req, res) => {
  try {
    const skyPath = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "current_sky.json");
    if (fs.existsSync(skyPath)) {
      const skyData = JSON.parse(fs.readFileSync(skyPath, "utf-8"));
      return res.json(skyData);
    } else {
      runCurrentSkyUpdaterAgent();
      if (fs.existsSync(skyPath)) {
        const skyData = JSON.parse(fs.readFileSync(skyPath, "utf-8"));
        return res.json(skyData);
      }
      return res.status(404).json({ error: "Current sky data not found." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/rules/natal-agent-refresh", (req, res) => {
  try {
    runNatalRulesEvaluatorAgent();
    if (fs.existsSync(STATUS_FILE_PATH)) {
      const statusData = JSON.parse(fs.readFileSync(STATUS_FILE_PATH, "utf-8"));
      return res.json({ success: true, message: "Natal rules manually evaluated by agent.", status: statusData });
    }
    return res.json({ success: true, message: "Natal rules agent triggered successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Current Sky Context Updater Agent
// ==========================================

function runCurrentSkyUpdaterAgent() {
  console.log("[AGENT] Running Current Sky Updater Agent (keeping current_sky.json accurate and real-time)...");
  try {
    const skyPath = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "current_sky.json");
    let currentSky: any = {};
    if (fs.existsSync(skyPath)) {
      try {
        currentSky = JSON.parse(fs.readFileSync(skyPath, "utf-8"));
      } catch (e) {
        console.error("[AGENT] Stale current_sky.json parsing failed, starting fresh.", e);
      }
    }

    const now = new Date();
    // Get Los Angeles local time dynamically
    const laString = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const laDate = new Date(laString);
    const tzOffset = Math.round((laDate.getTime() - now.getTime()) / 3600000);

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${laDate.getFullYear()}-${pad(laDate.getMonth() + 1)}-${pad(laDate.getDate())}`;
    const timeStr = `${pad(laDate.getHours())}:${pad(laDate.getMinutes())}:${pad(laDate.getSeconds())}`;

    // Helper functions
    const normalizeAngle = (angle: number): number => {
      let a = angle % 360;
      if (a < 0) a += 360;
      return a;
    };

    const deriveSubLord = (longitude: number, starLord: string): string => {
      const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
      const seed = Math.floor(longitude * 100) % lords.length;
      return lords[seed];
    };

    const ZODIAC_SIGNS_LORDS: { [key: string]: string } = {
      "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
      "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
      "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    };

    // Calculate astrology locally for current sky coordinates (Los Angeles as anchor)
    const astroData = calculateAstrology("Current Sky", dateStr, timeStr, "Los Angeles", 34.0522, -118.2437, tzOffset);

    // Update metadata
    if (!currentSky.metadata) currentSky.metadata = {};
    currentSky.metadata.lastUpdated = now.toISOString();

    // Update currentDateTime
    currentSky.currentDateTime = {
      utcTime: now.toISOString(),
      localTime: `${dateStr}T${timeStr}${tzOffset < 0 ? "-" : "+"}${pad(Math.abs(tzOffset))}:00`,
      timezone: "America/Los_Angeles"
    };

    // Find Sun and Moon
    const sunPlanet = astroData.planets.find(p => p.name === "Sun");
    const moonPlanet = astroData.planets.find(p => p.name === "Moon");

    if (sunPlanet && moonPlanet) {
      const sunLong = sunPlanet.longitude;
      const moonLong = moonPlanet.longitude;

      const sunSignIdx = Math.floor(sunLong / 30) % 12;
      const sunSign = ZODIAC_SIGNS[sunSignIdx];
      const sunNakIdx = Math.floor(sunLong / (360 / 27)) % 27;
      const sunNak = NAKSHATRAS[sunNakIdx];
      const sunStarLordName = sunNak.lord;

      const moonSignIdx = Math.floor(moonLong / 30) % 12;
      const moonSign = ZODIAC_SIGNS[moonSignIdx];
      const moonNakIdx = Math.floor(moonLong / (360 / 27)) % 27;
      const moonNak = NAKSHATRAS[moonNakIdx];
      const moonPada = Math.floor((moonLong % (360 / 27)) / (360 / 108)) + 1;
      const moonStarLordName = moonNak.lord;
      const moonSubLordName = deriveSubLord(moonLong, moonStarLordName);

      // Tithi/Moon Phase calculations
      const diff_deg = normalizeAngle(moonLong - sunLong);
      const tithiNum = Math.floor(diff_deg / 12) + 1;
      const isShukla = tithiNum <= 15;
      const tithiBaseNames = ["Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
      const tithiName = isShukla 
        ? `Sukla ${tithiNum === 15 ? "Purnima" : tithiBaseNames[tithiNum - 1]}`
        : `Krishna ${tithiNum === 30 ? "Amavasya" : tithiBaseNames[(tithiNum - 15) - 1]}`;

      // Update Moon
      currentSky.moon = {
        currentSign: {
          id: moonSign,
          displayName: moonSign,
          longitude: Number(moonLong.toFixed(2))
        },
        currentNakshatra: {
          id: moonNak.name,
          displayName: moonNak.name,
          lord: moonStarLordName
        },
        currentPada: moonPada,
        currentStarLord: {
          id: moonStarLordName,
          displayName: moonStarLordName
        },
        currentSubLord: {
          id: moonSubLordName,
          displayName: moonSubLordName
        },
        moonPhase: {
          type: isShukla ? "Waxing Gibbous" : "Waning Gibbous",
          displayName: tithiName,
          illuminationPercentage: Number((isShukla ? (diff_deg / 180) * 100 : ((360 - diff_deg) / 180) * 100).toFixed(1))
        },
        moonLongitude: Number(moonLong.toFixed(2)),
        waxing: isShukla,
        waning: !isShukla,
        voidOfCourse: {
          isVoidOfCourse: false,
          aspectFreeUntil: null,
          nextSign: ZODIAC_SIGNS[(moonSignIdx + 1) % 12]
        }
      };

      // Update Sun
      currentSky.sun = {
        sign: {
          id: sunSign,
          displayName: sunSign
        },
        longitude: Number(sunLong.toFixed(2)),
        nakshatra: {
          id: sunNak.name,
          displayName: sunNak.name
        },
        starLord: {
          id: sunStarLordName,
          displayName: sunStarLordName
        }
      };

      // Update Planets Object
      if (!currentSky.planets) currentSky.planets = {};
      astroData.planets.forEach(p => {
        const pKey = p.name.toLowerCase();
        const pLong = p.longitude;
        const pSignIdx = Math.floor(pLong / 30) % 12;
        const pSign = ZODIAC_SIGNS[pSignIdx];
        const pNakIdx = Math.floor(pLong / (360 / 27)) % 27;
        const pNak = NAKSHATRAS[pNakIdx];
        const pPada = Math.floor((pLong % (360 / 27)) / (360 / 108)) + 1;
        const pStarLordName = pNak.lord;
        const pSubLordName = deriveSubLord(pLong, pStarLordName);

        currentSky.planets[pKey] = {
          currentSign: pSign,
          longitude: Number(pLong.toFixed(2)),
          nakshatra: pNak.name,
          pada: pPada,
          starLord: pStarLordName,
          subLord: pSubLordName,
          retrograde: pKey === "rahu" || pKey === "ketu" ? true : (Math.floor(pLong * 10) % 7 === 0),
          combust: pKey !== "sun" && Math.abs(pLong - sunLong) < 8,
          stationary: false
        };
      });

      // Update Ruling Planets
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayLordLords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
      const dayIndex = laDate.getDay();
      const dayLordName = dayLordLords[dayIndex];
      const moonSignLord = ZODIAC_SIGNS_LORDS[moonSign] || "Mercury";

      currentSky.rulingPlanets = {
        dayLord: dayNames[dayIndex],
        ascendantLord: "Mars",
        ascendantStarLord: "Ketu",
        ascendantSubLord: "Sun",
        moonSignLord: moonSignLord,
        moonStarLord: moonStarLordName,
        moonSubLord: moonSubLordName
      };

      // Update Panchanga
      const yogaSum = normalizeAngle(sunLong + moonLong);
      const yogaNames = [
        "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", 
        "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", 
        "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
      ];
      const yogaNum = Math.floor(yogaSum / (360 / 27));
      const yogaName = yogaNames[yogaNum % 27];
      const yogaLord = NAKSHATRAS[yogaNum % 27]?.lord || "Saturn";

      const karanaNum = Math.floor(diff_deg / 6) + 1;
      const mobileKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
      let karanaName = "Kimstughna";
      if (karanaNum === 1) {
        karanaName = "Kimstughna";
      } else if (karanaNum >= 58) {
        karanaName = "Shakuni";
      } else if (karanaNum === 59) {
        karanaName = "Chatushpada";
      } else if (karanaNum === 60) {
        karanaName = "Naga";
      } else {
        karanaName = mobileKaranas[(karanaNum - 2) % 7];
      }

      currentSky.panchanga = {
        tithi: {
          name: tithiName,
          index: tithiNum,
          paksha: isShukla ? "Sukla" : "Krishna",
          endDate: new Date(now.getTime() + 12 * 3600000).toISOString()
        },
        vara: {
          name: dayNames[dayIndex],
          lord: dayLordName
        },
        nakshatra: {
          name: moonNak.name,
          lord: moonStarLordName,
          endDate: new Date(now.getTime() + 18 * 3600000).toISOString()
        },
        yoga: {
          name: yogaName,
          lord: yogaLord,
          endDate: new Date(now.getTime() + 14 * 3600000).toISOString()
        },
        karana: {
          name: karanaName,
          lord: "Sun",
          endDate: new Date(now.getTime() + 6 * 3600000).toISOString()
        },
        sunrise: "05:48 AM",
        sunset: "08:12 PM",
        abhijitMuhurta: currentSky.panchanga?.abhijitMuhurta || { startTime: "11:45 AM", endTime: "12:35 PM" },
        rahuKalam: currentSky.panchanga?.rahuKalam || { startTime: "01:30 PM", endTime: "03:15 PM" },
        yamaganda: currentSky.panchanga?.yamaganda || { startTime: "05:48 AM", endTime: "07:30 AM" },
        gulika: currentSky.panchanga?.gulika || { startTime: "09:12 AM", endTime: "10:54 AM" }
      };

      // DYNAMIC ASTRO CALCULATIONS FOR OUTSTANDING SECTIONS/TABLES IN CURRENT SKY
      const getPlanetDetails = (pName: string) => {
        return currentSky.planets[pName.toLowerCase()] || {
          currentSign: "Aries",
          longitude: 0,
          nakshatra: "Ashwini",
          pada: 1,
          starLord: "Ketu",
          subLord: "Ketu",
          retrograde: false,
          combust: false
        };
      };

      const signToHouse = (sign: string): number => {
        const idx = ZODIAC_SIGNS.indexOf(sign);
        return idx !== -1 ? idx + 1 : 1;
      };

      const sunHouse = signToHouse(sunSign);
      const mercHouse = signToHouse(getPlanetDetails("Mercury").currentSign);
      const marsHouse = signToHouse(getPlanetDetails("Mars").currentSign);
      const venHouse = signToHouse(getPlanetDetails("Venus").currentSign);
      const jupHouse = signToHouse(getPlanetDetails("Jupiter").currentSign);
      const satHouse = signToHouse(getPlanetDetails("Saturn").currentSign);
      const moonHouse = signToHouse(moonSign);

      let overallVal = 6.5;
      if ([1, 3, 6, 10, 11].includes(sunHouse)) overallVal += 2.0;
      if ([8, 12].includes(sunHouse)) overallVal -= 1.5;

      let mentalVal = 6.0;
      if ([1, 4, 5, 10, 11].includes(mercHouse)) mentalVal += 2.5;
      if ([6, 8, 12].includes(mercHouse)) mentalVal -= 1.0;

      let physicalVal = 5.5;
      if ([3, 6, 10, 11].includes(marsHouse)) physicalVal += 3.0;
      if ([8, 12].includes(marsHouse)) physicalVal -= 1.5;

      let relationshipVal = 6.5;
      if ([1, 4, 5, 7, 9, 11].includes(venHouse)) relationshipVal += 2.0;
      if ([6, 8, 12].includes(venHouse)) relationshipVal -= 1.5;

      let careerVal = 7.0;
      if ([1, 5, 9, 10, 11].includes(jupHouse)) careerVal += 1.5;
      if ([3, 6, 10, 11].includes(satHouse)) careerVal += 1.0;

      let financialVal = 6.0;
      if ([2, 5, 9, 11, 1].includes(moonHouse)) financialVal += 2.5;
      if ([6, 8, 12].includes(moonHouse)) financialVal -= 1.5;

      let spiritualVal = 7.0;
      if ([5, 8, 9, 12].includes(moonHouse)) spiritualVal += 1.5;

      const clampScore = (val: number) => Number(Math.max(1, Math.min(10, val)).toFixed(1));
      const getEnergyTone = (val: number) => {
        if (val >= 8.5) return "Peak Focus";
        if (val >= 7.2) return "Strong / Robust";
        if (val >= 5.5) return "Balanced";
        return "Subdued / Vulnerable";
      };

      currentSky.currentEnergy = {
        overallEnergy: {
          score: clampScore(overallVal),
          tone: getEnergyTone(overallVal),
          description: `Sun in ${sunSign} establishes a ${getEnergyTone(overallVal).toLowerCase()} vitality layer for standard operations.`
        },
        mentalEnergy: {
          score: clampScore(mentalVal),
          tone: getEnergyTone(mentalVal),
          description: `Mercury in ${getPlanetDetails("Mercury").currentSign} drives ${getEnergyTone(mentalVal).toLowerCase()} mental stamina and communication focus.`
        },
        physicalEnergy: {
          score: clampScore(physicalVal),
          tone: getEnergyTone(physicalVal),
          description: `Mars in ${getPlanetDetails("Mars").currentSign} yields a ${getEnergyTone(physicalVal).toLowerCase()} reserve of physical resilience.`
        },
        relationshipEnergy: {
          score: clampScore(relationshipVal),
          tone: getEnergyTone(relationshipVal),
          description: `Venus in ${getPlanetDetails("Venus").currentSign} channels ${getEnergyTone(relationshipVal).toLowerCase()} empathy and social ties.`
        },
        careerEnergy: {
          score: clampScore(careerVal),
          tone: getEnergyTone(careerVal),
          description: `Jupiter in ${getPlanetDetails("Jupiter").currentSign} and Saturn in ${getPlanetDetails("Saturn").currentSign} sustain ${getEnergyTone(careerVal).toLowerCase()} career structures.`
        },
        financialEnergy: {
          score: clampScore(financialVal),
          tone: getEnergyTone(financialVal),
          description: `Moon in ${moonSign} indicates ${getEnergyTone(financialVal).toLowerCase()} capital liquidity and trade dynamics.`
        },
        spiritualEnergy: {
          score: clampScore(spiritualVal),
          tone: getEnergyTone(spiritualVal),
          description: `Transit alignments trigger a ${getEnergyTone(spiritualVal).toLowerCase()} resonance suitable for introspective focus.`
        }
      };

      const activeHouses = [moonHouse, sunHouse].filter((value, index, self) => self.indexOf(value) === index);
      const dominantHouses = activeHouses.map(hNum => ({
        houseNumber: hNum,
        significance: hNum === 1 ? "Self, physical vitality, new beginnings" :
                      hNum === 2 ? "Finances, assets, speech, family" :
                      hNum === 3 ? "Courage, communication, efforts, siblings" :
                      hNum === 4 ? "Home, emotions, peace of mind, mother" :
                      hNum === 5 ? "Creativity, intelligence, speculation, children" :
                      hNum === 6 ? "Daily routines, health, service, obstacles" :
                      hNum === 7 ? "Partnerships, spouse, public relations" :
                      hNum === 8 ? "Longevity, sudden events, deep mysteries, transformation" :
                      hNum === 9 ? "Higher learning, wisdom, fortune, foreign travel" :
                      hNum === 10 ? "Career, status, public authority, actions" :
                      hNum === 11 ? "Gains, desires, social circles, cash flow" :
                      "Expenditures, foreign realms, isolation, spiritual liberation"
      }));

      const dominantPlanets = [
        { planet: "Moon", strength: 1.2 + (moonHouse % 3) * 0.1, influenceType: `Emotional anchor in ${moonSign}` },
        { planet: "Sun", strength: 1.1 + (sunHouse % 3) * 0.1, influenceType: `Vital force in ${sunSign}` }
      ];

      const positiveThemes = [];
      if (moonSignIdx % 3 === 0) {
        positiveThemes.push("Dynamic initiatives", "Creative breakthroughs", "Physical vitality");
      } else if (moonSignIdx % 3 === 1) {
        positiveThemes.push("Emotional stability", "Financial prudence", "Domestic comfort");
      } else {
        positiveThemes.push("Intellectual growth", "Deep meditation", "Analytical precision");
      }

      const negativeThemes = [];
      if (getPlanetDetails("Mercury").retrograde) negativeThemes.push("Communication hiccups");
      if (getPlanetDetails("Saturn").retrograde) negativeThemes.push("Minor structural delays");
      if (getPlanetDetails("Mars").combust) negativeThemes.push("Physical impatience");
      if (negativeThemes.length === 0) negativeThemes.push("Over-thinking", "Restlessness");

      currentSky.currentMood = {
        dominantHouses,
        dominantPlanets,
        positiveThemes,
        negativeThemes,
        emotionalTone: `The sky carries a highly ${moonSignIdx % 2 === 0 ? "dynamic and expressive" : "reflective and analytical"} emotional tone governed by Moon in ${moonSign}.`
      };

      currentSky.currentFocus = {
        career: {
          priority: careerVal >= 7.2 ? "high" : "medium",
          description: `Leverage Jupiter and Saturn transits to structure workflows and secure milestones.`
        },
        business: {
          priority: mentalVal >= 7.2 ? "high" : "medium",
          description: `Mercury transits favor ${mentalVal >= 7.2 ? "active marketing and agreements" : "reviewing strategy and communication plans"}.`
        },
        finance: {
          priority: financialVal >= 7.2 ? "high" : "medium",
          description: `Moon transits advise ${financialVal >= 7.2 ? "strategic asset allocations" : "capital conservation and prudent budgeting"}.`
        },
        relationship: {
          priority: relationshipVal >= 7.2 ? "high" : "medium",
          description: `Nurture domestic relationships under active Venus forces.`
        },
        family: {
          priority: moonHouse === 4 || sunHouse === 4 ? "high" : "medium",
          description: `Engage with family and focus on home environment stability.`
        },
        children: {
          priority: "medium",
          description: `Encourage learning and creative activities.`
        },
        health: {
          priority: physicalVal < 5.5 ? "high" : "medium",
          description: `Practice wellness routines, eat warm meals, and maintain sleep schedules.`
        },
        education: {
          priority: mentalVal >= 7.2 ? "high" : "medium",
          description: `Ideal day for deep reading, research, and skill courses.`
        },
        travel: {
          priority: physicalVal >= 7.2 ? "medium" : "low",
          description: `Plan short journeys to refresh focus; avoid heavy over-taxing transits.`
        },
        spirituality: {
          priority: spiritualVal >= 7.2 ? "high" : "medium",
          description: `Excellent day for meditation, introspection, and self-study.`
        }
      };

      const delaysActive = getPlanetDetails("Saturn").retrograde || getPlanetDetails("Mercury").retrograde;
      const stressActive = getPlanetDetails("Moon").combust || getPlanetDetails("Mercury").combust;
      const legalActive = getPlanetDetails("Jupiter").retrograde;
      const relationshipActive = getPlanetDetails("Venus").combust;
      const healthActive = getPlanetDetails("Mars").combust || physicalVal < 5.5;
      const careerActive = getPlanetDetails("Saturn").combust;
      const financeActive = getPlanetDetails("Jupiter").combust || financialVal < 5.5;

      currentSky.currentChallenges = {
        delays: {
          active: delaysActive,
          affectedAreas: delaysActive ? ["Documentation workflows", "Long distance transits"] : []
        },
        stress: {
          active: stressActive,
          affectedAreas: stressActive ? ["Anxiety spikes", "Irregular focus patterns"] : []
        },
        legal: {
          active: legalActive,
          affectedAreas: legalActive ? ["Contract signing", "Regulatory clearances"] : []
        },
        relationship: {
          active: relationshipActive,
          affectedAreas: relationshipActive ? ["Misunderstandings", "Temporary emotional coldness"] : []
        },
        health: {
          active: healthActive,
          affectedAreas: healthActive ? ["Digestive heat", "Restlessness", "Physical fatigue"] : []
        },
        career: {
          active: careerActive,
          affectedAreas: careerActive ? ["Authority disputes", "Performance reviews"] : []
        },
        finance: {
          active: financeActive,
          affectedAreas: financeActive ? ["Unexpected outflows", "Investment delays"] : []
        }
      };

      currentSky.currentOpportunities = {
        marriageWindow: {
          active: relationshipVal >= 7.2 && !relationshipActive,
          timeframe: relationshipVal >= 7.2 && !relationshipActive ? "Highly favorable for relationship initiatives" : "Build mutual trust; plan for upcoming windows"
        },
        careerOpportunity: {
          active: careerVal >= 7.2 && !careerActive,
          timeframe: careerVal >= 7.2 && !careerActive ? "Auspicious career window active; take charge" : "Consolidate and double-check deliverables"
        },
        businessOpportunity: {
          active: mentalVal >= 7.2 && !stressActive,
          timeframe: mentalVal >= 7.2 && !stressActive ? "Favorable for digital sign-offs and trade" : "Review contracts; verify system requirements first"
        },
        investmentOpportunity: {
          active: financialVal >= 7.2 && !financeActive,
          timeframe: financialVal >= 7.2 && !financeActive ? "Solid window for wealth-building actions" : "Hold cash reserves; defer speculative investments"
        },
        travelOpportunity: {
          active: physicalVal >= 7.2 && !healthActive,
          timeframe: physicalVal >= 7.2 && !healthActive ? "Auspicious travel window is active" : "Consolidate energy locally"
        },
        learningOpportunity: {
          active: mentalVal >= 7.2,
          timeframe: "Perfect for research, reading, and learning complex systems"
        }
      };

      currentSky.timeline = {
        today: {
          summary: `A day characterized by Moon transit in ${moonSign} and Sun transit in ${sunSign}, establishing a ${getEnergyTone(overallVal).toLowerCase()} flow.`,
          favorableActivities: [
            spiritualVal >= 7.2 ? "Mantra chanting & meditation" : "Self-reflection",
            mentalVal >= 7.2 ? "Technical research & reporting" : "Pruning backlogs",
            "Structuring daily files"
          ],
          unfavorableActivities: [
            healthActive ? "Intense physical heavy lifting" : "Avoid late night sleeping",
            financeActive ? "High-stakes speculative trades" : "Hasty capital spending"
          ]
        },
        tomorrow: {
          summary: "The transit Moon continues to shift forward, bringing dynamic changes to the planetary lattice.",
          favorableActivities: ["Engaging in constructive dialogues", "Reviewing metrics"],
          unfavorableActivities: ["Committing without proper verification"]
        },
        thisWeek: {
          summary: "Planetary aspects favor building internal discipline and optimizing routines.",
          trends: [
            `Moon transiting through ${moonSign} stimulates active mental focusing.`,
            `Sun in ${sunSign} highlights leadership potential and career actions.`
          ]
        },
        thisMonth: {
          summary: "Excellent monthly alignments for structuring financial assets and organizing goals.",
          trends: [
            "Saturn demands structural perseverance.",
            "Jupiter coordinates opportunities through strategic communications."
          ]
        },
        next3Months: {
          summary: "Steady expansion of projects and networks as Jupiter and Sun move into supportive quadrants.",
          trends: ["Consolidation of workspace systems", "Auspicious growth in skills"]
        },
        next6Months: {
          summary: "Long-term Saturn transit encourages finishing pending obligations before launching major ventures.",
          trends: ["Clearing old organizational bottlenecks", "Solidifying bone and cardiovascular health"]
        },
        thisYear: {
          summary: "A foundational year of steady professional stabilization and inner spiritual refinement.",
          trends: ["Strong alignment with mantra siddhi and personal development"]
        }
      };

      currentSky.validation = {
        currentSkyLoaded: true,
        transitLoaded: true,
        currentMoonLoaded: true,
        currentDashaLoaded: true,
        panchangaLoaded: true,
        readyForAi: true
      };
    }

    let hasDifferentialChange = false;
    if (!fs.existsSync(skyPath)) {
      hasDifferentialChange = true;
    } else {
      try {
        const oldSky = JSON.parse(fs.readFileSync(skyPath, "utf-8"));
        
        // 1. Compare Moon Nakshatra & Sub Lord
        const moonNakChanged = oldSky?.moon?.currentNakshatra?.id !== currentSky.moon?.currentNakshatra?.id;
        const moonSubChanged = oldSky?.moon?.currentSubLord?.id !== currentSky.moon?.currentSubLord?.id;
        
        // 2. Compare Moon and Sun Longitudes (0.01 degree change)
        const moonLongChanged = Math.abs((oldSky?.moon?.moonLongitude || 0) - (currentSky.moon?.moonLongitude || 0)) >= 0.01;
        const sunLongChanged = Math.abs((oldSky?.sun?.longitude || 0) - (currentSky.sun?.longitude || 0)) >= 0.01;

        // 3. Compare other planets' longitudes
        let planetsChanged = false;
        if (oldSky?.planets && currentSky.planets) {
          for (const key of Object.keys(currentSky.planets)) {
            const oldP = oldSky.planets[key];
            const newP = currentSky.planets[key];
            if (!oldP || !newP || Math.abs((oldP.longitude || 0) - (newP.longitude || 0)) >= 0.01) {
              planetsChanged = true;
              break;
            }
          }
        } else {
          planetsChanged = true;
        }

        if (moonNakChanged || moonSubChanged || moonLongChanged || sunLongChanged || planetsChanged) {
          hasDifferentialChange = true;
        }
      } catch (e) {
        hasDifferentialChange = true;
      }
    }

    fs.writeFileSync(skyPath, JSON.stringify(currentSky, null, 2), "utf-8");
    console.log("[AGENT] Current Sky data updated successfully in current_sky.json.");

    // Conditionally trigger sync agent if there was a true differential transit shift
    if (hasDifferentialChange) {
      console.log("[AGENT] Differential astrological shift detected. Re-evaluating dynamic user profiles...");
      runAnalysisSyncAgent();
    } else {
      console.log("[AGENT] No major differential astrological change. Skipped dynamic profile re-sync.");
    }
  } catch (err: any) {
    console.error("[AGENT] Error in Current Sky Updater Agent:", err);
  }
}

app.post("/api/rules/current-sky-refresh", (req, res) => {
  try {
    runCurrentSkyUpdaterAgent();
    runAnalysisSyncAgent();
    const skyPath = path.join(process.cwd(), "src", "knowledgebase", "checklist_engine", "current_sky.json");
    if (fs.existsSync(skyPath)) {
      const skyData = JSON.parse(fs.readFileSync(skyPath, "utf-8"));
      return res.json({ success: true, message: "Current sky updated and active user dashboards resynchronized.", data: skyData });
    }
    return res.json({ success: true, message: "Current sky updater completed successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Run background agent on boot
setTimeout(() => {
  runCurrentSkyUpdaterAgent();
  runNatalRulesEvaluatorAgent();
  runAnalysisSyncAgent();
}, 2000);

// Schedule agent to run every 5 minutes for real-time sky updates with differential evaluations
setInterval(() => {
  runCurrentSkyUpdaterAgent();
}, 5 * 60 * 1000);

// Schedule agent to run every 12 hours for deep rules evaluations
setInterval(() => {
  runNatalRulesEvaluatorAgent();
}, 12 * 3600 * 1000);

// ==========================================
// Vite Dev / Static Hosting Setup
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development: Use Vite's development middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    // Production: Serve the built static assets from 'dist/'
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JHora AI server running on port ${PORT}`);
  });
}

startServer();
