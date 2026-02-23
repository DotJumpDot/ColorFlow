import { DecorationManager } from "../src/decorationManager";
import { ColorFlowSettings } from "../src/settingsManager";

describe("decorationManager", () => {
  let decorationManager: DecorationManager;

  beforeEach(() => {
    decorationManager = new DecorationManager();
  });

  afterEach(() => {
    decorationManager.dispose();
  });

  describe("isPureCodeSyntax", () => {
    const settings: ColorFlowSettings = {
      enabled: true,
      opacity: 0.15,
      enableBorder: false,
      borderColor: "currentColor",
      borderRadius: "0px",
      highlightMode: "char-range",
      enableClassHighlighting: true,
    };

    test("should return false for JSX expressions with single identifier", () => {
      const result = (decorationManager as any).isPureCodeSyntax("{title}");
      expect(result).toBe(false);
    });

    test("should return false for JSX expressions with children", () => {
      const result = (decorationManager as any).isPureCodeSyntax("{children}");
      expect(result).toBe(false);
    });

    test("should return false for JSX expressions with dot notation", () => {
      const result = (decorationManager as any).isPureCodeSyntax("{props.title}");
      expect(result).toBe(false);
    });

    test("should return false for JSX expressions with dollar sign", () => {
      const result = (decorationManager as any).isPureCodeSyntax("$variable");
      expect(result).toBe(false);
    });

    test("should return false for sanitized JSX expressions (underscores)", () => {
      const result = (decorationManager as any).isPureCodeSyntax("_____");
      expect(result).toBe(false);
    });

    test("should return true for pure brackets", () => {
      const result = (decorationManager as any).isPureCodeSyntax("{}");
      expect(result).toBe(true);
    });

    test("should return true for function declarations", () => {
      const result = (decorationManager as any).isPureCodeSyntax("function test() {");
      expect(result).toBe(true);
    });

    test("should return true for const declarations", () => {
      const result = (decorationManager as any).isPureCodeSyntax("const x = 1;");
      expect(result).toBe(true);
    });

    test("should return true for empty string", () => {
      const result = (decorationManager as any).isPureCodeSyntax("");
      expect(result).toBe(true);
    });

    test("should return true for whitespace only", () => {
      const result = (decorationManager as any).isPureCodeSyntax("   ");
      expect(result).toBe(true);
    });

    test("should return true for return statements", () => {
      const result = (decorationManager as any).isPureCodeSyntax("return x;");
      expect(result).toBe(true);
    });

    test("should return true for if statements", () => {
      const result = (decorationManager as any).isPureCodeSyntax("if (x) {");
      expect(result).toBe(true);
    });
  });
});
