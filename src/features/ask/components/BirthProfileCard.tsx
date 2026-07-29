import React, { useState, useEffect } from "react";
import { Check, X, MapPin, Calendar, Clock, User, Award, ShieldAlert } from "lucide-react";
import { BirthProfile } from "../models/BirthProfile";

interface BirthProfileCardProps {
  initialData: Partial<BirthProfile>;
  onConfirm: (profile: BirthProfile) => void;
  onCancel: () => void;
}

export const BirthProfileCard: React.FC<BirthProfileCardProps> = ({
  initialData,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [date, setDate] = useState(initialData.date || "");
  const [time, setTime] = useState(initialData.time || "");
  const [place, setPlace] = useState(initialData.place || "");
  const [gender, setGender] = useState<BirthProfile["gender"]>(initialData.gender || "male");
  const [profileType, setProfileType] = useState<BirthProfile["type"]>(initialData.type || "personal");
  const [horaryNumber, setHoraryNumber] = useState<number | undefined>(initialData.horaryNumber);

  // Resolved coordinates state
  const [lat, setLat] = useState(initialData.latitude || 28.6139);
  const [lng, setLng] = useState(initialData.longitude || 77.209);
  const [tz, setTz] = useState(initialData.timezone || "Asia/Kolkata");

  // Autocomplete UI states
  const [searchQuery, setSearchQuery] = useState(initialData.place || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [resultsMap, setResultsMap] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

  // Run place search when user types in place autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoadingGeocode(true);
      try {
        const res = await fetch(`/api/jhora/location/autocomplete?query=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setResultsMap(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Geocoding lookup error:", err);
      } finally {
        setIsLoadingGeocode(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelectSuggestion = (index: number) => {
    const selected = resultsMap[index];
    if (selected) {
      setSearchQuery(`${selected.name}, ${selected.admin1 ? selected.admin1 + ", " : ""}${selected.country}`);
      setPlace(`${selected.name}, ${selected.country}`);
      setLat(selected.latitude);
      setLng(selected.longitude);
      setTz(selected.timezone || "Asia/Kolkata");
    }
    setShowDropdown(false);
  };

  const handleSave = () => {
    const finalProfile: BirthProfile = {
      id: "prof_" + Math.random().toString(36).substring(2, 11),
      name: name.trim() || "Unspecified Profile",
      date,
      time,
      place: searchQuery || place || "Unknown Location",
      latitude: lat,
      longitude: lng,
      timezone: tz,
      gender,
      type: profileType,
      ...(profileType === "horary" ? { horaryNumber } : {}),
    };
    onConfirm(finalProfile);
  };

  const isMissingFields = !date || !time || !searchQuery;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 shadow-md rounded-2xl p-6 my-4 max-w-lg transition-all animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-sans font-semibold text-slate-800 text-sm">
              Smart Birth Profile Detected
            </h4>
            <p className="text-xs text-slate-400">
              Confirm or complete fields to instantly map in the workspace.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 font-sans text-sm">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Subject Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nitin Jain"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Date Input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Birth Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${
                  !date ? "border-red-300 ring-2 ring-red-50" : "border-slate-200"
                }`}
              />
            </div>
            {!date && <span className="text-[10px] text-red-500">Required</span>}
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Birth Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${
                  !time ? "border-red-300 ring-2 ring-red-50" : "border-slate-200"
                }`}
              />
            </div>
            {!time && <span className="text-[10px] text-red-500">Required</span>}
          </div>
        </div>

        {/* Place Input with Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-500 mb-1">Birth Place</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing city name..."
              className={`w-full pl-9 pr-3 py-2 border rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white ${
                !searchQuery ? "border-red-300 ring-2 ring-red-50" : "border-slate-200"
              }`}
            />
            {isLoadingGeocode && (
              <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            )}
          </div>
          {!searchQuery && <span className="text-[10px] text-red-500">Required</span>}

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(index)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs transition-colors cursor-pointer block border-b border-slate-100 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender, Profile Type & Horary Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as BirthProfile["gender"])}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Profile Classification</label>
            <select
              value={profileType}
              onChange={(e) => setProfileType(e.target.value as BirthProfile["type"])}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="personal">Personal Profile</option>
              <option value="family">Family Chart</option>
              <option value="business">Business / Venture</option>
              <option value="horary">Horary (KP Number)</option>
            </select>
          </div>
        </div>

        {profileType === "horary" && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 animate-fade-in">
            <label className="block text-xs font-semibold text-amber-800 mb-1">
              KP Horary Number (1 - 249)
            </label>
            <input
              type="number"
              min="1"
              max="249"
              value={horaryNumber || ""}
              onChange={(e) => setHoraryNumber(parseInt(e.target.value, 10) || undefined)}
              placeholder="e.g. 108"
              className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white text-sm"
            />
          </div>
        )}

        {/* Resolved Details Badge */}
        {place && (
          <div className="bg-slate-100/50 border border-slate-200/40 rounded-xl p-2.5 text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span>Lat: <strong>{lat.toFixed(4)}° N</strong></span>
            <span>Lng: <strong>{lng.toFixed(4)}° E</strong></span>
            <span>Tz: <strong>{tz}</strong></span>
          </div>
        )}

        {isMissingFields && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100/50 rounded-xl p-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Missing essential parameters. Please specify Date, Time, and Place.</span>
          </div>
        )}

        {/* Confirmation buttons */}
        <div className="flex gap-2.5 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            disabled={isMissingFields}
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              isMissingFields
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
