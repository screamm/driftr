import {
  getDefaultAvatar,
  FREE_WAVE_LIMIT,
  MAX_VIDEO_DURATION,
} from "@/lib/constants";

describe("getDefaultAvatar", () => {
  it("returns 2-char initials for a full name", () => {
    const url = getDefaultAvatar("John Doe");
    expect(url).toContain("name=JD");
  });

  it("returns 1-char initial for a single name", () => {
    const url = getDefaultAvatar("Alice");
    expect(url).toContain("name=A");
  });

  it("returns '?' for null", () => {
    const url = getDefaultAvatar(null);
    expect(url).toContain("name=%3F");
  });

  it("returns '?' for undefined", () => {
    const url = getDefaultAvatar(undefined);
    expect(url).toContain("name=%3F");
  });

  it("uses custom size", () => {
    const url = getDefaultAvatar("Test", 200);
    expect(url).toContain("size=200");
  });

  it("defaults to size 400", () => {
    const url = getDefaultAvatar("Test");
    expect(url).toContain("size=400");
  });

  it("takes first 2 initials from 3+ word names", () => {
    const url = getDefaultAvatar("Mary Jane Watson");
    expect(url).toContain("name=MJ");
  });
});

describe("constants", () => {
  it("FREE_WAVE_LIMIT is 3", () => {
    expect(FREE_WAVE_LIMIT).toBe(3);
  });

  it("MAX_VIDEO_DURATION is 15", () => {
    expect(MAX_VIDEO_DURATION).toBe(15);
  });
});
