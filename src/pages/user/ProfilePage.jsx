import { useNavigate } from "react-router-dom";
import "../../styles/common.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  const profile = {
    name: "내 프로필",
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

        <div className="profile-actions">
          <button className="home-btn" onClick={() => navigate("/")}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

