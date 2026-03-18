import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const HorizontalScroller = forwardRef(function HorizontalScroller(
  {
    className = "",
    scrollClassName = "",
    children,
    ariaLabel = "horizontal scroller",
    step = "page",
    showControls = true,
    showIndicator = true,
    variant = "netflix",
    onScroll,
  },
  forwardedRef
) {
  const innerRef = useRef(null);
  const scrollerRef = innerRef;
  const setForwardedRef = (node) => {
    innerRef.current = node;
    if (!forwardedRef) return;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else forwardedRef.current = node;
  };

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const drag = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startLeft: 0,
  });

  const updateEdges = useMemo(() => {
    return () => {
      const el = scrollerRef?.current;
      if (!el) return;

      const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      const left = clamp(el.scrollLeft, 0, maxLeft);
      setCanLeft(left > 1);
      setCanRight(maxLeft - left > 1);
      setHasOverflow(maxLeft > 1);
      setProgress(maxLeft > 1 ? left / maxLeft : 0);

      const stepPx = Math.max(1, computeStep());
      const totalPages = Math.max(1, Math.ceil(el.scrollWidth / stepPx));
      const currentPage = Math.max(
        0,
        Math.min(totalPages - 1, Math.round(el.scrollLeft / stepPx))
      );
      setPages(totalPages);
      setActivePage(currentPage);
    };
  }, [scrollerRef]);

  useEffect(() => {
    const el = scrollerRef?.current;
    if (!el) return;

    // 초기 렌더 직후 + 이미지/폰트 로딩 등으로 scrollWidth가 변하는 케이스 보정
    updateEdges();
    const raf1 = requestAnimationFrame(updateEdges);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(updateEdges));
    const t1 = setTimeout(updateEdges, 150);
    const t2 = setTimeout(updateEdges, 500);

    // 이미지 로딩(load) 시 scrollWidth가 커지는 케이스 보정 (load는 버블링 안 해서 capture 사용)
    const onAnyLoadCapture = () => updateEdges();
    el.addEventListener("load", onAnyLoadCapture, true);

    // children 변경/비동기 렌더로 너비가 바뀌는 케이스 보정
    const mo = new MutationObserver(() => updateEdges());
    mo.observe(el, { childList: true, subtree: true, attributes: true });

    // 레이아웃 변동을 더 확실히 따라가도록 짧은 폴링(1초) 추가
    let alive = true;
    let last = -1;
    const start = performance.now();
    const tick = () => {
      if (!alive) return;
      const now = performance.now();
      const width = el.scrollWidth;
      if (width !== last) {
        last = width;
        updateEdges();
      }
      if (now - start < 1000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t1);
      clearTimeout(t2);
      el.removeEventListener("load", onAnyLoadCapture, true);
      alive = false;
      mo.disconnect();
      ro.disconnect();
    };
  }, [scrollerRef, updateEdges]);

  const computeStep = () => {
    const el = scrollerRef?.current;
    if (!el) return 520;
    if (typeof step === "number") return step;
    if (step === "page") return Math.max(320, Math.floor(el.clientWidth * 0.92));
    return 520;
  };

  const scrollBy = (dx) => {
    const el = scrollerRef?.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  const handleWheel = (e) => {
    const el = scrollerRef?.current;
    if (!el) return;

    // 트랙패드/마우스 휠 모두 자연스럽게 가로 이동
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 1) return;

    // 수평 스크롤 가능한 영역에서만 기본 스크롤을 가로로 전환
    const maxLeft = el.scrollWidth - el.clientWidth;
    if (maxLeft <= 0) return;

    e.preventDefault();
    el.scrollLeft += delta;
  };

  const handlePointerDown = (e) => {
    const el = scrollerRef?.current;
    if (!el) return;

    // 링크/버튼 클릭은 방해하지 않기 위해 좌클릭(또는 터치)만 드래그 시작
    if (e.pointerType === "mouse" && e.button !== 0) return;

    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startLeft: el.scrollLeft,
    };

    el.setPointerCapture(e.pointerId);
    el.classList.add("hs-dragging");
  };

  const handlePointerMove = (e) => {
    const el = scrollerRef?.current;
    if (!el) return;
    if (!drag.current.active) return;
    if (drag.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.current.startX;
    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = (e) => {
    const el = scrollerRef?.current;
    if (!el) return;
    if (!drag.current.active) return;
    if (drag.current.pointerId !== e.pointerId) return;

    drag.current.active = false;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    el.classList.remove("hs-dragging");
  };

  const handleScroll = (e) => {
    updateEdges();
    onScroll?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollBy(-computeStep());
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollBy(computeStep());
    } else if (e.key === "Home") {
      const el = scrollerRef?.current;
      if (!el) return;
      e.preventDefault();
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (e.key === "End") {
      const el = scrollerRef?.current;
      if (!el) return;
      e.preventDefault();
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  };

  return (
    <div className={`hs ${variant ? `hs--${variant}` : ""} ${className}`.trim()}>
      {showControls && (
        <>
          <button
            type="button"
            className={`hs-btn hs-left ${canLeft ? "" : "disabled"}`.trim()}
            onClick={() => scrollBy(-computeStep())}
            aria-label="scroll left"
            disabled={!canLeft}
          >
            ‹
          </button>
          <button
            type="button"
            className={`hs-btn hs-right ${canRight ? "" : "disabled"}`.trim()}
            onClick={() => scrollBy(computeStep())}
            aria-label="scroll right"
            disabled={!canRight}
          >
            ›
          </button>
        </>
      )}

      <div
        ref={setForwardedRef}
        className={`hs-scroll ${scrollClassName}`.trim()}
        role="region"
        aria-label={ariaLabel}
        onWheel={handleWheel}
        onScroll={handleScroll}
        onMouseEnter={updateEdges}
        onTouchStart={updateEdges}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {children}
      </div>
      <div className={`hs-edge hs-edge-left ${canLeft ? "show" : ""}`.trim()} />
      <div className={`hs-edge hs-edge-right ${canRight ? "show" : ""}`.trim()} />

      {showIndicator && hasOverflow && (
        <div
          className={`hs-progress ${hasOverflow ? "" : "no-overflow"}`.trim()}
          aria-hidden="true"
        >
          <div className="hs-dots" role="presentation">
            {Array.from({ length: pages }).map((_, i) => (
              <span
                key={i}
                className={`hs-dot ${i === activePage ? "active" : ""}`.trim()}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default HorizontalScroller;

