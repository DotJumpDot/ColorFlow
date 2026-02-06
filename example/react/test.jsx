import React from 'react';

const ColorFlowTest = () => {
  return (
    <div>
      {/* SECTION 1: Basic Color Names */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Basic Color Names</h1>
        <p style={{ color: 'red' }}>This text is red using color name</p>
        <p style={{ color: 'blue' }}>This text is blue using color name</p>
        <p style={{ color: 'green' }}>This text is green using color name</p>
        <p style={{ color: 'orange' }}>This text is orange using color name</p>
        <p style={{ color: 'purple' }}>This text is purple using color name</p>
        <p style={{ color: 'teal' }}>This text is teal using color name</p>
      </section>

      {/* SECTION 2: Hex Color Values */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Hex Color Values</h1>
        <p style={{ color: '#ff0000' }}>This text is red using hex #ff0000</p>
        <p style={{ color: '#00ff00' }}>This text is green using hex #00ff00</p>
        <p style={{ color: '#0000ff' }}>This text is blue using hex #0000ff</p>
        <p style={{ color: '#ffff00' }}>This text is yellow using hex #ffff00</p>
        <p style={{ color: '#ff00ff' }}>This text is magenta using hex #ff00ff</p>
        <p style={{ color: '#00ffff' }}>This text is cyan using hex #00ffff</p>
        <p style={{ color: '#ff5733' }}>This text is coral using hex #ff5733</p>
        <p style={{ color: '#28a745' }}>This text is green using hex #28a745</p>
        <p style={{ color: '#6f42c1' }}>This text is indigo using hex #6f42c1</p>
      </section>

      {/* SECTION 3: RGB Color Values */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>RGB Color Values</h1>
        <p style={{ color: 'rgb(255, 0, 0)' }}>This text is red using rgb(255, 0, 0)</p>
        <p style={{ color: 'rgb(0, 255, 0)' }}>This text is green using rgb(0, 255, 0)</p>
        <p style={{ color: 'rgb(0, 0, 255)' }}>This text is blue using rgb(0, 0, 255)</p>
        <p style={{ color: 'rgb(128, 128, 128)' }}>This text is gray using rgb(128, 128, 128)</p>
        <p style={{ color: 'rgb(255, 165, 0)' }}>This text is orange using rgb(255, 165, 0)</p>
        <p style={{ color: 'rgb(147, 112, 219)' }}>This text is purple using rgb(147, 112, 219)</p>
      </section>

      {/* SECTION 4: RGBA Color Values */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>RGBA Color Values</h1>
        <p style={{ color: 'rgba(255, 0, 0, 0.5)' }}>
          This text is semi-transparent red using rgba(255, 0, 0, 0.5)
        </p>
        <p style={{ color: 'rgba(0, 255, 0, 0.7)' }}>
          This text is semi-transparent green using rgba(0, 255, 0, 0.7)
        </p>
        <p style={{ color: 'rgba(0, 0, 255, 0.9)' }}>
          This text is semi-transparent blue using rgba(0, 0, 255, 0.9)
        </p>
        <p style={{ color: 'rgba(128, 128, 128, 0.3)' }}>
          This text is semi-transparent gray using rgba(128, 128, 128, 0.3)
        </p>
      </section>

      {/* SECTION 5: HSL Color Values */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>HSL Color Values</h1>
        <p style={{ color: 'hsl(0, 100%, 50%)' }}>This text is red using hsl(0, 100%, 50%)</p>
        <p style={{ color: 'hsl(120, 100%, 50%)' }}>This text is green using hsl(120, 100%, 50%)</p>
        <p style={{ color: 'hsl(240, 100%, 50%)' }}>This text is blue using hsl(240, 100%, 50%)</p>
        <p style={{ color: 'hsl(60, 100%, 50%)' }}>This text is yellow using hsl(60, 100%, 50%)</p>
        <p style={{ color: 'hsl(180, 100%, 50%)' }}>This text is cyan using hsl(180, 100%, 50%)</p>
        <p style={{ color: 'hsl(300, 100%, 50%)' }}>This text is magenta using hsl(300, 100%, 50%)</p>
      </section>

      {/* SECTION 6: Background Color Only */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Background Color Only</h1>
        <p style={{ backgroundColor: '#ffcccc' }}>This has red background color</p>
        <p style={{ backgroundColor: '#ccffcc' }}>This has green background color</p>
        <p style={{ backgroundColor: '#ccccff' }}>This has blue background color</p>
        <p style={{ backgroundColor: '#ffffcc' }}>This has yellow background color</p>
        <p style={{ backgroundColor: '#ffccff' }}>This has magenta background color</p>
        <p style={{ backgroundColor: '#ccffff' }}>This has cyan background color</p>
      </section>

      {/* SECTION 7: Both Color and Background Color */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Both Color and Background Color</h1>
        <p style={{ color: 'white', backgroundColor: '#ff0000' }}>White text on red background</p>
        <p style={{ color: 'white', backgroundColor: '#00ff00' }}>White text on green background</p>
        <p style={{ color: 'white', backgroundColor: '#0000ff' }}>White text on blue background</p>
        <p style={{ color: 'black', backgroundColor: '#ffff00' }}>Black text on yellow background</p>
        <p style={{ color: 'white', backgroundColor: '#ff00ff' }}>White text on magenta background</p>
        <p style={{ color: 'black', backgroundColor: '#00ffff' }}>Black text on cyan background</p>
      </section>

      {/* SECTION 8: Nested Elements with Color Inheritance */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Nested Elements with Color Inheritance</h1>

        <div style={{ color: 'red' }}>
          <p>This paragraph inherits red color from parent div</p>
          <span>This span also inherits red color from parent div</span>
          <strong>This strong tag also inherits red color from parent div</strong>
          <p>Another paragraph inheriting red color</p>
        </div>

        <div style={{ color: 'blue' }}>
          <p>This paragraph inherits blue color from parent div</p>
          <span>This span inherits blue color</span>
          <strong>This strong tag inherits blue color</strong>
        </div>

        <div style={{ color: 'green' }}>
          <h3>Heading with green inherited color</h3>
          <p>Paragraph with green inherited color</p>
          <div style={{ color: 'purple' }}>
            <p>This paragraph overrides with purple color</p>
            <span>This span has purple color</span>
          </div>
          <p>Back to green inherited color</p>
        </div>
      </section>

      {/* SECTION 9: Nested Elements with Background Color Inheritance */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Nested Elements with Background Color</h1>

        <div style={{ backgroundColor: '#ffcccc' }}>
          <p>This paragraph has parent with red background</p>
          <span>This span has parent with red background</span>
        </div>

        <div style={{ backgroundColor: '#ccffcc' }}>
          <p>This paragraph has parent with green background</p>
          <span>This span has parent with green background</span>
        </div>

        <div style={{ backgroundColor: '#ccccff' }}>
          <h3>Heading with parent blue background</h3>
          <p>Paragraph with parent blue background</p>
        </div>
      </section>

      {/* SECTION 10: Mixed Color and Background in Nested Structure */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Mixed Color and Background in Nested Structure</h1>

        <section style={{ backgroundColor: 'purple', color: 'white' }}>
          <h2>Section with purple background and white text</h2>
          <p>This paragraph has white text color</p>
          <div style={{ color: 'yellow' }}>
            <p>This div has yellow text color (overriding parent)</p>
            <span>This span has yellow text color</span>
          </div>
          <p>Back to white text color</p>
        </section>

        <section style={{ backgroundColor: '#333', color: '#fff' }}>
          <h2>Dark section with white text</h2>
          <p>This paragraph has white text color</p>
          <div style={{ color: '#ffcc00' }}>
            <p>This div has golden text color</p>
            <span>This span has golden text color</span>
          </div>
        </section>
      </section>

      {/* SECTION 11: Long Text Content */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Long Text Content</h1>
        <p style={{ color: '#333' }}>
          This is a longer paragraph of text to test how Color Flow extension handles longer text
          spans with inline styles. The extension should properly highlight entire text range
          with specified color. This allows users to visualize the color of text in their HTML
          documents with configurable background highlighting. The extension supports various
          color formats including hex, rgb, rgba, hsl, hsla, and color names.
        </p>
        <p style={{ color: '#666' }}>
          Another paragraph with different color. This text is gray and demonstrates that the
          extension can handle multiple paragraphs with different colors within the same section.
          Each paragraph should be highlighted according to its own color property. The extension
          parses HTML documents using htmlparser2 and tracks accurate positions for precise range
          calculation.
        </p>
      </section>

      {/* SECTION 12: Multiple Styles Including Color */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Multiple Styles Including Color</h1>
        <p style={{ color: 'blue', fontSize: '16px', fontWeight: 'bold' }}>
          Blue bold text with 16px font size
        </p>
        <p style={{ color: 'green', fontSize: '18px', textDecoration: 'underline' }}>
          Green underlined text with 18px font size
        </p>
        <p style={{ color: 'red', fontStyle: 'italic', letterSpacing: '1px' }}>
          Red italic text with letter spacing
        </p>
        <p style={{ color: 'purple', lineHeight: '1.5', textAlign: 'center' }}>
          Purple text with 1.5 line height
        </p>
        <p style={{ color: 'orange', padding: '10px', border: '1px solid orange' }}>
          Orange text with padding and border
        </p>
      </section>

      {/* SECTION 13: Elements Without Inline Styles */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Elements Without Inline Styles</h1>
        <p>This paragraph has no inline styles and should not be highlighted</p>
        <span>This span has no inline styles and should not be highlighted</span>
        <div>This div has no inline styles and should not be highlighted</div>
        <p>Another paragraph without inline styles</p>
        <strong>Strong tag without inline styles</strong>
        <em>Em tag without inline styles</em>
      </section>

      {/* SECTION 14: Short Color Values */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Short Hex Color Values</h1>
        <p style={{ color: '#f00' }}>This text is red using short hex #f00</p>
        <p style={{ color: '#0f0' }}>This text is green using short hex #0f0</p>
        <p style={{ color: '#00f' }}>This text is blue using short hex #00f</p>
        <p style={{ color: '#ff0' }}>This text is yellow using short hex #ff0</p>
        <p style={{ color: '#f0f' }}>This text is magenta using short hex #f0f</p>
        <p style={{ color: '#0ff' }}>This text is cyan using short hex #0ff</p>
        <p style={{ color: '#888' }}>This text is gray using short hex #888</p>
        <p style={{ color: '#000' }}>This text is black using short hex #000</p>
        <p style={{ color: '#fff' }}>This text is white using short hex #fff</p>
      </section>

      {/* SECTION 15: Deep Nesting */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Deep Nesting</h1>
        <div style={{ color: 'red' }}>
          <div>
            <div>
              <p>Deeply nested paragraph with inherited red color</p>
              <div style={{ color: 'blue' }}>
                <p>Even deeper with blue color override</p>
                <div>
                  <span>More nesting with blue color</span>
                </div>
              </div>
              <p>Back to red color from grandparent</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 16: Inline Elements */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Inline Elements</h1>
        <p>Normal text with <span style={{ color: 'red' }}>red span</span> in the middle</p>
        <p>
          More text with <strong style={{ color: 'blue' }}>blue strong</strong> and
          <em style={{ color: 'green' }}>green em</em> tags
        </p>
        <p>
          Multiple <span style={{ color: 'purple' }}>purple</span> inline
          <span style={{ color: 'orange' }}>orange</span> elements
        </p>
        <p>Text with <a href="#" style={{ color: '#0066cc' }}>blue link</a> styled inline</p>
      </section>

      {/* SECTION 17: Empty or Minimal Text */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Empty or Minimal Text</h1>
        <p style={{ color: 'red' }}>A</p>
        <p style={{ color: 'blue' }}>B</p>
        <p style={{ color: 'green' }}>C</p>
        <p style={{ color: 'orange' }}>Short</p>
        <p style={{ color: 'purple' }}>Quick</p>
      </section>

      {/* SECTION 18: Special Characters and Symbols */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Special Characters and Symbols</h1>
        <p style={{ color: 'red' }}>Text with special characters: @#$%^&*()_+-=[]{}|;':",./&lt;&gt;?</p>
        <p style={{ color: 'blue' }}>Unicode characters: 你好世界 こんにちは Привет мир</p>
        <p style={{ color: 'green' }}>Emojis: 😀🎉🌟💻🚀</p>
        <p style={{ color: 'purple' }}>Math symbols: ∑∫∞≈≠≤≥</p>
      </section>

      {/* SECTION 19: Case Sensitivity */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Case Sensitivity</h1>
        <p style={{ color: 'red' }}>RED color</p>
        <p style={{ color: 'Blue' }}>Blue color</p>
        <p style={{ color: 'GREEN' }}>GREEN color</p>
        <p style={{ color: 'OrAnGe' }}>Orange color</p>
      </section>

      {/* SECTION 20: Border Radius Testing */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '20px', margin: '10px' }}>
        <h1>Border Radius Testing (for extension border settings)</h1>
        <p style={{ backgroundColor: '#ffcccc' }}>Text with red background (no border radius)</p>
        <p style={{ backgroundColor: '#ccffcc' }}>Text with green background</p>
        <p style={{ backgroundColor: '#ccccff' }}>Text with blue background</p>
      </section>
    </div>
  );
};

export default ColorFlowTest;
