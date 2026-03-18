import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";
import { useToast } from "@/context/ToastContext";
import "@/styles/common/common.css";

export default function WhoPage() {
  const navigate = useNavigate();
  const { profiles, loading } = useConfig();
  const { info: showInfo } = useToast();

  const handleProfileClick = (profile) => {
    const profileKey = profile?.name || "default";
    let localSettings = {};
    try {
      const raw = localStorage.getItem("mp_profile_settings_v1");
      localSettings = raw ? JSON.parse(raw) : {};
    } catch {
      localSettings = {};
    }
    const local = localSettings?.[profileKey] || {};

    // PIN: 로컬 설정이 우선, 없으면 프로필 문서 pin 사용
    const expectedPin = local?.pin ?? profile?.pin ?? null;
    if (expectedPin) {
      const entered = window.prompt("PIN을 입력하세요");
      if (entered === null) return;
      if (String(entered).trim() !== String(expectedPin).trim()) {
        showInfo("PIN이 올바르지 않습니다.");
        return;
      }
    }

    localStorage.setItem("selectedProfile", profileKey);
    localStorage.setItem("mp_active_profile_v1", profileKey);

    // kids 플래그는 클라이언트 필터에서 사용 (로컬 우선)
    try {
      localSettings[profileKey] = {
        ...(localSettings[profileKey] || {}),
        kids: local?.kids ?? !!profile?.kids,
      };
      localStorage.setItem("mp_profile_settings_v1", JSON.stringify(localSettings));
    } catch {
      // ignore
    }

    navigate("/");
  };

  if (loading) {
    return (
      <div className="who-container">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="who-container">
      <h1 className="who-title">
        <span className="highlight">MoviePlay</span>에 오신 걸 환영합니다 🎬<br />
        <span>시청할 프로필을 선택하세요</span>
      </h1>

      <div className="profile-list">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="profile-card"
            onClick={() => handleProfileClick(profile)}
          >
            <img src={profile.avatar} alt={profile.name} />
            <p>{profile.name}</p>
          </div>
        ))}

        <div
          className="profile-card add-card"
          onClick={() => showInfo("프로필 추가 기능은 준비 중입니다.")}
          >
          <span className="add-icon">＋</span>
          <p>프로필 추가</p>
        </div>
      </div>

      <button className="manage-btn" onClick={() => navigate("/profile")}>
        프로필 관리
      </button>
    </div>
  );
}

