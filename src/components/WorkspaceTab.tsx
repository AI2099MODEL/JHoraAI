/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  Calendar as CalendarIcon, 
  StickyNote, 
  Plus, 
  Search, 
  RefreshCw, 
  CloudUpload, 
  Download, 
  Trash2, 
  LogIn, 
  CalendarDays, 
  FileJson, 
  Check, 
  FileText,
  AlertCircle,
  Mail,
  Send,
  User
} from "lucide-react";
import { AstrologyData, DashaPeriod } from "../lib/astrology";
import { AuthManager, getCachedGoogleAccessToken, setCachedGoogleAccessToken } from "../lib/firebaseAuth";

interface WorkspaceTabProps {
  astrologyData: AstrologyData | null;
  activeSub: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string; // "slate" | "amber" | "indigo" | "emerald" | "rose" | "purple"
  category: string;
  updatedAt: string;
}

const NOTE_COLORS = [
  { name: "slate", bg: "bg-slate-900/60 border-slate-800", text: "text-slate-300" },
  { name: "amber", bg: "bg-amber-950/40 border-amber-500/20", text: "text-amber-200" },
  { name: "indigo", bg: "bg-indigo-950/40 border-indigo-500/20", text: "text-indigo-200" },
  { name: "emerald", bg: "bg-emerald-950/40 border-emerald-500/20", text: "text-emerald-200" },
  { name: "rose", bg: "bg-rose-950/40 border-rose-500/20", text: "text-rose-200" },
  { name: "purple", bg: "bg-purple-950/40 border-purple-500/20", text: "text-purple-200" },
];

