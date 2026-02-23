import {
  parseStyleString,
  extractColorProperties,
  isColorProperty,
  getStyleProperties,
  resolveCSSVariable,
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

  describe("resolveCSSVariable", () => {
    test("should resolve single CSS variable", () => {
      const cssVariables = new Map([
        ["primary-color", { name: "primary-color", value: "#ff0000" }],
        ["text-color", { name: "text-color", value: "#333333" }],
      ]);
      const result = resolveCSSVariable("var(--primary-color)", cssVariables);
      expect(result).toBe("#ff0000");
    });

    test("should resolve CSS variable with fallback", () => {
      const cssVariables = new Map([
        ["primary-color", { name: "primary-color", value: "#ff0000" }],
      ]);
      const result = resolveCSSVariable("var(--missing-color, #ff5733)", cssVariables);
      expect(result).toBe("#ff5733");
    });

    test("should resolve nested CSS variables", () => {
      const cssVariables = new Map([
        ["base-color", { name: "base-color", value: "#ff0000" }],
        ["derived-color", { name: "derived-color", value: "var(--base-color)" }],
      ]);
      const result = resolveCSSVariable("var(--derived-color)", cssVariables);
      expect(result).toBe("#ff0000");
    });

    test("should handle multiple CSS variables in one value", () => {
      const cssVariables = new Map([
        ["primary", { name: "primary", value: "#ff0000" }],
        ["secondary", { name: "secondary", value: "#00ff00" }],
      ]);
      const result = resolveCSSVariable("var(--primary) var(--secondary)", cssVariables);
      expect(result).toBe("#ff0000 #00ff00");
    });

    test("should return original value when variable not found and no fallback", () => {
      const cssVariables = new Map([
        ["primary-color", { name: "primary-color", value: "#ff0000" }],
      ]);
      const result = resolveCSSVariable("var(--missing-color)", cssVariables);
      expect(result).toBe("var(--missing-color)");
    });

    test("should handle CSS variables with hyphens and underscores", () => {
      const cssVariables = new Map([
        ["my-color-1", { name: "my-color-1", value: "#ff0000" }],
        ["color_var_2", { name: "color_var_2", value: "#00ff00" }],
      ]);
      const result = resolveCSSVariable("var(--my-color-1)", cssVariables);
      expect(result).toBe("#ff0000");
    });

    test("should handle mixed content with CSS variables", () => {
      const cssVariables = new Map([
        ["primary-color", { name: "primary-color", value: "#ff0000" }],
      ]);
      const result = resolveCSSVariable("border: 1px solid var(--primary-color)", cssVariables);
      expect(result).toBe("border: 1px solid #ff0000");
    });

    test("should prevent infinite loops in nested variables", () => {
      const cssVariables = new Map([
        ["color-1", { name: "color-1", value: "var(--color-2)" }],
        ["color-2", { name: "color-2", value: "var(--color-1)" }],
      ]);
      const result = resolveCSSVariable("var(--color-1)", cssVariables);
      expect(result).toBe("var(--color-1)");
    });

    test("should resolve CSS variable in rgba format", () => {
      const cssVariables = new Map([
        ["primary-color", { name: "primary-color", value: "255, 0, 0" }],
      ]);
      const result = resolveCSSVariable("rgba(var(--primary-color), 0.5)", cssVariables);
      expect(result).toBe("rgba(255, 0, 0, 0.5)");
    });
  });
});
