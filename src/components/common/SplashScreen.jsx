import { useEffect, useState } from "react";
import "@/styles/common/splash.css";

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.classList.add("splash-active");

    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    const completeTimer = setTimeout(() => {
      document.body.classList.remove("splash-active");
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
      document.body.classList.remove("splash-active");
    };
  }, []);

  return (
    <div className={`splash-screen ${isVisible ? "visible" : "fade-out"}`}>
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <img 
            src="/assets/logo-mp.svg" 
            alt="MoviePlay" 
            className="splash-logo"
          />
        </div>
      </div>
    </div>
  );
}
