export interface StyleProperty {
  property: string;
  value: string;
}

export interface ParsedStyles {
  [property: string]: string;
}

export function parseStyleString(styleString: string): ParsedStyles {
  const styles: ParsedStyles = {};

  if (!styleString || styleString.trim() === "") {
    return styles;
  }

  const declarations = styleString.split(";");

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(":");

    if (colonIndex === -1) {
      continue;
    }

    const property = declaration.substring(0, colonIndex).trim();
    const value = declaration.substring(colonIndex + 1).trim();

    if (property && value) {
      styles[property] = value;
    }
  }

  return styles;
}

export function extractColorProperties(styles: ParsedStyles): {
  color?: string;
  backgroundColor?: string;
} {
  const result: {
    color?: string;
    backgroundColor?: string;
  } = {};

  if (styles.color) {
    result.color = styles.color;
  }

  if (styles["background-color"]) {
    result.backgroundColor = styles["background-color"];
  }

  if (styles.backgroundColor) {
    result.backgroundColor = styles.backgroundColor;
  }

  return result;
}

export function isColorProperty(property: string): boolean {
  return ["color", "background-color", "backgroundColor"].includes(property);
}

export function getStyleProperties(styleString: string): StyleProperty[] {
  const styles = parseStyleString(styleString);
  const properties: StyleProperty[] = [];

  for (const property in styles) {
    properties.push({
      property,
      value: styles[property],
    });
  }

  return properties;
}
