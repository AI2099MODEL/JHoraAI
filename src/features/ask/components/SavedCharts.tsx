import React, { useState, useEffect } from "react";
import { User, Users, Briefcase, HelpCircle, Plus, Calendar, Clock, MapPin, Trash2, CheckCircle2 } from "lucide-react";
import { BirthProfile } from "../models/BirthProfile";

interface SavedChartsProps {
  profiles: BirthProfile[];
  activeProfile: BirthProfile | null;
  onSelectProfile: (profile: BirthProfile) => void;
  onAddProfile: (profile: Omit<BirthProfile, "id">) => void;
  onDeleteProfile: (id: string) => void;
}

export const SavedCharts: React.FC<SavedChartsProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
}) => {
  const [filter, setFilter] = useState<"all" | BirthProfile["type"]>("all");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newPlace, setNewPlace] = useState("");
  const [newGender, setNewGender] = useState<BirthProfile["gender"]>("male");
  const [newType, setNewType] = useState<BirthProfile["type"]>("personal");
  const [horaryNum, setHoraryNum] = useState<number | undefined>();

  // Resolved geocoding state
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.209);
  const [tz, setTz] = useState("Asia/Kolkata");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [resultsMap, setResultsMap] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);

  useEffect(() => {
    if (newPlace.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsLoadingGeocode(true);
      try {
        const res = await fetch(`/api/jhora/location/autocomplete?query=${encodeURIComponent(newPlace)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setResultsMap(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingGeocode(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [newPlace]);

  const handleSelectSuggestion = (idx: number) => {
    const item = resultsMap[idx];
    if (item) {
      setNewPlace(`${item.name}, ${item.country}`);
      setLat(item.latitude);
      setLng(item.longitude);
      setTz(item.timezone || "Asia/Kolkata");
    }
    setShowDropdown(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDate || !newTime || !newPlace) return;

    onAddProfile({
      name: newName,
      date: newDate,
      time: newTime,
      place: newPlace,
      latitude: lat,
      longitude: lng,
      timezone: tz,
      gender: newGender,
      type: newType,
      ...(newType === "horary" ? { horaryNumber: horaryNum } : {}),
    });

    // Reset
    setNewName("");
    setNewDate("");
    setNewTime("");
    setNewPlace("");
    setNewType("personal");
    setHoraryNum(undefined);
    setIsAdding(false);
  };

  const getTypeIcon = (type: BirthProfile["type"]) => {
    switch (type) {
      case "personal":
        return <User className="w-3 h-3 text-blue-600" />;
      case "family":
        return <Users className="w-3 h-3 text-rose-600" />;
      case "business":
        return <Briefcase className="w-3 h-3 text-amber-600" />;
      case "horary":
        return <HelpCircle className="w-3 h-3 text-purple-600" />;
    }
  };

  const filteredProfiles = profiles.filter((p) => filter === "all" || p.type === filter);

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Saved Charts
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 space-y-2 text-xs">
          <div>
            <label className="block font-medium text-slate-500 mb-0.5">Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
              placeholder="Full Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block font-medium text-slate-500 mb-0.5">Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-0.5">Time</label>
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-medium text-slate-500 mb-0.5">Place</label>
            <input
              type="text"
              required
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
              className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
              placeholder="Birth City"
            />
            {isLoadingGeocode && (
              <span className="absolute right-2 top-6 w-3 h-3 border border-slate-300 border-t-blue-500 animate-spin rounded-full" />
            )}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-0.5 max-h-32 overflow-y-auto">
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(i)}
                    className="w-full text-left px-2 py-1 hover:bg-slate-50 text-[11px] block border-b border-slate-100 last:border-b-0 text-slate-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block font-medium text-slate-500 mb-0.5">Gender</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as BirthProfile["gender"])}
                className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-500 mb-0.5">Classification</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as BirthProfile["type"])}
                className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
              >
                <option value="personal">Personal</option>
                <option value="family">Family</option>
                <option value="business">Business</option>
                <option value="horary">Horary</option>
              </select>
            </div>
          </div>
          {newType === "horary" && (
            <div>
              <label className="block font-medium text-slate-500 mb-0.5">KP Horary Number (1-249)</label>
              <input
                type="number"
                min="1"
                max="249"
                value={horaryNum || ""}
                onChange={(e) => setHoraryNum(parseInt(e.target.value, 10) || undefined)}
                className="w-full px-2 py-1 border border-slate-200 rounded-lg bg-white"
                placeholder="1 to 249"
              />
            </div>
          )}
          <div className="flex gap-1.5 pt-1.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 py-1 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
            >
              Save Chart
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {(["all", "personal", "family", "business", "horary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md border transition-all cursor-pointer ${
              filter === tab
                ? "bg-slate-200 border-slate-300 text-slate-800 font-bold"
                : "bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredProfiles.length === 0 ? (
        <p className="text-[10px] text-slate-400 text-center py-4 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
          No matching profiles saved
        </p>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {filteredProfiles.map((p) => {
            const isActive = activeProfile?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p)}
                className={`group flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? "bg-blue-50/60 border-blue-100 text-blue-900 shadow-sm"
                    : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-start gap-2 overflow-hidden mr-1">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-blue-100" : "bg-slate-50"}`}>
                    {getTypeIcon(p.type)}
                  </div>
                  <div className="truncate text-left">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold truncate leading-none">{p.name}</p>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 truncate">
                      {p.date} • {p.time} • {p.place}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProfile(p.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete Chart"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
