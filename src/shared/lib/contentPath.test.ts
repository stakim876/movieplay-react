import { describe, expect, it } from "vitest";
import { getContentPath, getPlayerPath, resolveMediaType } from "@/shared/lib/contentPath";

describe("contentPath", () => {
  it("resolves movie type", () => {
    expect(resolveMediaType({ id: 1, title: "Inception" })).toBe("movie");
    expect(getContentPath({ id: 1, title: "Inception" })).toBe("/movie/1");
  });

  it("resolves tv type", () => {
    expect(resolveMediaType({ id: 2, name: "Show", first_air_date: "2020-01-01" })).toBe("tv");
    expect(getContentPath({ id: 2, name: "Show", first_air_date: "2020-01-01" })).toBe("/tv/2");
  });

  it("builds player paths", () => {
    expect(getPlayerPath({ id: 10, title: "Film" })).toBe("/player/10");
    expect(getPlayerPath({ id: 20, name: "Drama", first_air_date: "2021-01-01" })).toBe(
      "/player/tv/20?season=1&episode=1"
    );
  });
});
