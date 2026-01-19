import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import WatchStats from "@/components/user/WatchStats";
import "../../styles/common/common.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profile = {
    name: user?.displayName || user?.email?.split("@")[0] || "내 프로필",
    img: "/assets/mickey.png",
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

        <div className="profile-actions">
          <button className="home-btn" onClick={() => navigate("/")}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

