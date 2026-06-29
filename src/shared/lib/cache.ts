// [면접] TMDB API 응답을 메모리에 잠깐 저장하는 간단한 캐시
// → 왜? 같은 인기 영화 목록을 페이지 이동할 때마다 API 안 치려고
// → maxSize 넘으면 가장 오래된 항목 삭제 / ttl(10분) 지나면 만료
// → 말하기: "클라이언트 인메모리 캐시로 API 호출과 로딩 시간을 줄였습니다."
class ApiCache {
  private cache: Map<string, { value: unknown; timestamp: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, value: unknown) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }
}

export const apiCache = new ApiCache(200, 10 * 60 * 1000);