export default function WorkspaceTab({ astrologyData, activeSub }: WorkspaceTabProps) {
  const [token, setToken] = useState<string | null>(getCachedGoogleAccessToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedPickerFile, setSelectedPickerFile] = useState<DriveFile | null>(null);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Gmail state
  const [gmailTo, setGmailTo] = useState("");
  const [gmailSubject, setGmailSubject] = useState("JHora AI Astrological Birth Chart Report");
  const [gmailBody, setGmailBody] = useState("");
  const [gmailUserEmail, setGmailUserEmail] = useState("");

  // Auto-fetch connected user's email for auto-filling
  useEffect(() => {
    if (token) {
      window.fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch userinfo");
      })
      .then(data => {
        if (data.email) {
          setGmailUserEmail(data.email);
          setGmailTo(prev => prev || data.email);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch user info via oauth2/v2/userinfo, trying gmail profile:", err);
        window.fetch("https://www.googleapis.com/gmail/v1/users/me/profile", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.emailAddress) {
            setGmailUserEmail(data.emailAddress);
            setGmailTo(prev => prev || data.emailAddress);
          }
        })
        .catch(e => console.error("Could not fetch user profile:", e));
      });
    } else {
      setGmailUserEmail("");
    }
  }, [token]);

  // Prepopulate email body whenever birth chart changes
  useEffect(() => {
    if (astrologyData) {
      const pText = astrologyData.planets
        .map(p => `  • <b>${p.name}</b>: ${p.sign} (${p.degree.toFixed(2)}°) in House ${p.house} (${p.nakshatra} Nakshatra, Strength ${p.strength}%)`)
        .join("<br/>");
      const dashaText = astrologyData.dashas && astrologyData.dashas[0]
        ? `Active Mahadasha: <b>${astrologyData.dashas[0].lord} Mahadasha</b> (ends ${astrologyData.dashas[0].endDate})`
        : "Active Mahadasha: Unknown";

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">✨ JHora AI Astrological Chart Report</h2>
          <p>Pranam! Here is the authentic Vedic Astrology Birth Chart generated dynamically for <b>${astrologyData.birthDetails.name}</b>.</p>
          
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #d97706; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">Birth Details</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
              <li><b>Name:</b> ${astrologyData.birthDetails.name}</li>
              <li><b>Date:</b> ${astrologyData.birthDetails.date}</li>
              <li><b>Time:</b> ${astrologyData.birthDetails.time}</li>
              <li><b>Place:</b> ${astrologyData.birthDetails.location}</li>
              <li><b>Lagna (Ascendant):</b> ${astrologyData.lagna.sign} (${astrologyData.lagna.degree.toFixed(2)}°)</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #4f46e5; font-size: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 10px;">Planetary Placements</h3>
            <div style="font-size: 13px; line-height: 1.8;">
              ${pText}
            </div>
          </div>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 20px 0; font-size: 13px; color: #15803d;">
            💡 <b>Vimshottari Timeline Indicator:</b><br/>
            ${dashaText}
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;">
            Generated via JHora AI Professional Astro-Console. Powered by Google Workspace Integration.
          </p>
        </div>
      `;
      setGmailBody(htmlBody.trim());
    } else {
      setGmailBody(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">✨ JHora AI Astrology Assistant</h2>
          <p>Pranam! This is a custom astrological message sent from JHora AI Workspace.</p>
          <p>Please load and cast a horoscope chart in the Birth Dashboard to send full charts and planetary placements directly to your email.</p>
        </div>
      `.trim());
    }
  }, [astrologyData]);

  // Keep notes state
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteColor, setNoteColor] = useState("slate");
  const [noteCategory, setNoteCategory] = useState("General");
  const [noteSearch, setNoteSearch] = useState("");

  // Load Keep Notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("jhora_keep_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notes:", e);
      }
    } else {
      // Default notes if empty
      const defaultNotes: KeepNote[] = [
        {
          id: "1",
          title: "Vedic Remedies for Sade Sati",
          content: "Recite Shani Chalisa every Saturday. Feed crows with black sesame seeds. Practice mindfulness and patience during this Saturn transit.",
          color: "indigo",
          category: "Remedies",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Dasha Focus Checklist",
          content: "Analyze the sub-dasha lord positions. Under current Jupiter Mahadasha, focus on higher learning, publishing, and spiritual retreats.",
          color: "amber",
          category: "Analysis",
          updatedAt: new Date().toISOString(),
        }
      ];
      setNotes(defaultNotes);
      localStorage.setItem("jhora_keep_notes", JSON.stringify(defaultNotes));
    }
  }, []);

  // Sync state token with global cached token
  useEffect(() => {
    const checkToken = setInterval(() => {
      const currentToken = getCachedGoogleAccessToken();
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);
    return () => clearInterval(checkToken);
  }, [token]);

  // Handle Google OAuth Sign-In
  const handleConnectGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthManager.signInWithGoogle();
      const currentToken = getCachedGoogleAccessToken();
      setToken(currentToken);
      setSuccessMsg("Successfully connected to Google Workspace!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("Google Workspace OAuth connection failed:", err);
      setError(err.message || "Failed to authorize Google Workspace.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE DRIVE SERVICES
  // -------------------------------------------------------------

  const fetchDriveFiles = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,createdTime,size)&q=trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          // Token expired
          setToken(null);
          setCachedGoogleAccessToken(null);
          throw new Error("Authorization expired. Please reconnect Google account.");
        }
        throw new Error("Failed to query Google Drive files.");
      }
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeSub === "google_drive") {
      fetchDriveFiles();
    }
  }, [token, activeSub]);

  const handleBackupToDrive = async () => {
    if (!token || !astrologyData) return;
    setLoading(true);
    setError(null);
    try {
      const metadata = {
        name: `JHora_Backup_${astrologyData.birthDetails.name.replace(/\s+/g, "_")}_${astrologyData.birthDetails.date}.json`,
        mimeType: "application/json",
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append(
        "file",
        new Blob([JSON.stringify(astrologyData, null, 2)], { type: "application/json" })
      );

      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) throw new Error("Could not upload backup file to Google Drive.");
      
      const file = await res.json();
      setSuccessMsg(`Backup uploaded successfully: "${file.name}"`);
      fetchDriveFiles();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE CALENDAR SERVICES
  // -------------------------------------------------------------

  const fetchCalendarEvents = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=15&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          setToken(null);
          setCachedGoogleAccessToken(null);
          throw new Error("Authorization expired. Please reconnect Google account.");
        }
        throw new Error("Failed to load Google Calendar events.");
      }
      const data = await res.json();
      setCalendarEvents(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeSub === "google_calendar") {
      fetchCalendarEvents();
    }
  }, [token, activeSub]);

  const handleSyncDashaToCalendar = async () => {
    if (!token || !astrologyData) return;
    setLoading(true);
    setError(null);
    try {
      const dashas = astrologyData.dashas || [];
      if (dashas.length === 0) {
        throw new Error("No active Vimshottari Dasha details available to sync.");
      }

      // Helper to determine if a period is currently active
      const isPeriodActive = (startStr: string, endStr: string) => {
        const now = new Date();
        const start = new Date(startStr);
        const end = new Date(endStr);
        return now >= start && now <= end;
      };

      // Safe local date formatting (all-day event requires YYYY-MM-DD)
      const formatToLocalDateString = (dateStr: string): string => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr.split("T")[0];
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const formatEndLocalDateString = (dateStr: string): string => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr.split("T")[0];
        // Add 1 day to end date so Google Calendar captures the full last day (all-day is exclusive end)
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      // Traverse to find all active dasha periods (Mahadasha, Antardasha, Pratyantardasha)
      const activePeriods: Array<{ lord: string; type: string; startDate: string; endDate: string; fullName: string }> = [];

      // Level 1: Mahadasha
      let activeMaha: DashaPeriod | null = null;
      for (const d of dashas) {
        if (isPeriodActive(d.startDate, d.endDate)) {
          activeMaha = d;
          activePeriods.push({
            lord: d.lord,
            type: "Mahadasha",
            startDate: d.startDate,
            endDate: d.endDate,
            fullName: `${d.lord} Mahadasha`
          });
          break;
        }
      }

      // Level 2: Antardasha (Sub-period)
      let activeAntar: DashaPeriod | null = null;
      if (activeMaha && activeMaha.subPeriods) {
        for (const sub of activeMaha.subPeriods) {
          if (isPeriodActive(sub.startDate, sub.endDate)) {
            activeAntar = sub;
            activePeriods.push({
              lord: sub.lord,
              type: "Antardasha",
              startDate: sub.startDate,
              endDate: sub.endDate,
              fullName: `${activeMaha.lord}-${sub.lord} Antardasha`
            });
            break;
          }
        }
      }

      // Level 3: Pratyantardasha (Sub-sub-period)
      if (activeMaha && activeAntar && activeAntar.subPeriods) {
        for (const subSub of activeAntar.subPeriods) {
          if (isPeriodActive(subSub.startDate, subSub.endDate)) {
            activePeriods.push({
              lord: subSub.lord,
              type: "Pratyantardasha",
              startDate: subSub.startDate,
              endDate: subSub.endDate,
              fullName: `${activeMaha.lord}-${activeAntar.lord}-${subSub.lord} Pratyantardasha`
            });
            break;
          }
        }
      }

      if (activePeriods.length === 0) {
        throw new Error("No active Vimshottari Dasha period matches the current date.");
      }

      const syncedNames: string[] = [];

      for (const active of activePeriods) {
        const startISO = formatToLocalDateString(active.startDate);
        const endISO = formatEndLocalDateString(active.endDate);

        const event = {
          summary: `🌟 Vimshottari ${active.type}: ${active.fullName}`,
          description: `Your active Vimshottari ${active.type} ruled by planet ${active.lord}.\n\n` +
                       `• Ruling Planet: ${active.lord}\n` +
                       `• Active Period: ${active.startDate} to ${active.endDate}\n` +
                       `• Chart Native: ${astrologyData.birthDetails.name}\n\n` +
                       `Focus themes: Planetary shift under ${active.lord}, karma unfolding, and life alignments.`,
          start: {
            date: startISO,
          },
          end: {
            date: endISO,
          },
          reminders: {
            useDefault: true,
          },
        };

        const res = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to create calendar event for ${active.fullName}.`);
        }
        syncedNames.push(active.fullName);
      }

      setSuccessMsg(`Successfully synced active dasha periods to Google Calendar: ${syncedNames.join(", ")}!`);
      fetchCalendarEvents();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GMAIL INTEGRATION: Send Astrological Reports
  // -------------------------------------------------------------

  const handleSendEmail = async () => {
    if (!token) {
      setError("Please connect your Google Account first.");
      return;
    }
    if (!gmailTo) {
      setError("Please specify a recipient email address.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // Format RFC 2822
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(gmailSubject)))}?=`;
      const emailParts = [
        `To: ${gmailTo}`,
        `Subject: ${utf8Subject}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        "",
        gmailBody
      ];
      const emailContent = emailParts.join("\r\n");

      // base64url encode (RFC 4648 safe base64url encoding)
      const base64SafeEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await window.fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          raw: base64SafeEmail
        })
      });

      if (!res.ok) {
        const errDetails = await res.text();
        console.error("Gmail Send API error response:", errDetails);
        throw new Error("Failed to send email. Ensure the recipient is correct and your Gmail session is active.");
      }

      setSuccessMsg("Email successfully sent via your personal Gmail account!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Gmail integration error:", err);
      setError(err.message || "An error occurred while sending the email.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE KEEP NOTES backed up to Google Drive
  // -------------------------------------------------------------

  const saveNotesToState = (newNotes: KeepNote[]) => {
    setNotes(newNotes);
    localStorage.setItem("jhora_keep_notes", JSON.stringify(newNotes));
  };

  const handleAddNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const newNote: KeepNote = {
      id: Math.random().toString(),
      title: noteTitle.trim() || "Untitled Note",
      content: noteContent.trim(),
      color: noteColor,
      category: noteCategory.trim() || "General",
      updatedAt: new Date().toISOString(),
    };

    saveNotesToState([newNote, ...notes]);
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("General");
    setNoteColor("slate");
    setSuccessMsg("Note saved locally!");
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      saveNotesToState(notes.filter((n) => n.id !== id));
    }
  };

  const handleBackupNotesToDrive = async () => {
    if (!token) {
      setError("Please connect your Google Account first to backup notes to Google Drive.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Look for existing jhora_keep_notes.json file on Drive to overwrite
      let existingFileId: string | null = null;
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='jhora_keep_notes.json' and trashed=false&fields=files(id)`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files[0]) {
          existingFileId = searchData.files[0].id;
        }
      }

      const fileContent = JSON.stringify(notes, null, 2);
      let uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      let method = "POST";
      
      const metadata: any = {
        name: "jhora_keep_notes.json",
        mimeType: "application/json",
      };

      if (existingFileId) {
        // Overwrite existing file (Update)
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
        method = "PATCH";
      }

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", new Blob([fileContent], { type: "application/json" }));

      const res = await fetch(uploadUrl, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error("Could not sync Keep Notes backup file to Google Drive.");

      setSuccessMsg("Sync Completed! All Keep notes successfully backed up to Google Drive (jhora_keep_notes.json)");
      if (activeSub === "google_drive") {
        fetchDriveFiles();
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreNotesFromDrive = async () => {
    if (!token) {
      setError("Please connect your Google Account first to download notes from Google Drive.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Find the file id of jhora_keep_notes.json
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='jhora_keep_notes.json' and trashed=false&fields=files(id)`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!searchRes.ok) throw new Error("Could not search for backup files.");
      const searchData = await searchRes.json();
      if (!searchData.files || searchData.files.length === 0) {
        throw new Error("No existing notes backup 'jhora_keep_notes.json' found on your Google Drive. Try backing up first.");
      }

      const fileId = searchData.files[0].id;
      // Download content
      const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!fileRes.ok) throw new Error("Failed to download keep notes from Google Drive.");
      
      const restoredNotes = await fileRes.json();
      if (Array.isArray(restoredNotes)) {
        saveNotesToState(restoredNotes);
        setSuccessMsg(`Successfully restored ${restoredNotes.length} notes from Google Drive backup!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error("Invalid backup format in jhora_keep_notes.json.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const term = noteSearch.toLowerCase();
    return (
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term) ||
      n.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Alert / Notification banners */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Account Ingress Header Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Google Workspace Services</span>
            {token ? (
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-400 font-mono font-medium">Connected</span>
            ) : (
              <span className="text-[10px] bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-slate-400 font-mono font-medium">Disconnected</span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Integrate JHora directly with your personal Google Drive, Google Picker, Google Keep, and Google Calendar. Backup birth charts, synastry profiles, schedules, and astrological journals safely.
          </p>
        </div>

        {!token ? (
          <button
            onClick={handleConnectGoogle}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-medium px-4 py-2.5 rounded-xl transition-all shadow-md text-xs"
            id="workspace-google-connect-btn"
          >
            <LogIn className="w-4 h-4 text-slate-950" />
            <span>Connect Google Account</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setToken(null);
              setCachedGoogleAccessToken(null);
              setSuccessMsg("Google account disconnected.");
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl transition-all shadow-md text-xs"
            id="workspace-google-disconnect-btn"
          >
            <span>Disconnect</span>
          </button>
        )}
      </div>

      {/* VIEW RENDERERS BASED ON THE SELECTED SUBTAB */}
      {activeSub === "google_drive" && (
        <div className="space-y-6">
          {/* Drive Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Astrology Backups</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Safeguard your Vedic horoscope charts directly inside your real Google Drive.
                </p>

                {astrologyData ? (
                  <button
                    onClick={handleBackupToDrive}
                    disabled={loading || !token}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all shadow"
                    id="drive-backup-chart-btn"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>Backup "{astrologyData.birthDetails.name}" Chart</span>
                  </button>
                ) : (
                  <div className="bg-slate-950/40 p-4 border border-slate-800/50 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500">No birth chart cast yet. Head back to Birth Dashboard to cast one first.</p>
                  </div>
                )}

                {/* Google Picker Launcher Button */}
                <button
                  onClick={() => {
                    setIsPickerOpen(true);
                    if (token) fetchDriveFiles();
                  }}
                  disabled={!token}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold px-4 py-3 rounded-xl transition-all border border-slate-700"
                  id="google-picker-trigger-btn"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Launch Google Picker</span>
                </button>
              </div>
            </div>

            {/* Right List Files */}
            <div className="md:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Your Google Drive Files</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search Drive files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 w-44"
                  />
                  <button
                    onClick={fetchDriveFiles}
                    disabled={loading || !token}
                    className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 rounded-lg text-slate-400 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {!token ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <FolderOpen className="w-10 h-10 text-slate-600 mb-2.5" />
                  <p className="text-xs text-slate-400">Connect your Google Account above to view files in Google Drive.</p>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  {loading ? (
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                  ) : (
                    <>
                      <FileText className="w-10 h-10 text-slate-600 mb-2.5" />
                      <p className="text-xs text-slate-400">No files found on Google Drive. Create a backup to get started!</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
                  {driveFiles
                    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl hover:border-indigo-500/20 transition-all text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg">
                            {file.mimeType.includes("json") ? (
                              <FileJson className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{file.name}</p>
                            <p className="text-[9px] text-slate-500">
                              ID: {file.id.substring(0, 15)}... • {file.mimeType}
                            </p>
                          </div>
                        </div>
                        {file.createdTime && (
                          <span className="text-[10px] text-slate-500">
                            {new Date(file.createdTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* REALTIME CUSTOM GOOGLE PICKER MODAL Fallback */}
          {isPickerOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-200 text-sm">Google Picker (Astrology Explorer)</h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsPickerOpen(false);
                      setSelectedPickerFile(null);
                    }}
                    className="text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Close
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  <p className="text-xs text-slate-400">
                    Select a previously backed up `.json` horoscope file from Google Drive to import/load directly into JHora database.
                  </p>

                  <div className="space-y-2">
                    {driveFiles
                      .filter((f) => f.name.endsWith(".json"))
                      .map((file) => (
                        <div
                          key={file.id}
                          onClick={() => setSelectedPickerFile(file)}
                          className={`p-3 border rounded-xl cursor-pointer transition flex items-center justify-between ${
                            selectedPickerFile?.id === file.id
                              ? "bg-amber-500/10 border-amber-500 text-amber-200"
                              : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileJson className="w-4 h-4 text-amber-500" />
                            <div>
                              <p className="font-medium text-xs">{file.name}</p>
                              <p className="text-[9px] text-slate-500">File ID: {file.id}</p>
                            </div>
                          </div>
                          {selectedPickerFile?.id === file.id && (
                            <Check className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      ))}

                    {driveFiles.filter((f) => f.name.endsWith(".json")).length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-6">No backed up JSON horoscope files found in your Drive.</p>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/50">
                  <button
                    onClick={() => {
                      setIsPickerOpen(false);
                      setSelectedPickerFile(null);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedPickerFile}
                    onClick={async () => {
                      if (!selectedPickerFile) return;
                      // Download the file to verify
                      try {
                        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${selectedPickerFile.id}?alt=media`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        const data = await fileRes.json();
                        // Trigger local storage save
                        localStorage.setItem("jhora_astrology_data", JSON.stringify(data));
                        window.location.reload(); // Refresh to let App.tsx pick up imported chart!
                      } catch (err: any) {
                        alert("Failed to load chosen file: " + err.message);
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-semibold rounded-xl text-xs"
                  >
                    Load selected chart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSub === "google_calendar" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calendar Controls */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">astrological Alerts</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sync your current celestial timeline to your real-world Google Calendar. Schedule alarms and reminders for when major planets transit or dasha cycles transition!
                </p>

                {astrologyData ? (
                  <button
                    onClick={handleSyncDashaToCalendar}
                    disabled={loading || !token}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-md"
                    id="sync-dasha-calendar-btn"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-950" />
                    <span>Sync Vimshottari Dasha to Google Calendar</span>
                  </button>
                ) : (
                  <div className="bg-slate-950/40 p-4 border border-slate-800/50 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500">Please load/calculate a birth chart first to sync astrological dashas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events list */}
            <div className="md:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Upcoming Calendar Events</h3>
                <button
                  onClick={fetchCalendarEvents}
                  disabled={loading || !token}
                  className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 rounded-lg text-slate-400 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {!token ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <CalendarIcon className="w-10 h-10 text-slate-600 mb-2.5" />
                  <p className="text-xs text-slate-400">Connect Google Account above to load upcoming events.</p>
                </div>
              ) : calendarEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  {loading ? (
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                  ) : (
                    <>
                      <CalendarIcon className="w-10 h-10 text-slate-600 mb-2.5" />
                      <p className="text-xs text-slate-400">No upcoming events found on your Google Calendar.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
                  {calendarEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl hover:border-amber-500/20 transition-all text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{event.summary}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-sm">
                          {event.description || "No description provided."}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 font-mono">
                          {event.start.date || (event.start.dateTime && new Date(event.start.dateTime).toLocaleDateString()) || "All Day"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSub === "google_gmail" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls/Preview Info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <Mail className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gmail Dispatcher</h3>
                    <p className="text-[10px] text-slate-500">Integrate & Email Chart Reports</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Email your calculated birth charts, planetary strengths, dasha progressions, or Sade Sati alerts directly to yourself or client inboxes.
                </p>

                {gmailUserEmail && (
                  <div className="bg-slate-950/40 p-3.5 border border-slate-800/50 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-slate-500 font-medium block uppercase tracking-wider">Connected Account</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-mono font-bold uppercase">
                        {gmailUserEmail.charAt(0)}
                      </div>
                      <span className="text-xs font-mono text-indigo-300 font-semibold truncate block max-w-[180px]">{gmailUserEmail}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (gmailUserEmail) {
                        setGmailTo(gmailUserEmail);
                      }
                    }}
                    disabled={!token || !gmailUserEmail}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-semibold px-3 py-2.5 rounded-xl border border-slate-700/60 disabled:opacity-50 transition"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Send to Self ({gmailUserEmail ? "Auto-Filled" : "Not Loaded"})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Email Composer Form */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 flex flex-col">
              <div className="border-b border-slate-800/60 pb-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Compose Astrological Email</span>
                <span className="text-[10px] text-slate-500">Authorized OAuth 2.0 Gmail Services</span>
              </div>

              {!token ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <Mail className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-xs text-slate-400 max-w-sm">
                    Please connect your Google Account at the top of this tab to authorize and compose emails.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Recipient */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recipient Email (To)</label>
                    <input
                      type="email"
                      placeholder="e.g. client@example.com"
                      value={gmailTo}
                      onChange={(e) => setGmailTo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      placeholder="Email Subject"
                      value={gmailSubject}
                      onChange={(e) => setGmailSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* HTML Body */}
                  <div className="space-y-1 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HTML Body Editor</label>
                      {astrologyData && (
                        <button
                          onClick={() => {
                            if (window.confirm("This will revert the email body to the default template for the current birth chart. Continue?")) {
                              const pText = astrologyData.planets
                                .map(p => `  • <b>${p.name}</b>: ${p.sign} (${p.degree.toFixed(2)}°) in House ${p.house} (${p.nakshatra} Nakshatra, Strength ${p.strength}%)`)
                                .join("<br/>");
                              const dashaText = astrologyData.dashas && astrologyData.dashas[0]
                                ? `Active Mahadasha: <b>${astrologyData.dashas[0].lord} Mahadasha</b> (ends ${astrologyData.dashas[0].endDate})`
                                : "Active Mahadasha: Unknown";

                              setGmailBody(`
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
  <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">✨ JHora AI Astrological Chart Report</h2>
  <p>Pranam! Here is the authentic Vedic Astrology Birth Chart generated dynamically for <b>${astrologyData.birthDetails.name}</b>.</p>
  
  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #d97706; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">Birth Details</h3>
    <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
      <li><b>Name:</b> ${astrologyData.birthDetails.name}</li>
      <li><b>Date:</b> ${astrologyData.birthDetails.date}</li>
      <li><b>Time:</b> ${astrologyData.birthDetails.time}</li>
      <li><b>Place:</b> ${astrologyData.birthDetails.location}</li>
      <li><b>Lagna (Ascendant):</b> ${astrologyData.lagna.sign} (${astrologyData.lagna.degree.toFixed(2)}°)</li>
    </ul>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #4f46e5; font-size: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 10px;">Planetary Placements</h3>
    <div style="font-size: 13px; line-height: 1.8;">
      ${pText}
    </div>
  </div>

  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 20px 0; font-size: 13px; color: #15803d;">
    💡 <b>Vimshottari Timeline Indicator:</b><br/>
    ${dashaText}
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
  <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;">
    Generated via JHora AI Professional Astro-Console. Powered by Google Workspace Integration.
  </p>
</div>
                              `.trim());
                            }
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          Reset to Chart Template
                        </button>
                      )}
                    </div>
                    <textarea
                      placeholder="HTML or plain text email content"
                      value={gmailBody}
                      onChange={(e) => setGmailBody(e.target.value)}
                      className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
                    />
                  </div>

                  {/* Send Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSendEmail}
                      disabled={loading || !gmailTo || !gmailBody}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow text-xs"
                      id="gmail-send-email-btn"
                    >
                      {loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>{loading ? "Sending..." : "Send Astrological Email"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSub === "google_keep" && (
        <div className="space-y-6">
          {/* Notes Creator Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Card Left */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">New Jyotish Keep Note</h3>
                
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Daily Meditation Routine"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Remedies, Chart Analysis"
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note Content</label>
                    <textarea
                      placeholder="Record remedies, charts notes, study points, mantras..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                    />
                  </div>

                  {/* Note Color Pickers */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color Code</label>
                    <div className="flex gap-2.5">
                      {NOTE_COLORS.map((color) => {
                        const itemBg = color.name === "slate" ? "bg-slate-700" : color.name === "amber" ? "bg-amber-500" : color.name === "indigo" ? "bg-indigo-500" : color.name === "emerald" ? "bg-emerald-500" : color.name === "rose" ? "bg-rose-500" : "bg-purple-500";
                        return (
                          <button
                            key={color.name}
                            onClick={() => setNoteColor(color.name)}
                            className={`w-6 h-6 rounded-full transition-all border ${itemBg} ${
                              noteColor === color.name
                                ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950"
                                : "border-slate-800"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleAddNote}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-md active:scale-95"
                    id="add-keep-note-btn"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>

              {/* Sync Controls Box */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Google Drive Backup Sync</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Keep notes synced. Back up notes directly to Google Drive as <code>jhora_keep_notes.json</code>, and download them anytime on other devices!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBackupNotesToDrive}
                    disabled={loading || !token}
                    className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[11px] font-bold px-2 py-2.5 rounded-xl transition-all"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>Backup</span>
                  </button>
                  <button
                    onClick={handleRestoreNotesFromDrive}
                    disabled={loading || !token}
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-[11px] font-bold px-2 py-2.5 rounded-xl transition-all border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Note Grid Display Right */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <StickyNote className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Keep Notebook ({filteredNotes.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 w-48"
                  />
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
                  <StickyNote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No notes found matching your criteria. Create some above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => {
                    const colorScheme = NOTE_COLORS.find((c) => c.name === note.color) || NOTE_COLORS[0];
                    return (
                      <div
                        key={note.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg ${colorScheme.bg}`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[9px] bg-slate-950/40 px-2 py-0.5 rounded text-amber-400/80 font-mono">
                              {note.category}
                            </span>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="font-bold text-xs text-slate-100 mb-1.5">{note.title}</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                        <div className="border-t border-slate-800/40 mt-4 pt-2 flex justify-end">
                          <span className="text-[8px] text-slate-500">
                            Saved: {new Date(note.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
