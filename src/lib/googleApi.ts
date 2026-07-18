/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from "./firebaseAuth";

/**
 * Helper to fetch stored Google OAuth token.
 */
export function getGoogleOAuthToken(): string | null {
  return localStorage.getItem("google_oauth_token");
}

/**
 * Searches for an existing profile file on Google Drive and returns its ID if found.
 */
async function findExistingProfileFile(token: string): Promise<string | null> {
  try {
    const q = encodeURIComponent("name = 'jhora_user_profile.json' and trashed = false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      console.warn("Failed to search Google Drive files:", await res.text());
      return null;
    }
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  } catch (err) {
    console.error("Error searching Google Drive:", err);
  }
  return null;
}

/**
 * Saves or updates user profile in user's Google Drive.
 */
export async function saveProfileToGoogleDrive(profile: UserProfile): Promise<{ success: boolean; fileId?: string; error?: string }> {
  const token = getGoogleOAuthToken();
  if (!token) {
    return { success: false, error: "No Google OAuth Access Token found. Please sign in with Google." };
  }

  try {
    const fileId = await findExistingProfileFile(token);
    const boundary = "jhora_boundary_string_profile";
    const metadata = {
      name: "jhora_user_profile.json",
      mimeType: "application/json",
      description: "JHoraAI Astrology User Profile and birth parameters backup"
    };
    const fileContent = JSON.stringify(profile, null, 2);

    if (fileId) {
      // Update existing file using PATCH upload
      const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: fileContent
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return { success: true, fileId };
    } else {
      // Create new file with multipart upload
      const body = [
        `--${boundary}`,
        "Content-Type: application/json; charset=UTF-8",
        "",
        JSON.stringify(metadata),
        `--${boundary}`,
        "Content-Type: application/json",
        "",
        fileContent,
        `--${boundary}--`
      ].join("\r\n");

      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      return { success: true, fileId: data.id };
    }
  } catch (err: any) {
    console.error("Failed to save to Google Drive:", err);
    return { success: false, error: err.message || "Failed to save file." };
  }
}

/**
 * Sends profile and calculated birth details to user's email via Gmail REST API.
 */
export async function sendProfileEmail(
  toEmail: string,
  profile: UserProfile,
  extraDetails?: {
    birthInputs?: any;
    planetaryData?: any;
    reportSummary?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = getGoogleOAuthToken();
  if (!token) {
    return { success: false, error: "No Google OAuth Access Token found. Please sign in with Google." };
  }

  try {
    const formattedDate = extraDetails?.birthInputs?.date 
      ? new Date(extraDetails.birthInputs.date).toLocaleDateString() 
      : "Not Provided";
    const formattedTime = extraDetails?.birthInputs?.time || "Not Provided";
    const location = extraDetails?.birthInputs?.location || "Not Provided";

    // Build rich styled email
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">JHoraAI</h1>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Your Vedic Astrology Personal Portal</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="color: #3b82f6; font-size: 18px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">User Profile Details</h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 500;">Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${profile.name || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Email:</td>
              <td style="padding: 6px 0; color: #0f172a;">${profile.email || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Phone:</td>
              <td style="padding: 6px 0; color: #0f172a;">${profile.phoneNumber || "Not Provided"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Sync Status:</td>
              <td style="padding: 6px 0; color: #10b981; font-weight: 600;">Saved in Google Drive & Cloud Backend</td>
            </tr>
          </table>
        </div>

        ${extraDetails?.birthInputs ? `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="color: #f59e0b; font-size: 18px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Birth Details (Horoscope)</h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 500;">Birth Date:</td>
              <td style="padding: 6px 0; color: #0f172a;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Birth Time:</td>
              <td style="padding: 6px 0; color: #0f172a;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Location:</td>
              <td style="padding: 6px 0; color: #0f172a;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Coordinates:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${extraDetails.birthInputs.latitude}°N, ${extraDetails.birthInputs.longitude}°E</td>
            </tr>
          </table>
        </div>
        ` : ""}

        ${extraDetails?.reportSummary ? `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="color: #6366f1; font-size: 18px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">AI Horoscope Analysis Summary</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0; white-space: pre-line;">${extraDetails.reportSummary}</p>
        </div>
        ` : ""}

        <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <p style="margin: 0;">This email was sent dynamically via your secure JHoraAI workspace integration.</p>
          <p style="margin: 4px 0 0 0;">Hari Om Tat Sat 🙏</p>
        </div>
      </div>
    `;

    const emailLines = [
      `To: ${toEmail}`,
      `Subject: Your JHoraAI Vedic Astrology Profile & Birth Details`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      "",
      htmlBody
    ];

    // Encode string to base64url format
    const rawEmail = btoa(unescape(encodeURIComponent(emailLines.join("\n"))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch("https://gmail.googleapis.com/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw: rawEmail })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }
    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error("Failed to send email via Gmail:", err);
    return { success: false, error: err.message || "Failed to send email." };
  }
}
