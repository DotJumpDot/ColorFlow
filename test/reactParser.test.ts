import { parseReactDocument } from "../src/reactParser";

describe("reactParser", () => {
  const createMockDocument = (text: string): any => {
    const lines = text.split("\n");
    return {
      getText: () => text,
      positionAt: (offset: number) => {
        let currentOffset = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1;
          if (currentOffset + lineLength > offset) {
            const character = offset - currentOffset;
            return { line: i, character };
          }
          currentOffset += lineLength;
        }
        return { line: lines.length - 1, character: lines[lines.length - 1].length };
      },
      offsetAt: (position: any) => {
        let offset = 0;
        for (let i = 0; i < position.line; i++) {
          offset += lines[i].length + 1;
        }
        return offset + position.character;
      },
    };
  };

  describe("parseReactDocument", () => {
    test("should parse simple div with inline style", () => {
      const text = '<div style={{ color: "red" }}>Hello</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      expect(result.elements.length).toBeGreaterThan(0);
      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement).toBeDefined();
      expect(divElement?.colors.color).toBe("red");
      expect(divElement?.hasInlineStyle).toBe(true);
    });

    test("should parse backgroundColor in inline style", () => {
      const text = '<div style={{ backgroundColor: "#007acc" }}>Content</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.colors.backgroundColor).toBe("#007acc");
    });

    test("should parse both color and backgroundColor", () => {
      const text = '<div style={{ color: "#ffffff", backgroundColor: "#007acc" }}>Text</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.colors.color).toBe("#ffffff");
      expect(divElement?.colors.backgroundColor).toBe("#007acc");
    });

    test("should parse className attribute", () => {
      const text = '<div className="text-red">Content</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.classes).toContain("text-red");
    });

    test("should parse multiple classes", () => {
      const text = '<div className="btn primary active">Button</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.classes).toEqual(["btn", "primary", "active"]);
    });

    test("should handle nested elements", () => {
      const text = `
        <div style={{ backgroundColor: "#f0f0f0" }}>
          <h1 style={{ color: "#007acc" }}>Title</h1>
          <p style={{ color: "#333333" }}>Paragraph</p>
        </div>
      `;
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      expect(result.elements.length).toBeGreaterThanOrEqual(3);

      const h1Element = result.elements.find((el) => el.tagName === "h1");
      expect(h1Element?.colors.color).toBe("#007acc");

      const pElement = result.elements.find((el) => el.tagName === "p");
      expect(pElement?.colors.color).toBe("#333333");

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.colors.backgroundColor).toBe("#f0f0f0");
    });

    test("should handle text content in elements", () => {
      const text = '<div style={{ color: "red" }}>Hello World</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.textContent).toBe("Hello World");
      expect(divElement?.textNodes.length).toBeGreaterThan(0);
    });

    test("should handle complex JSX expressions", () => {
      const text = `
        <div style={{ backgroundColor: "#007acc" }}>
          {title}
          <p>{children}</p>
        </div>
      `;
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.colors.backgroundColor).toBe("#007acc");
    });

    test("should handle conditional styles", () => {
      const text = '<div style={{ color: isActive ? "#007acc" : "#cccccc" }}>Text</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.hasInlineStyle).toBe(true);
    });

    test("should handle self-closing tags", () => {
      const text = '<img style={{ width: "100%" }} src="test.jpg" />';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const imgElement = result.elements.find((el) => el.tagName === "img");
      expect(imgElement).toBeDefined();
    });

    test("should handle React fragments", () => {
      const text = `
        <>
          <div style={{ color: "red" }}>First</div>
          <div style={{ color: "blue" }}>Second</div>
        </>
      `;
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElements = result.elements.filter((el) => el.tagName === "div");
      expect(divElements.length).toBeGreaterThanOrEqual(2);
    });

    test("should parse camelCase style properties", () => {
      const text = '<div style={{ backgroundColor: "#007acc", fontSize: "16px" }}>Text</div>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement?.colors.backgroundColor).toBe("#007acc");
      expect(divElement?.hasInlineStyle).toBe(true);
    });

    test("should parse button elements", () => {
      const text =
        '<button style={{ backgroundColor: "#007acc", color: "#ffffff" }}>Click</button>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const buttonElement = result.elements.find((el) => el.tagName === "button");
      expect(buttonElement?.colors.backgroundColor).toBe("#007acc");
      expect(buttonElement?.colors.color).toBe("#ffffff");
    });

    test("should parse span elements", () => {
      const text = '<span style={{ color: "#28a745", backgroundColor: "#e9ecef" }}>Badge</span>';
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const spanElement = result.elements.find((el) => el.tagName === "span");
      expect(spanElement?.colors.color).toBe("#28a745");
      expect(spanElement?.colors.backgroundColor).toBe("#e9ecef");
    });

    test("should handle elements without styles", () => {
      const text = "<div>No colors here</div>";
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divElement = result.elements.find((el) => el.tagName === "div");
      expect(divElement).toBeDefined();
      expect(divElement?.colors.color).toBeUndefined();
      expect(divElement?.colors.backgroundColor).toBeUndefined();
    });

    test("should handle hex, and color names", () => {
      const text = `
        <div style={{ color: "#ff0000" }}>Red</div>
        <div style={{ color: "#00ff00" }}>Green</div>
        <div style={{ color: "blue" }}>Blue</div>
      `;
      const document = createMockDocument(text);
      const result = parseReactDocument(document as any);

      const divs = result.elements.filter((el) => el.tagName === "div");
      expect(divs.length).toBeGreaterThanOrEqual(3);

      expect(divs[0]?.colors.color).toBe("#ff0000");
      expect(divs[1]?.colors.color).toBe("#00ff00");
      expect(divs[2]?.colors.color).toBe("blue");
    });
  });
});
