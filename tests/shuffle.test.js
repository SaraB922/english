import { describe, expect, it } from "vitest";
import { shuffle } from "../src/utils/shuffle";

describe("shuffle", () => {
  it("returns same items with same length", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = shuffle(input);

    expect(output).toHaveLength(input.length);
    expect([...output].sort()).toEqual([...input].sort());
  });

  it("does not mutate original array", () => {
    const input = [1, 2, 3, 4];
    const snapshot = [...input];

    shuffle(input);

    expect(input).toEqual(snapshot);
  });
});
