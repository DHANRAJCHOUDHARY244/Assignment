import {
  addMinutes,
  currentDate,
  currentYear,
  addSeconds,
  addDays,
  convertToMilliseconds,
  formatTimestamp,
  formatUptime,
} from "../../src/utils/dayjs";

describe("dayjs utils", () => {
  describe("currentDate", () => {
    it("should return the current date as a Date object", () => {
      const result = currentDate();
      expect(result).toBeInstanceOf(Date);
      // Should be within 1 second of now
      expect(Math.abs(result.getTime() - Date.now())).toBeLessThan(1000);
    });
  });

  describe("currentYear", () => {
    it("should return the current year", () => {
      const result = currentYear();
      const expectedYear = new Date().getFullYear();
      expect(result).toBe(expectedYear);
    });
  });

  describe("addSeconds", () => {
    it("should add the specified number of seconds to the current date", () => {
      const baseline = currentDate();
      const result = addSeconds(30);

      const expected = baseline.getTime() + 30 * 1000;
      expect(Math.abs(result.getTime() - expected)).toBeLessThan(1000);
    });
  });

  describe("addMinutes", () => {
    it("should add the specified number of minutes to the current date", () => {
      const baseline = currentDate();
      const result = addMinutes(5);

      // Calculate expected time (in milliseconds)
      const expected = baseline.getTime() + 5 * 60 * 1000;
      // The result should be within 1 second of expected time to account for test execution time
      expect(Math.abs(result.getTime() - expected)).toBeLessThan(1000);
    });
  });

  describe("addDays", () => {
    it("should add the specified number of days to the current date", () => {
      const baseline = currentDate();
      const result = addDays(7);

      const expected = baseline.getTime() + 7 * 24 * 60 * 60 * 1000;
      expect(Math.abs(result.getTime() - expected)).toBeLessThan(1000);
    });
  });

  describe("convertToMilliseconds", () => {
    it("should convert minutes to milliseconds", () => {
      expect(convertToMilliseconds(1)).toBe(60000);
      expect(convertToMilliseconds(5)).toBe(300000);
      expect(convertToMilliseconds(60)).toBe(3600000);
    });
  });

  describe("formatTimestamp", () => {
    it("should format a date to DD/MM/YYYY hh:mm a format", () => {
      const testDate = new Date("2025-03-15T14:30:00");
      const result = formatTimestamp(testDate);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (am|pm)$/);
    });

    it("should format the current date when no date is provided", () => {
      const result = formatTimestamp();
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (am|pm)$/);
    });
  });

  describe("formatUptime", () => {
    it("should format seconds only", () => {
      expect(formatUptime(5)).toBe("5 secs");
      expect(formatUptime(1)).toBe("1 sec");
    });

    it("should format minutes and seconds", () => {
      expect(formatUptime(65)).toBe("1 min 5 secs");
      expect(formatUptime(125)).toBe("2 mins 5 secs");
    });

    it("should format hours, minutes and seconds", () => {
      expect(formatUptime(3665)).toBe("1 hr 1 min 5 secs");
      expect(formatUptime(7325)).toBe("2 hrs 2 mins 5 secs");
    });

    it("should format days, hours, minutes and seconds", () => {
      expect(formatUptime(90065)).toBe("1 day 1 hr 1 min 5 secs");
      expect(formatUptime(180125)).toBe("2 days 2 hrs 2 mins 5 secs");
    });

    it("should format complex uptime with months", () => {
      // 31 days + 1 hour + 1 min + 5 secs = 2,678,465 seconds
      const result = formatUptime(2678465);
      expect(result).toContain("mo");
      expect(result).toContain("sec");
    });

    it("should format complex uptime with years", () => {
      // Approximately 1 year worth of seconds
      const result = formatUptime(31557600); // ~365.25 days
      expect(result).toContain("yr");
    });

    it("should handle 0 seconds", () => {
      expect(formatUptime(0)).toBe("0 sec");
    });
  });
});
