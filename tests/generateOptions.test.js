import { describe, expect, it } from "vitest";
import { generateOptions } from "../src/utils/generateOptions";

const words = [
  { id: 1, en: "time", cs: "cas" },
  { id: 2, en: "home", cs: "domov" },
  { id: 3, en: "water", cs: "voda" },
  { id: 4, en: "book", cs: "kniha" },
];

describe("generateOptions", () => {
  it("returns exactly three options", () => {
    const options = generateOptions(words[0], words);
    expect(options).toHaveLength(3);
  });

  it("always includes the correct answer", () => {
    const options = generateOptions(words[0], words);
    expect(options).toContain(words[0].cs);
  });

  it("does not include duplicate options", () => {
    const options = generateOptions(words[0], words);
    const unique = new Set(options);

    expect(unique.size).toBe(3);
  });
});
