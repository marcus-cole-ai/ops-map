export function parseChecklistText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/u, '').trim())
    .filter((line) => line.length > 0)
}
