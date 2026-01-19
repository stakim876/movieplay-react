import { useEffect, useRef } from "react";

export function useKeyboardNavigation(containerRef, itemSelector = ".movie-card") {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      const items = Array.from(container.querySelectorAll(itemSelector));
      if (items.length === 0) return;

      const currentIndex = items.findIndex((item) => item === document.activeElement);
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case "ArrowDown":
          e.preventDefault();
          const itemsPerRow = Math.floor(container.offsetWidth / 200);
          nextIndex = Math.min(currentIndex + itemsPerRow, items.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          const itemsPerRowUp = Math.floor(container.offsetWidth / 200);
          nextIndex = Math.max(currentIndex - itemsPerRowUp, 0);
          break;
        case "Enter":
        case " ":
          if (currentIndex >= 0) {
            e.preventDefault();
            items[currentIndex].click();
          }
          break;
        default:
          return;
      }

      if (nextIndex >= 0 && nextIndex < items.length) {
        items[nextIndex].focus();
        items[nextIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    };

    const items = Array.from(container.querySelectorAll(itemSelector));
    items.forEach((item) => {
      if (!item.hasAttribute("tabindex")) {
        item.setAttribute("tabindex", "0");
      }
    });

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, itemSelector]);
}
