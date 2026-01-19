import { FaSun, FaMoon, FaDesktop } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import "@/styles/themes/theme-toggle.css";

export default function ThemeToggle() {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === "system") {
      return <FaDesktop />;
    }
    return effectiveTheme === "dark" ? <FaMoon /> : <FaSun />;
  };

  const getLabel = () => {
    if (theme === "system") {
      return "시스템";
    }
    return effectiveTheme === "dark" ? "다크" : "라이트";
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`테마 전환 (현재: ${getLabel()})`}
      aria-label={`테마 전환: ${getLabel()}`}
    >
      <span className="theme-toggle-icon">{getIcon()}</span>
      <span className="theme-toggle-label">{getLabel()}</span>
    </button>
  );
}
