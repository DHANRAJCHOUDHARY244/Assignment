import {
  isVideoLiked,
  markVideoLiked,
  unmarkVideoLiked,
} from "../src/lib/likedVideos";

const STORAGE_KEY = "likedVideos";

describe("likedVideos storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("tracks liked video ids", () => {
    expect(isVideoLiked("abc")).toBe(false);
    markVideoLiked("abc");
    expect(isVideoLiked("abc")).toBe(true);
    unmarkVideoLiked("abc");
    expect(isVideoLiked("abc")).toBe(false);
  });

  it("persists to localStorage", () => {
    markVideoLiked("v1");
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain("v1");
  });
});
