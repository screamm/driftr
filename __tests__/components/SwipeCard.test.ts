import { formatDistance } from "@/components/SwipeCard";

describe("formatDistance", () => {
  it("returns '<1 km' for distances under 1 km", () => {
    expect(formatDistance(0)).toBe("<1 km");
    expect(formatDistance(0.5)).toBe("<1 km");
    expect(formatDistance(0.99)).toBe("<1 km");
  });

  it("returns 1 decimal place for distances 1-9.9 km", () => {
    expect(formatDistance(1)).toBe("1.0 km");
    expect(formatDistance(5.7)).toBe("5.7 km");
    expect(formatDistance(9.9)).toBe("9.9 km");
  });

  it("returns rounded integer for distances >= 10 km", () => {
    expect(formatDistance(10)).toBe("10 km");
    expect(formatDistance(10.4)).toBe("10 km");
    expect(formatDistance(10.6)).toBe("11 km");
    expect(formatDistance(150)).toBe("150 km");
  });
});
