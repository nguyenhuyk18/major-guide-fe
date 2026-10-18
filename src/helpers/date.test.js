import { isCallOpen } from "./date";

const now = new Date(2026, 9, 14, 10, 0);

test("the call room opens only on the booking day", () => {
  expect(isCallOpen({ day_support: "2026-10-14" }, now)).toBe(true);
  expect(isCallOpen({ day_support: "2026-10-15" }, now)).toBe(false);
  expect(isCallOpen({ day_support: "2026-10-13" }, now)).toBe(false);
});

test("a demo booking keeps the call room open every day", () => {
  expect(isCallOpen({ is_demo: true, day_support: "2020-01-01" }, now)).toBe(true);
  expect(isCallOpen(null, now)).toBe(false);
});
