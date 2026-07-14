import { getActiveWindow, scrollIndexFromLeft } from "../src/lib/carouselWindow";

describe("carouselWindow", () => {
  it("builds an active window from scroll index", () => {
    expect(getActiveWindow(5, 20)).toEqual({ start: 3, end: 13 });
    expect(getActiveWindow(0, 20)).toEqual({ start: 0, end: 10 });
    expect(getActiveWindow(19, 20)).toEqual({ start: 17, end: 20 });
  });

  it("derives scroll index from scrollLeft", () => {
    expect(scrollIndexFromLeft(0, 240)).toBe(0);
    expect(scrollIndexFromLeft(480, 240)).toBe(2);
  });
});
