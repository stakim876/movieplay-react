import { describe, it, expect, beforeEach } from "vitest";
import {
  getActiveProfileDisplayName,
  getActiveProfileKey,
  isKidsProfileActive,
} from "@/shared/lib/activeProfile";

describe("activeProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("활성 프로필 키를 반환한다", () => {
    localStorage.setItem("mp_active_profile_v1", "민수");
    expect(getActiveProfileKey()).toBe("민수");
  });

  it("키가 없으면 default를 반환한다", () => {
    expect(getActiveProfileKey()).toBe("default");
  });

  it("표시 이름을 반환한다", () => {
    localStorage.setItem("mp_active_profile_v1", "지우");
    expect(getActiveProfileDisplayName()).toBe("지우");
  });

  it("키즈 프로필 여부를 판별한다", () => {
    localStorage.setItem("mp_active_profile_v1", "아이");
    localStorage.setItem(
      "mp_profile_settings_v1",
      JSON.stringify({ 아이: { kids: true } })
    );

    expect(isKidsProfileActive()).toBe(true);
  });
});
