import { useState, useEffect } from "react";
import { BirthProfile } from "../models/BirthProfile";
import { ConversationService } from "../services/ConversationService";

export function useBirthProfiles() {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<BirthProfile | null>(null);

  useEffect(() => {
    const loaded = ConversationService.getBirthProfiles();
    setProfiles(loaded);
    
    // Auto-load and sync with active calculated JHora chart in localStorage
    const savedChartStr = localStorage.getItem("jhora_astrology_data");
    if (savedChartStr) {
      try {
        const savedChart = JSON.parse(savedChartStr);
        const bd = savedChart.birthDetails;
        if (bd && bd.name) {
          const existing = loaded.find(p => p.name === bd.name && p.date === bd.date && p.time === bd.time);
          if (!existing) {
            const newProf: BirthProfile = {
              id: "prof_sync_" + Math.random().toString(36).substring(2, 11),
              name: bd.name,
              date: bd.date || "1990-01-01",
              time: bd.time || "12:00",
              place: bd.place || "Unknown",
              latitude: bd.latitude || 0,
              longitude: bd.longitude || 0,
              timezone: String(bd.timezone || "5.5"),
              gender: bd.gender || "male",
              type: "personal"
            };
            ConversationService.addBirthProfile(newProf);
            const updatedLoaded = ConversationService.getBirthProfiles();
            setProfiles(updatedLoaded);
            setActiveProfile(newProf);
            return;
          } else {
            setActiveProfile(existing);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to sync JHora active chart to birth profiles", e);
      }
    }

    const prefs = ConversationService.getPreferences();
    if (prefs.lastOpenChartId) {
      const lastProf = loaded.find((p) => p.id === prefs.lastOpenChartId);
      if (lastProf) {
        setActiveProfile(lastProf);
      } else if (loaded.length > 0) {
        setActiveProfile(loaded[0]);
      }
    } else if (loaded.length > 0) {
      setActiveProfile(loaded[0]);
    }
  }, []);

  const selectProfile = (profile: BirthProfile) => {
    setActiveProfile(profile);
    const prefs = ConversationService.getPreferences();
    prefs.lastOpenChartId = profile.id;
    ConversationService.savePreferences(prefs);
  };

  const addProfile = (newProf: Omit<BirthProfile, "id">) => {
    const created = ConversationService.addBirthProfile(newProf);
    setProfiles(ConversationService.getBirthProfiles());
    selectProfile(created);
    return created;
  };

  const deleteProfile = (id: string) => {
    ConversationService.deleteBirthProfile(id);
    const updated = ConversationService.getBirthProfiles();
    setProfiles(updated);
    if (activeProfile?.id === id) {
      if (updated.length > 0) {
        selectProfile(updated[0]);
      } else {
        setActiveProfile(null);
      }
    }
  };

  const updateProfile = (id: string, updated: Partial<BirthProfile>) => {
    const res = ConversationService.updateBirthProfile(id, updated);
    setProfiles(ConversationService.getBirthProfiles());
    if (activeProfile?.id === id && res) {
      setActiveProfile(res);
    }
    return res;
  };

  return {
    profiles,
    activeProfile,
    selectProfile,
    addProfile,
    deleteProfile,
    updateProfile,
  };
}
