import {
  parseCSSStyles,
  parseCSSVariables,
  ClassColorDefinition,
  CSSVariableDefinition,
} from "../src/cssParser";

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

  describe("parseCSSVariables", () => {
    test("should parse CSS custom properties", () => {
      const css = ":root { --primary-color: #ff0000; --secondary-color: #00ff00; }";
      const result = parseCSSVariables(css);
      expect(result.size).toBe(2);
      expect(result.get("primary-color")).toEqual({ name: "primary-color", value: "#ff0000" });
      expect(result.get("secondary-color")).toEqual({ name: "secondary-color", value: "#00ff00" });
    });

    test("should parse CSS variables with various color formats", () => {
      const css = ":root { --color-1: red; --color-2: #00ff00; --color-3: rgb(0,0,255); }";
      const result = parseCSSVariables(css);
      expect(result.get("color-1")).toEqual({ name: "color-1", value: "red" });
      expect(result.get("color-2")).toEqual({ name: "color-2", value: "#00ff00" });
      expect(result.get("color-3")).toEqual({ name: "color-3", value: "rgb(0,0,255)" });
    });

    test("should parse CSS variables from any selector", () => {
      const css = ".theme-dark { --bg-color: #1a1a1a; --text-color: #ffffff; }";
      const result = parseCSSVariables(css);
      expect(result.get("bg-color")).toEqual({ name: "bg-color", value: "#1a1a1a" });
      expect(result.get("text-color")).toEqual({ name: "text-color", value: "#ffffff" });
    });

    test("should handle CSS variables with hyphens and underscores", () => {
      const css = ":root { --my-color: #ff0000; --color_var: #00ff00; --theme-color-1: #0000ff; }";
      const result = parseCSSVariables(css);
      expect(result.get("my-color")).toEqual({ name: "my-color", value: "#ff0000" });
      expect(result.get("color_var")).toEqual({ name: "color_var", value: "#00ff00" });
      expect(result.get("theme-color-1")).toEqual({ name: "theme-color-1", value: "#0000ff" });
    });

    test("should ignore non-variable properties", () => {
      const css = ":root { --primary-color: #ff0000; color: red; font-size: 16px; }";
      const result = parseCSSVariables(css);
      expect(result.size).toBe(1);
      expect(result.get("primary-color")).toEqual({ name: "primary-color", value: "#ff0000" });
    });

    test("should handle empty CSS text", () => {
      const result = parseCSSVariables("");
      expect(result.size).toBe(0);
    });

    test("should handle CSS comments", () => {
      const css = "/* CSS Variables */ :root { --primary-color: #ff0000; }";
      const result = parseCSSVariables(css);
      expect(result.get("primary-color")).toEqual({ name: "primary-color", value: "#ff0000" });
    });

    test("should parse variables with complex values", () => {
      const css = ":root { --shadow: 0 2px 4px rgba(0,0,0,0.1); --transition: all 0.3s ease; }";
      const result = parseCSSVariables(css);
      expect(result.get("shadow")).toEqual({ name: "shadow", value: "0 2px 4px rgba(0,0,0,0.1)" });
      expect(result.get("transition")).toEqual({ name: "transition", value: "all 0.3s ease" });
    });

    test("should parse variables with fallback values", () => {
      const css = ":root { --primary: #ff0000; --secondary: var(--primary, #00ff00); }";
      const result = parseCSSVariables(css);
      expect(result.get("primary")).toEqual({ name: "primary", value: "#ff0000" });
      expect(result.get("secondary")).toEqual({ name: "secondary", value: "var(--primary, #00ff00)" });
    });
  });
});
