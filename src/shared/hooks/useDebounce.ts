import { useState, useEffect } from "react";

// [면접] 디바운스 = 입력이 멈춘 뒤에만 값을 반영
// → 예: 검색창에 "액션" 칠 때 글자마다 API 안 치고, 300ms 멈추면 그때 검색
// → 말하기: "연속 입력에 API가 과하게 호출되지 않게 useDebounce로 묶었습니다."
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // [면접] cleanup = value가 또 바뀌면 이전 타이머 취소
    // → 안 하면? 타이머가 쌓여서 예전 검색어로 API가 여러 번 나갈 수 있음
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
