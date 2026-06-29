import { useEffect, type RefObject } from "react";

// [면접] 키보드로 영화 카드 사이를 이동하는 훅
// → React state로 "몇 번째 카드"를 관리하면 카드마다 리렌더 → DOM focus()가 더 가볍다
// → 말하기: "접근성을 위해 키보드 네비게이션을 넣었고, 포커스는 DOM API로 처리했습니다."
export function useKeyboardNavigation(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector = ".movie-card"
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // 검색창·입력 중일 때는 화살표 키를 가로채지 않음 (글자 이동이 막히면 안 됨)
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
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
        case "ArrowDown": {
          e.preventDefault();
          const itemsPerRow = Math.floor(container.offsetWidth / 200);
          nextIndex = Math.min(currentIndex + itemsPerRow, items.length - 1);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const itemsPerRowUp = Math.floor(container.offsetWidth / 200);
          nextIndex = Math.max(currentIndex - itemsPerRowUp, 0);
          break;
        }
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

    const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
    items.forEach((item) => {
      if (!item.hasAttribute("tabindex")) {
        item.setAttribute("tabindex", "0");
      }
    });

    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 사라질 때 리스너 제거 (안 하면 메모리 누수 + 키 입력이 두 번 처리될 수 있음)
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, itemSelector]);
}
