import { describe, expect, it } from "vitest";
import { resolvePlaybackSource } from "@/features/playback/lib/playbackSource";

describe("resolvePlaybackSource", () => {
  it("prefers official YouTube trailer when available", () => {
    const source = resolvePlaybackSource({
      videos: {
        results: [
          {
            type: "Trailer",
            site: "YouTube",
            key: "abc123",
            iso_639_1: "ko",
          },
        ],
      },
    });

    expect(source.mode).toBe("youtube-trailer");
    if (source.mode === "youtube-trailer") {
      expect(source.youtubeId).toBe("abc123");
    }
  });

  it("falls back to demo sample when no trailer exists", () => {
    const source = resolvePlaybackSource({ videos: { results: [] } });

    expect(source.mode).toBe("demo-sample");
    if (source.mode === "demo-sample") {
      expect(source.url).toContain("BigBuckBunny");
    }
  });
});
