import { formatTimestamp } from "@/app/(screens)/matches";

describe("formatTimestamp", () => {
  it("returns HH:mm for today", () => {
    const now = new Date();
    now.setHours(14, 30, 0, 0);
    const result = formatTimestamp(now.toISOString());
    expect(result).toBe("14:30");
  });

  it("returns 'Yesterday' for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);
    const result = formatTimestamp(yesterday.toISOString());
    expect(result).toBe("Yesterday");
  });

  it("returns 'MMM d' for older dates", () => {
    // Use a date that's definitely not today or yesterday
    const oldDate = new Date(2024, 0, 15); // Jan 15, 2024
    const result = formatTimestamp(oldDate.toISOString());
    expect(result).toBe("Jan 15");
  });

  it("returns 'MMM d' for a date 5 days ago", () => {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const result = formatTimestamp(fiveDaysAgo.toISOString());

    // Should be formatted as "MMM d"
    expect(result).not.toBe("Yesterday");
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
