import { Scale } from "./Scale";

// Key index
// C = 0
// C# = 1
// D = 2
// D# = 3
// E = 4
// F = 5
// F# = 6
// G = 7
// G# = 8
// A = 9
// Bb = 10
// B = 11

describe("Scale", () => {
  it("should create C major scale", () => {
    const keys = Scale.getScaleKeyIndexes(0, "major");
    expect(keys.length).toBe(8);
    expect(keys).toStrictEqual([0, 2, 4, 5, 7, 9, 11, 12]);
  });

  it("should create E major scale", () => {
    const keys = Scale.getScaleKeyIndexes(4, "major");
    expect(keys.length).toBe(8);
    expect(keys).toStrictEqual([4, 6, 8, 9, 11, 13, 15, 16]);
  });
});
