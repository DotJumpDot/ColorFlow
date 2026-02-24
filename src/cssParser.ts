export interface ClassColorDefinition {
  className: string;
  color?: string;
  backgroundColor?: string;
}

export interface CSSVariableDefinition {
  name: string;
  value: string;
}

export interface CSSImport {
  url: string;
}

export function parseCSSStyles(cssText: string): Map<string, ClassColorDefinition> {
  const classColors = new Map<string, ClassColorDefinition>();

  const rules = extractCSSRules(cssText);

  for (const rule of rules) {
    if (!rule.selector || !rule.declarations) continue;

    const classes = extractClassNames(rule.selector);

    for (const className of classes) {
      const existing = classColors.get(className) || {
        className,
        color: undefined,
        backgroundColor: undefined,
      };

      for (const declaration of rule.declarations) {
        if (declaration.property === "color" && !existing.color) {
          existing.color = declaration.value;
        } else if (declaration.property === "background-color" && !existing.backgroundColor) {
          existing.backgroundColor = declaration.value;
        }
      }

      classColors.set(className, existing);
    }
  }

  return classColors;
}

export function parseCSSVariables(cssText: string): Map<string, CSSVariableDefinition> {
  const variables = new Map<string, CSSVariableDefinition>();

  const rules = extractCSSRules(cssText);

  for (const rule of rules) {
    if (!rule.declarations) continue;

    for (const declaration of rule.declarations) {
      if (declaration.property && declaration.property.startsWith("--")) {
        const varName = declaration.property.substring(2);
        variables.set(varName, {
          name: varName,
          value: declaration.value,
        });
      }
    }
  }

  return variables;
}

export function extractCSSImports(cssText: string): CSSImport[] {
  const imports: CSSImport[] = [];
  
  const importRegex = /@import\s+(?:url\()?["']([^"']+)["']\)?;?/gi;
  let match;
  
  while ((match = importRegex.exec(cssText)) !== null) {
    const url = match[1].trim();
    if (url) {
      imports.push({ url });
    }
  }
  
  return imports;
}

function extractCSSRules(cssText: string): CSSRule[] {
  const rules: CSSRule[] = [];

  const cleanedCSS = removeComments(cssText);

  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let match;

  while ((match = ruleRegex.exec(cleanedCSS)) !== null) {
    const selector = match[1].trim();
    const declarationsText = match[2].trim();

    if (selector && declarationsText) {
      const declarations = parseDeclarations(declarationsText);
      rules.push({ selector, declarations });
    }
  }

  return rules;
}

function parseDeclarations(declarationsText: string): CSSDeclaration[] {
  const declarations: CSSDeclaration[] = [];

  const cleaned = removeComments(declarationsText);
  const parts = cleaned.split(";");

  for (const part of parts) {
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) continue;

    const property = part.substring(0, colonIndex).trim();
    const value = part.substring(colonIndex + 1).trim();

    if (property && value) {
      declarations.push({ property, value });
    }
  }

  return declarations;
}

function extractClassNames(selector: string): string[] {
  const classNames: string[] = [];

  const classRegex = /\.([a-zA-Z_-][\w-]*)/g;
  let match;

  while ((match = classRegex.exec(selector)) !== null) {
    classNames.push(match[1]);
  }

  return classNames;
}

function removeComments(cssText: string): string {
  return cssText.replace(/\/\*[\s\S]*?\*\//g, "");
}

interface CSSRule {
  selector: string;
  declarations: CSSDeclaration[];
}

interface CSSDeclaration {
  property: string;
  value: string;
}
