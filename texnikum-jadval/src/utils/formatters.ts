/**
 * JSHSHIR Sanitization, Validation and Privacy Masking Utilities
 */

export interface BulkJshshirParseResult {
  validUnique: string[];
  duplicatesInInputCount: number;
  invalidTokensCount: number;
  totalTokensCount: number;
}

/**
 * Validates strict 14-digit numeric JSHSHIR
 */
export function isValidJshshir(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false;
  const cleaned = value.trim();
  return cleaned.length === 14 && /^\d{14}$/.test(cleaned);
}

/**
 * Sanitizes input to numeric characters only, max 14
 */
export function sanitizeJshshirInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 14);
}

/**
 * Masks sensitive JSHSHIR digits for non-essential views.
 * Example: "12345678901234" -> "1234••••••1234"
 */
export function maskJshshir(jshshir: string | undefined | null): string {
  if (!jshshir || typeof jshshir !== 'string') return '••••••••••••••';
  const cleaned = jshshir.trim();
  if (cleaned.length < 8) return cleaned;
  return `${cleaned.slice(0, 4)}••••••${cleaned.slice(-4)}`;
}

/**
 * Pretty-formats 14-digit JSHSHIR with spacing for readability:
 * "12345678901234" -> "1234 5678 901234"
 */
export function formatJshshir(jshshir: string | undefined | null): string {
  if (!jshshir || typeof jshshir !== 'string') return '';
  const cleaned = jshshir.replace(/\D/g, '');
  if (cleaned.length !== 14) return cleaned;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 14)}`;
}

/**
 * Parses raw text from bulk input, separating by any whitespace or punctuation delimiters.
 * Accurately tracks valid unique items, intra-input duplicates, and malformed tokens.
 */
export function parseBulkJshshirText(rawText: string | undefined | null): BulkJshshirParseResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      validUnique: [],
      duplicatesInInputCount: 0,
      invalidTokensCount: 0,
      totalTokensCount: 0,
    };
  }

  // Split on newlines, spaces, tabs, commas, semicolons
  const rawTokens = rawText
    .split(/[\s,;\n\r\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const seen = new Set<string>();
  const validUnique: string[] = [];
  let duplicatesInInputCount = 0;
  let invalidTokensCount = 0;

  for (const token of rawTokens) {
    const digitsOnly = token.replace(/\D/g, '');
    // Check if token was exactly a 14-digit number
    if (digitsOnly.length === 14 && token.replace(/[\s\-_]/g, '').length === 14) {
      if (seen.has(digitsOnly)) {
        duplicatesInInputCount++;
      } else {
        seen.add(digitsOnly);
        validUnique.push(digitsOnly);
      }
    } else {
      invalidTokensCount++;
    }
  }

  return {
    validUnique,
    duplicatesInInputCount,
    invalidTokensCount,
    totalTokensCount: rawTokens.length,
  };
}
