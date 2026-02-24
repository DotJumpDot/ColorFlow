import { parseSvelteDocument } from "../src/svelteParser";
import * as vscode from "vscode";

function createMockDocument(text: string): vscode.TextDocument {
  const lineOffsets: number[] = [0];
  const lines = text.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    lineOffsets.push(lineOffsets[i] + lines[i].length + 1);
  }

  return {
    getText: () => text,
    positionAt: (offset: number) => {
      let line = 0;
      while (line < lineOffsets.length - 1 && offset >= lineOffsets[line + 1]) {
        line++;
      }
      const character = offset - lineOffsets[line];
      return new vscode.Position(line, character);
    },
    offsetAt: (position: vscode.Position) => {
      const line = Math.min(position.line, lineOffsets.length - 1);
      return lineOffsets[line] + position.character;
    },
    uri: vscode.Uri.parse("file:///test.svelte"),
    fileName: "test.svelte",
  } as any;
}

describe("Svelte Parser", () => {
  it("should not highlight Svelte control flow blocks", () => {
    const svelteCode = `
      <div>
        {#if condition}
          <span>Text</span>
        {:else}
          <span>Other text</span>
        {/if}
      </div>
    `;

    const document = createMockDocument(svelteCode);
    const result = parseSvelteDocument(document);

    // Should parse elements without errors
    expect(result.elements.length).toBeGreaterThan(0);
    
    // Should have span elements with text content
    const spans = result.elements.filter(el => el.tagName === "span");
    expect(spans.length).toBe(2);
    
    // Span text should be "Text" and "Other text" (not control flow)
    expect(spans[0].textContent?.trim()).toBe("Text");
    expect(spans[1].textContent?.trim()).toBe("Other text");
  });

  it("should preserve simple expressions for highlighting", () => {
    const svelteCode = `
      <div>
        <span>{variable}</span>
        <span>{data.name}</span>
      </div>
    `;

    const document = createMockDocument(svelteCode);
    const result = parseSvelteDocument(document);

    // Should parse elements without errors
    expect(result.elements.length).toBeGreaterThan(0);
    
    // Should have span elements
    const spans = result.elements.filter(el => el.tagName === "span");
    expect(spans.length).toBe(2);
    
    // Expressions should be preserved in text content
    expect(spans[0].textContent?.trim()).toBe("{variable}");
    expect(spans[1].textContent?.trim()).toBe("{data.name}");
  });

  it("should handle inline styles in Svelte", () => {
    const svelteCode = `
      <div style="color: red; background: blue;">
        Text content
      </div>
    `;

    const document = createMockDocument(svelteCode);
    const result = parseSvelteDocument(document);

    const div = result.elements.find(el => el.tagName === "div");
    expect(div).toBeDefined();
    expect(div?.hasInlineStyle).toBe(true);
    expect(div?.styles.color).toBe("red");
    // Note: 'background' shorthand should be extracted
    if (div?.styles.backgroundColor) {
      expect(div?.styles.backgroundColor).toBe("blue");
    } else {
      // If not extracted, check that background is in styles
      expect(div?.styles.background).toBe("blue");
    }
  });

  it("should handle Svelte snippet syntax", () => {
    const svelteCode = `
      {#snippet item(data)}
        <span>{data.name}</span>
      {/snippet}
      
      <div>
        {@render item(itemData)}
      </div>
    `;

    const document = createMockDocument(svelteCode);
    const result = parseSvelteDocument(document);

    // Should parse without errors
    expect(result.elements.length).toBeGreaterThan(0);
  });

  it("should handle Svelte each blocks", () => {
    const svelteCode = `
      {#each items as item (item.id)}
        <span>{item.name}</span>
      {/each}
    `;

    const document = createMockDocument(svelteCode);
    const result = parseSvelteDocument(document);

    // Should parse without errors
    expect(result.elements.length).toBeGreaterThan(0);
  });

  it("should handle Svelte await blocks", () => {
    const svelteCode = `
      {#await promise}
        Loading...
      {:then data}
        <span>{data}</span>
      {:catch error}
        Error: {error.message}
      {/await}
    `;

    const document = createMockDocument(svelteCode);
    const result = parseSvelteDocument(document);

    // Should parse without errors
    expect(result.elements.length).toBeGreaterThan(0);
  });
});
