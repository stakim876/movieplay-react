import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { useToast } from "@/context/ToastContext";
import { FaSearch, FaBell, FaCaretDown, FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "@/components/common/ThemeToggle";
import "@/styles/components/components.css";

const API_KEY = "7824c1cb6d4b09e0b18631b6bfa38a45";

const PROFILE_KEY = "mp_active_profile_v1";
const LOGO_SRC = "/assets/logo-mp.svg";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const auth = useAuth();
  const { warning: showWarning } = useToast();
  if (!auth) return null;
  const { user, logout } = auth;

  const { navigation, genres, loading: configLoading } = useConfig();

  const activeProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=ko-KR&query=${encodeURIComponent(
          trimmed
        )}&include_adult=false`
      );

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        showWarning("금칙어로 인해 검색할 수 없습니다.");
        return;
      }

      navigate(`/search?query=${encodeURIComponent(trimmed)}`);
      setQuery("");
    } catch (error) {
      console.error("검색 오류:", error);
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSearch(e);
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

  const handleGoProfiles = () => {
    navigate("/profiles");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setMobileSearchOpen(false);
    }
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (!mobileSearchOpen) {
      setMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-content">
        <div className="header-left-mobile">
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="메뉴"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="logo mp-logo" onClick={() => navigate("/home")}>
            <img src={LOGO_SRC} alt="MP" className="mp-header-logo" />
            <span className="mp-header-word">MoviePlay</span>
          </div>
        </div>

        <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link 
            to="/home" 
            className={`nav-item ${isActive("/home") || location.pathname === "/" ? "active" : ""}`}
          >
            홈
          </Link>

          <div
            className="dropdown"
            onMouseEnter={() => !window.matchMedia("(max-width: 768px)").matches && setDropdownOpen(true)}
            onMouseLeave={() => !window.matchMedia("(max-width: 768px)").matches && setDropdownOpen(false)}
            onClick={() => window.matchMedia("(max-width: 768px)").matches && setDropdownOpen(!dropdownOpen)}
          >
            <span className={`dropdown-toggle ${dropdownOpen ? "open" : ""}`}>
              카테고리 <FaCaretDown />
            </span>

            {dropdownOpen && !configLoading && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {navigation?.movieCategories?.length > 0 && (
                  <>
                    <span className="dropdown-section"> 영화</span>
                    {navigation.movieCategories.map((item) => (
                      <Link key={item.path} to={item.path}>
                        {item.label}
                      </Link>
                    ))}
                    <hr />
                  </>
                )}

                {navigation?.tvCategories?.length > 0 && (
                  <>
                    <span className="dropdown-section"> 드라마</span>
                    {navigation.tvCategories.map((item) => (
                      <Link key={item.path} to={item.path}>
                        {item.label}
                      </Link>
                    ))}
                    <hr />
                  </>
                )}

                {genres?.length > 0 && (
                  <>
                    <span className="dropdown-section"> 장르별</span>
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
            <Link 
              to="/favorites" 
              className={`nav-item ${isActive("/favorites") ? "active" : ""}`}
            >
              내 찜 목록
            </Link>
          )}
        </nav>

        <div className="header-right">
          <button 
            className="mobile-search-btn"
            onClick={toggleMobileSearch}
            aria-label="검색"
          >
            <FaSearch />
          </button>
          
          <form 
            className={`search-bar ${searchFocused ? "focused" : ""} ${mobileSearchOpen ? "mobile-open" : ""}`}
            onSubmit={handleSearch}
          >
            <button
              type="button"
              className="search-icon-btn"
              onClick={handleSearchClick}
              title="검색"
            >
              <FaSearch className="search-icon" />
            </button>
            <input
              type="text"
              placeholder="제목, 사람, 장르"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setSearchFocused(true);
                setMobileSearchOpen(true);
              }}
              onBlur={() => {
                if (!query) {
                  setSearchFocused(false);
                  setTimeout(() => setMobileSearchOpen(false), 200);
                }
              }}
            />
            {query && (
              <button 
                type="button" 
                className="search-clear"
                onClick={() => {
                  setQuery("");
                  setSearchFocused(false);
                  setMobileSearchOpen(false);
                }}
              >
                ✕
              </button>
            )}
          </form>

          <ThemeToggle />

          {user && (
            <div className="header-profile">
              {activeProfile && (
                <button
                  type="button"
                  className="profile-pill"
                  onClick={handleGoProfiles}
                  title="시청 프로필 변경"
                >
                  <span className="profile-avatar">
                    {activeProfile.avatar ? (
                      <img src={activeProfile.avatar} alt={activeProfile.name} />
                    ) : (
                      <span>{activeProfile.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className="profile-name">{activeProfile.name}</span>
                </button>
              )}
              <button 
                className="header-icon-btn"
                onClick={() => navigate("/profile")}
                title="프로필"
              >
                <span className="profile-icon">👤</span>
              </button>
            </div>
          )}

          <button className="auth-btn" onClick={handleAuth}>
            {user ? "로그아웃" : "로그인"}
          </button>
        </div>

      </div>
    </header>
  );
}
