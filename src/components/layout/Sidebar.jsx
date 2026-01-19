import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaHeart, FaUser } from "react-icons/fa";
import "@/styles/components/components.css";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <nav className="sidebar-nav">
        <Link to="/home" className="sidebar-item" onClick={onClose}>
          <FaHome /> <span>홈</span>
        </Link>
        <Link to="/search" className="sidebar-item" onClick={onClose}>
          <FaSearch /> <span>검색</span>
        </Link>
        <Link to="/favorites" className="sidebar-item" onClick={onClose}>
          <FaHeart /> <span>즐겨찾기</span>
        </Link>
        <Link to="/profile" className="sidebar-item" onClick={onClose}>
          <FaUser /> <span>프로필</span>
        </Link>
      </nav>
    </aside>
  );
}

