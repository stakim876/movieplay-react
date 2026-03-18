const LEGACY_PROFILE_KEY = "selectedProfile";
const PROFILE_KEY = "mp_active_profile_v1";

export function getActiveProfileKey() {
  try {
    const v1 = localStorage.getItem(PROFILE_KEY);
    if (v1 && v1.trim()) return v1.trim();
    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (legacy && legacy.trim()) return legacy.trim();
  } catch {
    // ignore
  }
  return "default";
}

