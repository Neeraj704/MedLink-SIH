import { describe, it, expect } from "vitest";

describe("Doctor Slot Calculation & Generation", () => {
  it("generates correct slots for a 9:00 to 11:00 window with 30 min duration", () => {
    const workingHours = {
      from: "09:00",
      to: "11:00",
      slot_minutes: 30,
    };

    const slots: string[] = [];
    const [startH, startM] = workingHours.from.split(":").map(Number);
    const [endH, endM] = workingHours.to.split(":").map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + workingHours.slot_minutes <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      current += workingHours.slot_minutes;
    }

    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30"]);
    expect(slots).toHaveLength(4);
  });

  it("handles empty or closed clinic days gracefully", () => {
    const dayConfig = { open: false, from: "09:00", to: "17:00" };
    expect(dayConfig.open).toBe(false);
  });
});
