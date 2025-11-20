import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import "@/styles/components.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { navigation, genres, loading: configLoading } = useConfig();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    setQuery("");
  };

  const handleAuth = async () => {
    if (user) {
      try {
        await logout();
        navigate("/login");
      } catch (err) {
        console.error("로그아웃 실패:", err);
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-content">
        <div className="logo" onClick={() => navigate("/home")}>
          MoviePlay
        </div>

        <nav className="nav-links">
          <Link to="/home" className="nav-item">
            홈
          </Link>

          <div
            className="dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span className="dropdown-toggle">카테고리 ▾</span>
            {dropdownOpen && !configLoading && (
              <div className="dropdown-menu">
                {navigation?.movieCategories && navigation.movieCategories.length > 0 && (
                  <>
                    <span className="dropdown-section">🎬 영화</span>
                    {navigation.movieCategories.map((item) => (
                      <Link key={item.path} to={item.path}>
                        {item.label}
                      </Link>
                    ))}
                    <hr />
                  </>
                )}

                {navigation?.tvCategories && navigation.tvCategories.length > 0 && (
                  <>
                    <span className="dropdown-section">📺 드라마</span>
                    {navigation.tvCategories.map((item) => (
                      <Link key={item.path} to={item.path}>
                        {item.label}
                      </Link>
                    ))}
                    <hr />
                  </>
                )}

                {genres && genres.length > 0 && (
                  <>
                    <span className="dropdown-section">🎭 장르별</span>
                    {genres.map((genre) => (
                      <Link key={genre.id} to={`/category/genre/${genre.genreId}`}>
                        {genre.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {user && (
            <Link to="/favorites" className="nav-item">
              내 찜 목록
            </Link>
          )}

          {user && (
            <Link to="/profile" className="nav-item">
              프로필
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="nav-item">
              관리자
            </Link>
          )}
        </nav>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>

        <button className="auth-btn" onClick={handleAuth}>
          {user ? "로그아웃" : "로그인"}
        </button>
      </div>
    </header>
  );
}

