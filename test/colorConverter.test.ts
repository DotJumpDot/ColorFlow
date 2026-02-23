import { convertToRGBA, isValidColor, parseColor, RGBAColor } from "../src/colorConverter";

describe("colorConverter", () => {
  describe("convertToRGBA", () => {
    test("should convert hex color to RGBA with opacity", () => {
      const result = convertToRGBA("#ff0000", 0.5);
      expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });

    test("should convert color name to RGBA with opacity", () => {
      const result = convertToRGBA("blue", 0.3);
      expect(result).toBe("rgba(0, 0, 255, 0.3)");
    });

    test("should convert rgb color to RGBA with opacity", () => {
      const result = convertToRGBA("rgb(255, 0, 0)", 0.8);
      expect(result).toBe("rgba(255, 0, 0, 0.8)");
    });

    test("should convert rgba color to RGBA with opacity multiplier", () => {
      const result = convertToRGBA("rgba(255, 0, 0, 0.5)", 0.5);
      expect(result).toBe("rgba(255, 0, 0, 0.25)");
    });

    test("should clamp opacity to 0", () => {
      const result = convertToRGBA("#ff0000", -1);
      expect(result).toBe("rgba(255, 0, 0, 0)");
    });

    test("should clamp opacity to 1", () => {
      const result = convertToRGBA("#ff0000", 2);
      expect(result).toBe("rgba(255, 0, 0, 1)");
    });

    test("should return null for invalid color", () => {
      const result = convertToRGBA("notacolor", 0.5);
      expect(result).toBeNull();
    });

    test("should return null for empty string", () => {
      const result = convertToRGBA("", 0.5);
      expect(result).toBeNull();
    });
  });

  describe("isValidColor", () => {
    test("should return true for valid hex color", () => {
      expect(isValidColor("#ff0000")).toBe(true);
      expect(isValidColor("#fff")).toBe(true);
      expect(isValidColor("#000000")).toBe(true);
    });

    test("should return true for valid color names", () => {
      expect(isValidColor("red")).toBe(true);
      expect(isValidColor("blue")).toBe(true);
      expect(isValidColor("green")).toBe(true);
    });

    test("should return true for valid rgb color", () => {
      expect(isValidColor("rgb(255, 0, 0)")).toBe(true);
      expect(isValidColor("rgb(0, 255, 0)")).toBe(true);
    });

    test("should return true for valid rgba color", () => {
      expect(isValidColor("rgba(255, 0, 0, 0.5)")).toBe(true);
    });

    test("should return false for invalid color", () => {
      expect(isValidColor("notacolor")).toBe(false);
      expect(isValidColor("")).toBe(false);
      expect(isValidColor("#gggggg")).toBe(false);
    });
  });

  describe("parseColor", () => {
    test("should parse hex color to RGBAColor object", () => {
      const result = parseColor("#ff0000");
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    test("should parse color name to RGBAColor object", () => {
      const result = parseColor("blue");
      expect(result).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });

    test("should parse rgb color to RGBAColor object", () => {
      const result = parseColor("rgb(255, 0, 0)");
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    test("should parse rgba color to RGBAColor object", () => {
      const result = parseColor("rgba(255, 0, 0, 0.5)");
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    test("should return null for invalid color", () => {
      const result = parseColor("notacolor");
      expect(result).toBeNull();
    });

    test("should return null for empty string", () => {
      const result = parseColor("");
      expect(result).toBeNull();
    });
  });
});
