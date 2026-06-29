const LEGACY_PROFILE_KEY = "selectedProfile";
const PROFILE_KEY = "mp_active_profile_v1";

export function getActiveProfileKey() {
  try {
    const v1 = localStorage.getItem(PROFILE_KEY);
    if (v1 && v1.trim()) return v1.trim();
    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (legacy && legacy.trim()) return legacy.trim();
  } catch {}
  return "default";
}

export function getActiveProfileDisplayName() {
  const key = getActiveProfileKey();
  return key === "default" ? "프로필" : key;
}

export function isKidsProfileActive() {
  try {
    const key = getActiveProfileKey();
    const raw = localStorage.getItem("mp_profile_settings_v1");
    const parsed = raw ? JSON.parse(raw) : {};
    return !!parsed?.[key]?.kids;
  } catch {
    return false;
  }
}

