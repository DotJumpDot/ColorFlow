import {
  parseStyleString,
  extractColorProperties,
  isColorProperty,
  getStyleProperties,
  ParsedStyles,
  StyleProperty,
} from "../src/styleParser";

describe("styleParser", () => {
  describe("parseStyleString", () => {
    test("should parse simple style string", () => {
      const result = parseStyleString("color: red; background: blue;");
      expect(result).toEqual({
        color: "red",
        background: "blue",
      });
    });

    test("should parse style string with kebab-case properties", () => {
      const result = parseStyleString("background-color: blue; font-size: 16px;");
      expect(result).toEqual({
        "background-color": "blue",
        "font-size": "16px",
      });
    });

    test("should parse style string with camelCase properties", () => {
      const result = parseStyleString("backgroundColor: blue; fontSize: 16px;");
      expect(result).toEqual({
        backgroundColor: "blue",
        fontSize: "16px",
      });
    });

    test("should handle whitespace around properties and values", () => {
      const result = parseStyleString("  color  :  red  ;  background  :  blue  ;  ");
      expect(result).toEqual({
        color: "red",
        background: "blue",
      });
    });

    test("should return empty object for empty string", () => {
      const result = parseStyleString("");
      expect(result).toEqual({});
    });

    test("should return empty object for whitespace only", () => {
      const result = parseStyleString("   ");
      expect(result).toEqual({});
    });

    test("should ignore malformed declarations", () => {
      const result = parseStyleString("color:red; malformed; background:blue;");
      expect(result).toEqual({
        color: "red",
        background: "blue",
      });
    });

    test("should handle declarations without trailing semicolon", () => {
      const result = parseStyleString("color: red; background: blue");
      expect(result).toEqual({
        color: "red",
        background: "blue",
      });
    });
  });

  describe("extractColorProperties", () => {
    test("should extract color property", () => {
      const styles: ParsedStyles = { color: "red", fontSize: "16px" };
      const result = extractColorProperties(styles);
      expect(result).toEqual({ color: "red" });
    });

    test("should extract background-color property", () => {
      const styles: ParsedStyles = { "background-color": "blue", fontSize: "16px" };
      const result = extractColorProperties(styles);
      expect(result).toEqual({ backgroundColor: "blue" });
    });

    test("should extract backgroundColor property", () => {
      const styles: ParsedStyles = { backgroundColor: "blue", fontSize: "16px" };
      const result = extractColorProperties(styles);
      expect(result).toEqual({ backgroundColor: "blue" });
    });

    test("should extract both color and background properties", () => {
      const styles: ParsedStyles = { color: "red", "background-color": "blue", fontSize: "16px" };
      const result = extractColorProperties(styles);
      expect(result).toEqual({ color: "red", backgroundColor: "blue" });
    });

    test("should prefer backgroundColor over background-color when both exist", () => {
      const styles: ParsedStyles = {
        "background-color": "blue",
        backgroundColor: "green",
        color: "red",
      };
      const result = extractColorProperties(styles);
      expect(result).toEqual({ color: "red", backgroundColor: "green" });
    });

    test("should return empty object when no color properties exist", () => {
      const styles: ParsedStyles = { fontSize: "16px", fontWeight: "bold" };
      const result = extractColorProperties(styles);
      expect(result).toEqual({});
    });
  });

  describe("isColorProperty", () => {
    test("should return true for color property", () => {
      expect(isColorProperty("color")).toBe(true);
    });

    test("should return true for background-color property", () => {
      expect(isColorProperty("background-color")).toBe(true);
    });

    test("should return true for backgroundColor property", () => {
      expect(isColorProperty("backgroundColor")).toBe(true);
    });

    test("should return false for other properties", () => {
      expect(isColorProperty("fontSize")).toBe(false);
      expect(isColorProperty("fontWeight")).toBe(false);
      expect(isColorProperty("margin")).toBe(false);
    });
  });

  describe("getStyleProperties", () => {
    test("should convert style string to array of StyleProperty objects", () => {
      const result = getStyleProperties("color: red; background: blue;");
      expect(result).toEqual([
        { property: "color", value: "red" },
        { property: "background", value: "blue" },
      ]);
    });

    test("should handle empty style string", () => {
      const result = getStyleProperties("");
      expect(result).toEqual([]);
    });

    test("should handle whitespace style string", () => {
      const result = getStyleProperties("   ");
      expect(result).toEqual([]);
    });

    test("should preserve property order", () => {
      const result = getStyleProperties("margin: 0; padding: 10px; color: red;");
      expect(result).toEqual([
        { property: "margin", value: "0" },
        { property: "padding", value: "10px" },
        { property: "color", value: "red" },
      ]);
    });
  });
});
