import { parseCSSStyles, ClassColorDefinition } from "../src/cssParser";

describe("cssParser", () => {
  describe("parseCSSStyles", () => {
    test("should parse simple CSS class with color", () => {
      const css = ".text-red { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("text-red")).toEqual({ className: "text-red", color: "red" });
    });

    test("should parse CSS class with background-color", () => {
      const css = ".bg-blue { background-color: blue; }";
      const result = parseCSSStyles(css);
      expect(result.get("bg-blue")).toEqual({ className: "bg-blue", backgroundColor: "blue" });
    });

    test("should parse CSS class with both color and background-color", () => {
      const css = ".colored { color: red; background-color: blue; }";
      const result = parseCSSStyles(css);
      expect(result.get("colored")).toEqual({
        className: "colored",
        color: "red",
        backgroundColor: "blue",
      });
    });

    test("should parse multiple CSS classes", () => {
      const css = ".text-red { color: red; } .bg-blue { background-color: blue; }";
      const result = parseCSSStyles(css);
      expect(result.size).toBe(2);
      expect(result.get("text-red")).toEqual({ className: "text-red", color: "red" });
      expect(result.get("bg-blue")).toEqual({ className: "bg-blue", backgroundColor: "blue" });
    });

    test("should handle complex selectors", () => {
      const css = ".btn.active { color: white; }";
      const result = parseCSSStyles(css);
      expect(result.get("btn")).toEqual({ className: "btn", color: "white" });
      expect(result.get("active")).toEqual({ className: "active", color: "white" });
    });

    test("should handle comma-separated selectors", () => {
      const css = ".text-red, .text-blue { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("text-red")).toEqual({ className: "text-red", color: "red" });
      expect(result.get("text-blue")).toEqual({ className: "text-blue", color: "red" });
    });

    test("should merge multiple rules for same class", () => {
      const css = ".text { color: red; } .text { background-color: blue; }";
      const result = parseCSSStyles(css);
      expect(result.get("text")).toEqual({
        className: "text",
        color: "red",
        backgroundColor: "blue",
      });
    });

    test("should use first color when multiple rules define it", () => {
      const css = ".text { color: red; } .text { color: blue; }";
      const result = parseCSSStyles(css);
      expect(result.get("text")).toEqual({ className: "text", color: "red" });
    });

    test("should handle empty CSS text", () => {
      const result = parseCSSStyles("");
      expect(result.size).toBe(0);
    });

    test("should handle CSS comments", () => {
      const css = "/* This is a comment */ .text-red { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("text-red")).toEqual({ className: "text-red", color: "red" });
    });

    test("should handle multi-line CSS comments", () => {
      const css = "/*\n * Multi-line comment\n */ .text-red { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("text-red")).toEqual({ className: "text-red", color: "red" });
    });

    test("should ignore non-color properties", () => {
      const css = ".text { color: red; font-size: 16px; font-weight: bold; }";
      const result = parseCSSStyles(css);
      expect(result.get("text")).toEqual({ className: "text", color: "red" });
    });

    test("should handle pseudo-class selectors", () => {
      const css = ".btn:hover { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("btn")).toEqual({ className: "btn", color: "red" });
    });

    test("should handle ID selectors (should not extract)", () => {
      const css = "#header { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.size).toBe(0);
    });

    test("should handle element selectors (should not extract)", () => {
      const css = "div { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.size).toBe(0);
    });

    test("should handle mixed selectors", () => {
      const css = "div#header .logo.text-red { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("logo")).toEqual({ className: "logo", color: "red" });
      expect(result.get("text-red")).toEqual({ className: "text-red", color: "red" });
    });

    test("should handle whitespace around braces and declarations", () => {
      const css = ".text  {  color  :  red  ;  }";
      const result = parseCSSStyles(css);
      expect(result.get("text")).toEqual({ className: "text", color: "red" });
    });

    test("should handle declarations without trailing semicolon", () => {
      const css = ".text { color: red }";
      const result = parseCSSStyles(css);
      expect(result.get("text")).toEqual({ className: "text", color: "red" });
    });

    test("should handle class names with numbers and hyphens", () => {
      const css = ".text-2xl, .bg-primary-500 { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("text-2xl")).toEqual({ className: "text-2xl", color: "red" });
      expect(result.get("bg-primary-500")).toEqual({ className: "bg-primary-500", color: "red" });
    });

    test("should handle class names with underscores", () => {
      const css = ".text_red { color: red; }";
      const result = parseCSSStyles(css);
      expect(result.get("text_red")).toEqual({ className: "text_red", color: "red" });
    });
  });
});
