import * as assert from "assert";
import { convertToRGBA, isValidColor, parseColor } from "../src/colorConverter";

suite("ColorConverter Tests", () => {
  test("convertToRGBA should convert hex color with opacity", () => {
    const result = convertToRGBA("#ff0000", 0.5);
    assert.strictEqual(result, "rgba(255, 0, 0, 0.5)");
  });

  test("convertToRGBA should convert named color with opacity", () => {
    const result = convertToRGBA("blue", 0.3);
    assert.strictEqual(result, "rgba(0, 0, 255, 0.3)");
  });

  test("convertToRGBA should convert rgb color with opacity", () => {
    const result = convertToRGBA("rgb(255, 0, 0)", 0.2);
    assert.strictEqual(result, "rgba(255, 0, 0, 0.2)");
  });

  test("convertToRGBA should convert rgba color with custom opacity", () => {
    const result = convertToRGBA("rgba(255, 0, 0, 0.5)", 0.4);
    assert.strictEqual(result, "rgba(255, 0, 0, 0.2)");
  });

  test("convertToRGBA should clamp opacity between 0 and 1", () => {
    const result1 = convertToRGBA("#ff0000", 2);
    assert.strictEqual(result1, "rgba(255, 0, 0, 1)");

    const result2 = convertToRGBA("#ff0000", -1);
    assert.strictEqual(result2, "rgba(255, 0, 0, 0)");
  });

  test("convertToRGBA should return null for invalid color", () => {
    const result = convertToRGBA("notacolor", 0.5);
    assert.strictEqual(result, null);
  });

  test("isValidColor should return true for valid hex colors", () => {
    assert.strictEqual(isValidColor("#ff0000"), true);
    assert.strictEqual(isValidColor("#f00"), true);
    assert.strictEqual(isValidColor("#ff0000ff"), true);
  });

  test("isValidColor should return true for valid named colors", () => {
    assert.strictEqual(isValidColor("red"), true);
    assert.strictEqual(isValidColor("blue"), true);
    assert.strictEqual(isValidColor("green"), true);
  });

  test("isValidColor should return true for valid rgb colors", () => {
    assert.strictEqual(isValidColor("rgb(255, 0, 0)"), true);
    assert.strictEqual(isValidColor("rgba(255, 0, 0, 0.5)"), true);
  });

  test("isValidColor should return false for invalid colors", () => {
    assert.strictEqual(isValidColor("notacolor"), false);
    assert.strictEqual(isValidColor("#gggggg"), false);
  });

  test("parseColor should parse hex color to RGBA object", () => {
    const result = parseColor("#ff0000");
    assert.deepStrictEqual(result, { r: 255, g: 0, b: 0, a: 1 });
  });

  test("parseColor should parse named color to RGBA object", () => {
    const result = parseColor("blue");
    assert.deepStrictEqual(result, { r: 0, g: 0, b: 255, a: 1 });
  });

  test("parseColor should return null for invalid color", () => {
    const result = parseColor("notacolor");
    assert.strictEqual(result, null);
  });
});
