import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";
import "../../styles/common.css";

export default function WhoPage() {
  const navigate = useNavigate();
  const { profiles, loading } = useConfig();

  const handleProfileClick = (profile) => {
    console.log("선택된 프로필:", profile.name);
    localStorage.setItem("selectedProfile", profile.name);
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
          onClick={() => alert("프로필 추가 예정 기능")}
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

