/**
 * Time Parsing, Normalization and Progress Math Utilities
 * Rock-solid validation against malformed, single-digit, or out-of-bounds time strings.
 */

export interface ParsedTimeRange {
  startMin: number;
  endMin: number;
  normalized: string;
  isValid: boolean;
}

export interface LessonProgressResult {
  status: 'upcoming' | 'ongoing' | 'completed';
  progressPercent: number; // 0 - 100
  minutesRemaining: number;
}

/**
 * Normalizes and validates any time range input.
 * Supports:
 * - "8:30 - 9:50" -> "08:30 - 09:50"
 * - "08:30-09:50" -> "08:30 - 09:50"
 * - "08:30 — 09:50" (em-dash / en-dash) -> "08:30 - 09:50"
 *
 * Rejects:
 * - "25:99 - 10:00" (invalid hours/minutes)
 * - "14:00 - 13:00" (end time before or equal to start time)
 * - "invalid" (unparseable)
 */
export function normalizeTimeRange(raw: string | undefined | null): string | null {
  if (!raw || typeof raw !== 'string') return null;

  const cleaned = raw.trim();
  // Match any dash variant: hyphen, en-dash, em-dash, minus sign
  const parts = cleaned.split(/[\-\u2013\u2014\u2212]+/);
  if (parts.length !== 2) return null;

  const parsePart = (str: string): { h: number; m: number } | null => {
    const trimmed = str.trim();
    const timeMatch = /^(\d{1,2})\s*[:\.]\s*(\d{1,2})$/.exec(trimmed);
    if (!timeMatch) return null;

    const h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      return null;
    }
    return { h, m };
  };

  const start = parsePart(parts[0]);
  const end = parsePart(parts[1]);

  if (!start || !end) return null;

  const startMin = start.h * 60 + start.m;
  const endMin = end.h * 60 + end.m;

  // End time must be strictly after start time
  if (endMin <= startMin) return null;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(start.h)}:${pad(start.m)} - ${pad(end.h)}:${pad(end.m)}`;
}

/**
 * Parses time range into start and end minutes from midnight.
 */
export function parseTimeRange(raw: string | undefined | null): ParsedTimeRange {
  const normalized = normalizeTimeRange(raw);
  if (!normalized) {
    return {
      startMin: 0,
      endMin: 0,
      normalized: raw || '',
      isValid: false,
    };
  }

  const [startStr, endStr] = normalized.split(' - ');
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);

  return {
    startMin: sh * 60 + sm,
    endMin: eh * 60 + em,
    normalized,
    isValid: true,
  };
}

/**
 * Computes live lesson status, percentage, and remaining minutes.
 * Guarantees zero NaN, bounded 0-100 progress.
 */
export function calculateLessonProgress(
  timeRange: string | undefined | null,
  currentMinutes: number
): LessonProgressResult {
  const parsed = parseTimeRange(timeRange);

  if (!parsed.isValid) {
    return {
      status: 'upcoming',
      progressPercent: 0,
      minutesRemaining: 0,
    };
  }

  const { startMin, endMin } = parsed;

  if (currentMinutes < startMin) {
    return {
      status: 'upcoming',
      progressPercent: 0,
      minutesRemaining: 0,
    };
  }

  if (currentMinutes >= startMin && currentMinutes <= endMin) {
    const totalDuration = endMin - startMin;
    const elapsed = currentMinutes - startMin;
    const rawPercent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
    const progressPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));
    const minutesRemaining = Math.max(0, endMin - currentMinutes);

    return {
      status: 'ongoing',
      progressPercent,
      minutesRemaining,
    };
  }

  return {
    status: 'completed',
    progressPercent: 100,
    minutesRemaining: 0,
  };
}
