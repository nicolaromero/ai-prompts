/**
 * Utility functions for generating XML prompts
 * Following Claude and OpenAI best practices
 */

export interface PromptData {
  role: string;
  context: string;
  security: string;
  task: string;
  guidelines?: string;
  examples?: string;
  language?: string;
  languageEnabled: boolean;
  responseFormat: string;
}

/**
 * Generate XML prompt following best practices
 */
export function generateXML(data: PromptData): string {
  let xml = `<prompt>\n`;

  // Required fields
  xml += `  <role>\n${indent(escapeXML(data.role), 4)}\n  </role>\n\n`;
  xml += `  <context>\n${indent(escapeXML(data.context), 4)}\n  </context>\n\n`;
  xml += `  <security>\n${indent(escapeXML(data.security), 4)}\n  </security>\n\n`;
  xml += `  <task>\n${indent(escapeXML(data.task), 4)}\n  </task>\n\n`;

  // Optional fields
  if (data.guidelines && data.guidelines.trim()) {
    xml += `  <guidelines>\n${indent(escapeXML(data.guidelines), 4)}\n  </guidelines>\n\n`;
  }

  if (data.examples && data.examples.trim()) {
    xml += `  <examples>\n${indent(escapeXML(data.examples), 4)}\n  </examples>\n\n`;
  }

  if (data.languageEnabled && data.language && data.language.trim()) {
    xml += `  <language>\n${indent(escapeXML(data.language), 4)}\n  </language>\n\n`;
  }

  xml += `  <response_format>\n${indent(escapeXML(data.responseFormat), 4)}\n  </response_format>\n`;
  xml += `</prompt>`;

  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Add indentation to multiline strings
 */
function indent(str: string, spaces: number): string {
  const indentation = " ".repeat(spaces);
  return str
    .split("\n")
    .map((line) => (line.trim() ? indentation + line : line))
    .join("\n");
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Download text as file
 */
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
