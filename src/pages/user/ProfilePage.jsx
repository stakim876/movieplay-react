import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import WatchStats from "@/components/user/WatchStats";
import "@/styles/common/common.css";

const PROFILE_SETTINGS_KEY = "mp_profile_settings_v1";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profiles } = useConfig();
  const [settings, setSettings] = useState({});

  const profile = {
    name: user?.displayName || user?.email?.split("@")[0] || "내 프로필",
    img: "/assets/mickey.png",
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_SETTINGS_KEY);
      setSettings(raw ? JSON.parse(raw) : {});
    } catch {
      setSettings({});
    }
  }, []);

  const profileList = useMemo(() => {
    return Array.isArray(profiles) ? profiles : [];
  }, [profiles]);

  const updateProfileSetting = (profileKey, patch) => {
    setSettings((prev) => {
      const next = {
        ...(prev || {}),
        [profileKey]: { ...(prev?.[profileKey] || {}), ...(patch || {}) },
      };
      try {
        localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="profile-page-container">
      <h1 className="profile-title">내 프로필</h1>

      <div className="profile-box-large">
        <div className="avatar-circle">
          <img src={profile.img} alt={profile.name} className="avatar-img" />
        </div>
        <p className="profile-name">{profile.name}</p>
        {user?.email && (
          <p className="profile-email" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {user.email}
          </p>
        )}

        <WatchStats />

        <div className="profile-manage-box">
          <h2 className="profile-manage-title">프로필 관리 (Kids / PIN)</h2>
          <p className="profile-manage-sub">
            여기서 설정한 Kids/PIN은 <b>프로필 선택 화면</b>과 <b>콘텐츠 필터</b>에 바로 반영됩니다.
          </p>

          {profileList.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>프로필 목록을 불러오는 중입니다…</p>
          ) : (
            <div className="profile-manage-list">
              {profileList.map((p) => {
                const key = p?.name || p?.id || "default";
                const s = settings?.[key] || {};
                const kids = !!s.kids;
                const hasPin = !!(s.pin && String(s.pin).trim());

                return (
                  <div key={p.id || key} className="profile-manage-item">
                    <div className="profile-manage-left">
                      <img className="profile-manage-avatar" src={p.avatar} alt={p.name} />
                      <div className="profile-manage-meta">
                        <div className="profile-manage-name">{p.name}</div>
                        <div className="profile-manage-badges">
                          {kids && <span className="pm-badge kids">KIDS</span>}
                          {hasPin && <span className="pm-badge pin">PIN</span>}
                        </div>
                      </div>
                    </div>

                    <div className="profile-manage-actions">
                      <label className="pm-toggle">
                        <input
                          type="checkbox"
                          checked={kids}
                          onChange={(e) => updateProfileSetting(key, { kids: e.target.checked })}
                        />
                        <span>Kids</span>
                      </label>

                      <button
                        type="button"
                        className="pm-btn"
                        onClick={() => {
                          const nextPin = window.prompt("설정할 PIN(숫자 4~6자리 권장). 비우면 해제됩니다.");
                          if (nextPin === null) return;
                          const trimmed = String(nextPin).trim();
                          updateProfileSetting(key, { pin: trimmed || null });
                        }}
                      >
                        PIN 설정
                      </button>

                      {hasPin && (
                        <button
                          type="button"
                          className="pm-btn danger"
                          onClick={() => updateProfileSetting(key, { pin: null })}
                        >
                          PIN 해제
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="home-btn" onClick={() => navigate("/")}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

