import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Database,
  Upload,
  Download,
  FileText,
  Trash2,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Plus,
  Compass,
  Layers,
  Globe,
  Check,
  AlertCircle
} from "lucide-react";
import {
  getAllCachedHoroscopes,
  deleteCachedHoroscope,
  saveCachedHoroscope,
  CachedHoroscopeRecord,
  generateCompositeKey
} from "../lib/indexedDb";
import { generateAstrologyPDF } from "../lib/pdfGenerator";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";
import { AstrologyData } from "../lib/astrology";

interface BirthDataAndProfileRepositoryProps {
  astrologyData: AstrologyData | null;
  inputs?: any;
  setInputs?: React.Dispatch<React.SetStateAction<any>>;
  onCalculate?: (isInitial?: boolean, forceRefresh?: boolean) => Promise<void>;
  activeUser?: any;
  isDark?: boolean;
}

export const BirthDataAndProfileRepository: React.FC<BirthDataAndProfileRepositoryProps> = ({
  astrologyData,
  inputs,
  setInputs,
  onCalculate,
  activeUser,
  isDark = false
}) => {
  // Local state for birth details form if inputs isn't passed or to allow inline editing
  const [formData, setFormData] = useState({
    name: astrologyData?.birthDetails?.name || inputs?.name || "Active Native",
    date: astrologyData?.birthDetails?.date || inputs?.date || "1990-10-12",
    time: astrologyData?.birthDetails?.time || inputs?.time || "08:30:00",
    location: astrologyData?.birthDetails?.location || inputs?.location || "New Delhi, India",
    latitude: astrologyData?.birthDetails?.latitude ?? inputs?.latitude ?? 28.6139,
    longitude: astrologyData?.birthDetails?.longitude ?? inputs?.longitude ?? 77.2090,
    timezone: astrologyData?.birthDetails?.timezone ?? inputs?.timezone ?? 5.5,
    ayanamsa: inputs?.ayanamsa || "Lahiri"
  });

  const [localTimeInput, setLocalTimeInput] = useState("08:30");
  const [localAmpm, setLocalAmpm] = useState("AM");

  // Keep form in sync when astrologyData or inputs change
  useEffect(() => {
    if (astrologyData?.birthDetails) {
      setFormData({
        name: astrologyData.birthDetails.name || "Active Native",
        date: astrologyData.birthDetails.date || "1990-10-12",
        time: astrologyData.birthDetails.time || "08:30:00",
        location: astrologyData.birthDetails.location || "New Delhi, India",
        latitude: Number(astrologyData.birthDetails.latitude) || 28.6139,
        longitude: Number(astrologyData.birthDetails.longitude) || 77.2090,
        timezone: Number(astrologyData.birthDetails.timezone) || 5.5,
        ayanamsa: inputs?.ayanamsa || "Lahiri"
      });
    } else if (inputs) {
      setFormData({
        name: inputs.name || "Active Native",
        date: inputs.date || "1990-10-12",
        time: inputs.time || "08:30:00",
        location: inputs.location || "New Delhi, India",
        latitude: Number(inputs.latitude) || 28.6139,
        longitude: Number(inputs.longitude) || 77.2090,
        timezone: Number(inputs.timezone) || 5.5,
        ayanamsa: inputs.ayanamsa || "Lahiri"
      });
    }
  }, [astrologyData, inputs]);

  // Sync time to AM/PM
  useEffect(() => {
    if (!formData.time) return;
    const trimmed = formData.time.trim();
    const ampmMatch = trimmed.match(/^([0-9]{1,2}:[0-9]{2})(?::[0-9]{2})?\s*(AM|PM)$/i);
    if (ampmMatch) {
      setLocalTimeInput(ampmMatch[1]);
      setLocalAmpm(ampmMatch[2].toUpperCase());
    } else {
      const parts = trimmed.split(":");
      if (parts.length >= 2) {
        let hh = parseInt(parts[0], 10) || 0;
        const mm = (parts[1] || "00").substring(0, 2);
        if (hh >= 12) {
          const displayHh = hh === 12 ? 12 : hh - 12;
          setLocalTimeInput(`${displayHh.toString().padStart(2, "0")}:${mm}`);
          setLocalAmpm("PM");
        } else {
          const displayHh = hh === 0 ? 12 : hh;
          setLocalTimeInput(`${displayHh.toString().padStart(2, "0")}:${mm}`);
          setLocalAmpm("AM");
        }
      }
    }
  }, [formData.time]);

  // Profile repository state
  const [repository, setRepository] = useState<CachedHoroscopeRecord[]>([]);
  const [loadingRepo, setLoadingRepo] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [calculating, setCalculating] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Location search states
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load all repository records from IndexedDB
  const loadRepository = async () => {
    setLoadingRepo(true);
    try {
      const records = await getAllCachedHoroscopes();
      setRepository(records);
    } catch (err) {
      console.error("Failed to load profile repository from IndexedDB:", err);
    } finally {
      setLoadingRepo(false);
    }
  };

  useEffect(() => {
    loadRepository();
  }, [astrologyData]);

  // Handle location search (geocoding)
  const handleLocationSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationResults([]);
      setShowLocationDropdown(false);
      return;
    }
    setSearchingLocation(true);
    try {
      const res = await fetch(`/api/jhora/location/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setLocationResults(Array.isArray(data) ? data : []);
        setShowLocationDropdown(true);
      }
    } catch (err) {
      console.error("Geocoding lookup error:", err);
    } finally {
      setSearchingLocation(false);
    }
  };

  const selectLocation = (loc: any) => {
    const disp = `${loc.name || loc.city || ''}, ${loc.country || ''}`.replace(/^,\s*/, '');
    setFormData(prev => ({
      ...prev,
      location: disp || queryLocStr(loc),
      latitude: Number(loc.latitude || loc.lat || 0),
      longitude: Number(loc.longitude || loc.lon || 0),
      timezone: Number(loc.timezone || loc.tz || 5.5)
    }));
    setShowLocationDropdown(false);
  };

  const queryLocStr = (loc: any) => {
    return loc.display_name || loc.name || "Selected Location";
  };

  // Submit / Calculate updated birth data
  const handleSaveAndCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCalculating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const fullTimeStr = `${localTimeInput} ${localAmpm}`;
      const payload = {
        name: formData.name.trim() || "Active Native",
        date: formData.date,
        time: fullTimeStr,
        location: formData.location,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        timezone: Number(formData.timezone),
        ayanamsa: formData.ayanamsa
      };

      // Update parent inputs if available
      if (setInputs) {
        setInputs(payload);
      }

      if (onCalculate) {
        await onCalculate(false, true);
      } else {
        // Fallback fetch if onCalculate not provided
        const res = await fetch("/api/user-profile/generate-raw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to calculate birth data coordinates.");
      }

      setSuccessMsg("✓ Birth Data updated successfully! Astronomical coordinates re-calculated.");
      await loadRepository();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Calculate birth data error:", err);
      setErrorMsg(err.message || "Failed to calculate birth data.");
    } finally {
      setCalculating(false);
    }
  };

  // Select profile from repository
  const handleSelectRecord = async (record: CachedHoroscopeRecord) => {
    try {
      setCalculating(true);
      const payload = {
        name: record.name,
        date: record.date,
        time: record.time,
        location: record.location,
        latitude: record.latitude,
        longitude: record.longitude,
        timezone: record.timezone
      };

      if (setInputs) {
        setInputs(payload);
      }

      setFormData({
        ...payload,
        ayanamsa: "Lahiri"
      });

      if (onCalculate) {
        await onCalculate(false, false);
      }

      setSuccessMsg(`✓ Switched active profile to: ${record.name}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("Select record error:", err);
      setErrorMsg("Failed to switch profile.");
    } finally {
      setCalculating(false);
    }
  };

  // Delete profile from repository
  const handleDeleteRecord = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete profile "${name}" from your repository?`)) return;
    try {
      await deleteCachedHoroscope(id);
      await loadRepository();
      setSuccessMsg(`Profile "${name}" removed from repository.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Delete record error:", err);
    }
  };

  // Export JSON for record
  const handleExportJson = (record: CachedHoroscopeRecord) => {
    try {
      const profileJson = record.profileJson || mapAstrologyDataToUserProfileJSON(activeUser, record.data);
      const jsonStr = JSON.stringify(profileJson, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${record.name.replace(/\s+/g, "_")}_BirthProfile.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON Export error:", err);
      alert("Failed to export JSON profile.");
    }
  };

  // Download PDF for record
  const handleDownloadPdf = (record: CachedHoroscopeRecord) => {
    try {
      let pdfData = record.pdfData;
      if (!pdfData && record.data) {
        const profileJson = record.profileJson || mapAstrologyDataToUserProfileJSON(activeUser, record.data);
        const pdfDoc = generateAstrologyPDF(profileJson);
        pdfData = pdfDoc.output("datauristring");
      }
      if (pdfData) {
        const link = document.createElement("a");
        link.href = pdfData;
        link.download = `${record.name.replace(/\s+/g, "_")}_Astrology_Report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("PDF report is not available for this record.");
      }
    } catch (err) {
      console.error("PDF Download error:", err);
      alert("Failed to download PDF.");
    }
  };

  // Upload/Import JSON profile
  const handleUploadJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let birth: any;
      let name = "Imported Profile";

      if (parsed.Raw && parsed.BirthDetails) {
        birth = parsed.BirthDetails;
        name = parsed.BirthDetails.name || name;
      } else if (parsed.Birth) {
        birth = parsed.Birth;
        name = parsed.User?.profile_name || parsed.name || name;
      } else if (parsed.birthDetails) {
        birth = parsed.birthDetails;
        name = parsed.birthDetails.name || name;
      } else {
        alert("Invalid JSON format. File must contain Birth details structure.");
        return;
      }

      setFormData({
        name: name,
        date: birth.date || birth.dob || "1990-10-12",
        time: birth.time || birth.tob || "08:30:00",
        location: birth.place || birth.location || "New Delhi, India",
        latitude: Number(birth.latitude) || 28.6139,
        longitude: Number(birth.longitude) || 77.2090,
        timezone: Number(birth.timezone) || 5.5,
        ayanamsa: "Lahiri"
      });

      setSuccessMsg(`✓ Imported profile "${name}". Click "Calculate & Set Active Birth Data" to process.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("JSON upload error:", err);
      alert("Failed to parse uploaded JSON file.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Filter repository by search query
  const filteredRepository = useMemo(() => {
    if (!searchQuery.trim()) return repository;
    const q = searchQuery.toLowerCase();
    return repository.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.date.includes(q)
    );
  }, [repository, searchQuery]);

  const cardStyle = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-neutral-200 shadow-xs";
  const inputStyle = isDark
    ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500"
    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-indigo-600";
  const headerStyle = isDark ? "bg-slate-900/80 text-slate-200" : "bg-neutral-100 text-neutral-800";
  const tableRowStyle = isDark ? "hover:bg-slate-800/40 border-b border-slate-800/60" : "hover:bg-neutral-50 border-b border-neutral-100";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: BIRTH DATA TABLE & FORM */}
      <div className={`p-5 rounded-2xl border ${cardStyle} space-y-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Active Birth Data & Coordinates Table
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
              Review and edit birth parameters used to compute chart data across the assistant.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold">
            PARASHARI & KP BASELINE
          </span>
        </div>

        {/* Form Inputs Grid */}
        <form onSubmit={handleSaveAndCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Nitin Jain"
                className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors ${inputStyle}`}
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors ${inputStyle}`}
              />
            </div>

            {/* Time of Birth & AM/PM */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Time of Birth
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={localTimeInput}
                  onChange={(e) => setLocalTimeInput(e.target.value)}
                  placeholder="08:30"
                  className={`flex-1 px-3 py-2 text-xs rounded-xl border transition-colors ${inputStyle}`}
                />
                <select
                  value={localAmpm}
                  onChange={(e) => setLocalAmpm(e.target.value)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border ${inputStyle}`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Location Search / Input */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-neutral-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Birth Location / City
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    handleLocationSearch(e.target.value);
                  }}
                  placeholder="e.g. New Delhi, India"
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors ${inputStyle}`}
                />
                {searchingLocation && (
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin absolute right-3 top-2.5" />
                )}
              </div>

              {/* Location Autocomplete Dropdown */}
              {showLocationDropdown && locationResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {locationResults.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectLocation(loc)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors border-b border-neutral-100 dark:border-slate-800/40 last:border-0"
                    >
                      <div className="font-bold text-neutral-800 dark:text-slate-200">{queryLocStr(loc)}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Lat: {Number(loc.latitude || loc.lat || 0).toFixed(4)}°, Lon: {Number(loc.longitude || loc.lon || 0).toFixed(4)}°, TZ: GMT+{loc.timezone || 5.5}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 dark:bg-slate-950 p-3 rounded-xl border border-neutral-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <label className="text-[10px] font-mono font-bold text-neutral-500 dark:text-slate-400 uppercase">
                Latitude (°N/S)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className={`w-full px-2.5 py-1 text-xs font-mono rounded-lg border ${inputStyle}`}
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-mono font-bold text-neutral-500 dark:text-slate-400 uppercase">
                Longitude (°E/W)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className={`w-full px-2.5 py-1 text-xs font-mono rounded-lg border ${inputStyle}`}
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-mono font-bold text-neutral-500 dark:text-slate-400 uppercase">
                Timezone Offset (Hours)
              </label>
              <input
                type="number"
                step="any"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: parseFloat(e.target.value) || 0 })}
                className={`w-full px-2.5 py-1 text-xs font-mono rounded-lg border ${inputStyle}`}
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] font-mono font-bold text-neutral-500 dark:text-slate-400 uppercase">
                Ayanamsa System
              </label>
              <select
                value={formData.ayanamsa}
                onChange={(e) => setFormData({ ...formData, ayanamsa: e.target.value })}
                className={`w-full px-2.5 py-1 text-xs font-mono rounded-lg border ${inputStyle}`}
              >
                <option value="Lahiri">Lahiri (Chitra Paksha)</option>
                <option value="KP">KP (Krishnamurti Paddhati)</option>
                <option value="Raman">Raman</option>
                <option value="Yukteshwar">Yukteshwar</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-neutral-500 dark:text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>Calculates full 19 JHora raw tables &amp; KP cuspal matrices on save.</span>
            </div>
            <button
              type="submit"
              disabled={calculating}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {calculating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Calculate &amp; Set Active Birth Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: PROFILE REPOSITORY TABLE */}
      <div className={`p-5 rounded-2xl border ${cardStyle} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Birth Profile Repository
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
              Saved profiles repository stored in local cache. Select any profile to switch context or export files.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden file input for JSON upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleUploadJson}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-neutral-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              Import Profile JSON
            </button>
            <button
              onClick={loadRepository}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Repository"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRepo ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profile repository by name, city, or birth date..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border ${inputStyle}`}
            />
          </div>
          <span className="text-xs font-mono text-neutral-500 dark:text-slate-400 whitespace-nowrap">
            {filteredRepository.length} {filteredRepository.length === 1 ? "profile" : "profiles"} stored
          </span>
        </div>

        {/* Repository Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`${headerStyle} font-mono text-[10px] uppercase tracking-wider`}>
                <th className="py-2.5 px-3">Profile Name</th>
                <th className="py-2.5 px-3">Date &amp; Time of Birth</th>
                <th className="py-2.5 px-3">Location &amp; Coordinates</th>
                <th className="py-2.5 px-3">Saved Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800/60">
              {loadingRepo ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-mono">
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin mx-auto mb-2" />
                    Loading birth profile repository...
                  </td>
                </tr>
              ) : filteredRepository.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500 dark:text-slate-400 font-sans">
                    <Database className="w-6 h-6 text-neutral-300 dark:text-slate-600 mx-auto mb-2" />
                    No profiles found in repository. Add or import a profile above.
                  </td>
                </tr>
              ) : (
                filteredRepository.map((item) => {
                  const isActive =
                    astrologyData?.birthDetails?.name?.toLowerCase() === item.name.toLowerCase() &&
                    astrologyData?.birthDetails?.date === item.date;

                  return (
                    <tr key={item.id} className={`${tableRowStyle} transition-colors`}>
                      {/* Name */}
                      <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {isActive && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DOB / TOB */}
                      <td className="py-2.5 px-3 font-mono text-neutral-700 dark:text-slate-300">
                        <div>{item.date}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-slate-500">{item.time}</div>
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 text-neutral-700 dark:text-slate-300">
                        <div>{item.location}</div>
                        <div className="text-[10px] font-mono text-neutral-400 dark:text-slate-500">
                          {Number(item.latitude).toFixed(2)}°N, {Number(item.longitude).toFixed(2)}°E (GMT+{item.timezone})
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-400 dark:text-slate-500">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSelectRecord(item)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                            }`}
                            title="Set as active profile"
                          >
                            {isActive ? "Active" : "Load"}
                          </button>

                          <button
                            onClick={() => handleExportJson(item)}
                            className="p-1.5 text-neutral-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Export JSON Profile"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDownloadPdf(item)}
                            className="p-1.5 text-neutral-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Download PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteRecord(item.id, item.name)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 bg-neutral-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
