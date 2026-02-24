const text = `
      <div>
        {#if condition}
          <span>Text</span>
        {:else}
          <span>Other text</span>
        {/if}
      </div>
    `;

console.log("Original text:");
console.log(text);
console.log();

function maskSvelteControlFlow(content: string) {
  const trimmed = content.trim();
  const controlFlowKeywords = [
    "#if", "/if", ":else", "else if", ":else if",
    "#each", "/each", "#await", ":then", ":catch", "/await",
    "#key", "#snippet", "/snippet", "@render", "@const", "@debug", "@html",
    "#render", "@store"
  ];
  
  for (const keyword of controlFlowKeywords) {
    if (trimmed.startsWith(keyword)) {
      const keywordEnd = content.indexOf(keyword) + keyword.length;
      const rest = content.substring(keywordEnd);
      return {
        masked: " ".repeat(keyword.length) + rest
      };
    }
  }
  
  return { masked: content };
}

function sanitizeSvelteWithMapping(text: string) {
  let sanitized = "";
  let i = 0;
  let inTag = false;
  const indexMap = [0];
  let originalIndex = 0;

  while (i < text.length) {
    if (text[i] === "<") {
      inTag = true;
      sanitized += text[i];
      indexMap.push(originalIndex);
      i++;
      originalIndex++;
    } else if (text[i] === ">") {
      inTag = false;
      sanitized += text[i];
      indexMap.push(originalIndex);
      i++;
      originalIndex++;
    } else if (text[i] === "{" && !inTag) {
      let depth = 1;
      let j = i + 1;
      let inString = null;

      while (j < text.length && depth > 0) {
        const char = text[j];
        if (inString) {
          if (char === inString && (j === 0 || text[j - 1] !== "\\")) {
            inString = null;
          }
        } else {
          if (char === '"' || char === "'" || char === "`") {
            inString = char;
          } else if (char === "{") {
            depth++;
          } else if (char === "}") {
            depth--;
          }
        }
        if (depth > 0) j++;
      }

      const content = text.substring(i + 1, j);
      const { masked } = maskSvelteControlFlow(content);

      sanitized += "{";
      indexMap.push(originalIndex);
      originalIndex++;
      
      for (let k = 0; k < masked.length; k++) {
        sanitized += masked[k];
        indexMap.push(originalIndex);
        originalIndex++;
      }
      
      sanitized += "}";
      indexMap.push(originalIndex);
      originalIndex++;
      
      i = j + 1;
    } else {
      sanitized += text[i];
      indexMap.push(originalIndex);
      i++;
      originalIndex++;
    }
  }

  return { sanitized, indexMap };
}

const result = sanitizeSvelteWithMapping(text);

console.log("Sanitized text:");
console.log(result.sanitized);
console.log();

console.log("Index map (first 30 entries):");
for (let i = 0; i < Math.min(30, result.indexMap.length); i++) {
  console.log(`  indexMap[${i}] = ${result.indexMap[i]} -> char '${result.sanitized[i]}' -> original '${text[result.indexMap[i]]}'`);
}
