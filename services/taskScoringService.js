/**
 * Task Scoring Service
 *
 * Provides helper utilities to:
 * - Normalize qualitative levels (Low/Medium/High)
 * - Auto-evaluate tasks with lightweight AI heuristics
 * - Calculate raw score, mana cost, and energy zones
 */

const CRITERIA = [
  { key: 'focusLevel', weight: 3 },
  { key: 'mentalLoad', weight: 3 },
  { key: 'urgency', weight: 2 },
  { key: 'movement', weight: 1 }
];

const LEVEL_POINTS = {
  low: 1,
  medium: 2,
  high: 3
};

const MAX_RAW_SCORE = CRITERIA.reduce(
  (acc, criterion) => acc + LEVEL_POINTS.high * criterion.weight,
  0
); // 27 with current weights

const ENERGY_ZONES = [
  { name: 'Peak', min: 70 },
  { name: 'Balance', min: 40 },
  { name: 'Low', min: 0 }
];

const WORK_TAGS = {
  DEEP_WORK: 'deep_work',
  ADMIN: 'admin',
  COMMUNICATING: 'communicating',
  LEARNING: 'learning'
};

const WORK_TAG_KEYWORDS = {
  [WORK_TAGS.DEEP_WORK]:
    /\bdeep work\b|\bwriting\b|\bcode\b|\bcoding\b|\bdebug\b|\bdesign\b|\banalysis\b|\barchitect\b|\bprototype\b/,
  [WORK_TAGS.ADMIN]:
    /\bemail\b|\binbox\b|\bschedule\b|\bcalendar\b|\badministrative\b|\badmin\b|\bform\b|\bexpense\b|\btask list\b/,
  [WORK_TAGS.COMMUNICATING]:
    /\bmeeting\b|\bmeet\b|\bcall\b|\b1-?on-?1\b|\b1on1\b|\bsync\b|\binterview\b|\bpresentation\b/,
  [WORK_TAGS.LEARNING]:
    /\blearn\b|\blearning\b|\bread\b|\breading\b|\bcourse\b|\btraining\b|\bwebinar\b|\bresearch\b|\bstudy\b/
};

/**
 * Convert value to standardized level string.
 * Accepts strings (case-insensitive) or numbers (1-3).
 */
function normalizeLevel(value, fallback = 'medium') {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'number') {
    const map = { 1: 'low', 2: 'medium', 3: 'high' };
    const normalized = map[value];
    if (!normalized) {
      throw new Error(`Invalid numeric level ${value}`);
    }
    return normalized;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!LEVEL_POINTS[normalized]) {
      throw new Error(`Invalid level ${value}`);
    }
    return normalized;
  }

  throw new Error(`Unsupported level type ${typeof value}`);
}

function normalizeTag(value) {
  if (!value) return null;
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const entries = Object.values(WORK_TAGS);
  if (entries.includes(normalized)) {
    return normalized;
  }
  throw new Error(`Invalid tag ${value}. Expected one of ${entries.join(', ')}`);
}

function inferTagFromDescription(description = '') {
  const text = description.toLowerCase();
  if (WORK_TAG_KEYWORDS[WORK_TAGS.DEEP_WORK].test(text)) return WORK_TAGS.DEEP_WORK;
  if (WORK_TAG_KEYWORDS[WORK_TAGS.COMMUNICATING].test(text)) return WORK_TAGS.COMMUNICATING;
  if (WORK_TAG_KEYWORDS[WORK_TAGS.LEARNING].test(text)) return WORK_TAGS.LEARNING;
  if (WORK_TAG_KEYWORDS[WORK_TAGS.ADMIN].test(text)) return WORK_TAGS.ADMIN;
  return WORK_TAGS.ADMIN;
}

function classifyTaskTag({ description, providedTag, allowAi = true }) {
  if (providedTag) {
    return {
      tag: normalizeTag(providedTag),
      source: 'manual'
    };
  }

  if (!allowAi) {
    throw new Error('Task tag is required when AI tagging is disabled.');
  }

  return {
    tag: inferTagFromDescription(description),
    source: 'ai'
  };
}

/**
 * Lightweight heuristic to guess task levels.
 * Acts as a stand-in for an AI model. The heuristic looks
 * for keywords in the task description.
 */
function inferLevelsFromDescription(description = '') {
  const text = description.toLowerCase();

  const heuristics = {
    focusLevel: 'medium',
    mentalLoad: 'medium',
    movement: 'low',
    urgency: 'medium'
  };

  // Focus heuristics
  if (/\bdeep work\b|\bstrategy\b|\bdesign\b|\bwrite\b|\bresearch\b|\bdebug\b/.test(text)) {
    heuristics.focusLevel = 'high';
  } else if (/\bemail\b|\bcleanup\b|\bhabit\b|\bscroll\b|\badmin\b|\bbacklog\b/.test(text)) {
    heuristics.focusLevel = 'low';
  }

  // Mental load heuristics
  if (/\barchitecture\b|\bfinancial\b|\bplanning\b|\bproposal\b|\bpresentation\b/.test(text)) {
    heuristics.mentalLoad = 'high';
  } else if (/\brefill\b|\bchores\b|\bmaintenance\b|\bwater\b|\bgrocery\b/.test(text)) {
    heuristics.mentalLoad = 'low';
  }

  // Movement heuristics
  if (/\bgym\b|\brun\b|\bwalk\b|\bcommute\b|\btravel\b|\bmeeting\b|\bshoot\b|\berrand\b/.test(text)) {
    heuristics.movement = 'high';
  } else if (/\bsetup\b|\brecord\b|\bdeliver\b|\bvisit\b/.test(text)) {
    heuristics.movement = 'medium';
  }

  // Urgency heuristics
  if (/\burgent\b|\basap\b|\bdeadline\b|\bdue\b|\bsubmit\b|\btoday\b|\bcall\b/.test(text)) {
    heuristics.urgency = 'high';
  } else if (/\bidea\b|\bdraft\b|\bexplore\b|\bsomeday\b/.test(text)) {
    heuristics.urgency = 'low';
  }

  return heuristics;
}

/**
 * Calculate weighted raw score, mana cost, and energy zone.
 */
function calculateScores(levels) {
  const rawScore = CRITERIA.reduce((acc, criterion) => {
    const level = levels[criterion.key];
    return acc + (LEVEL_POINTS[level] || LEVEL_POINTS.medium) * criterion.weight;
  }, 0);

  const manaCost = Math.round((rawScore / MAX_RAW_SCORE) * 100);
  const energyZone = ENERGY_ZONES.find(zone => manaCost >= zone.min)?.name || 'Low';

  return { rawScore, manaCost, energyZone };
}

/**
 * Main scoring function used by controllers.
 */
function scoreTask({
  description,
  providedLevels = {},
  allowAi = true
}) {
  if (!description) {
    throw new Error('Task description is required for scoring.');
  }

  const aiSuggestion = allowAi ? inferLevelsFromDescription(description) : null;

  const normalizedLevels = {};
  const autoFilled = {};

  for (const criterion of CRITERIA) {
    const value = providedLevels[criterion.key];
    if (value !== undefined && value !== null) {
      normalizedLevels[criterion.key] = normalizeLevel(value);
      autoFilled[criterion.key] = false;
      continue;
    }

    if (!aiSuggestion) {
      throw new Error(
        `Missing ${criterion.key} and AI scoring is disabled. Provide a value or enable AI scoring.`
      );
    }

    normalizedLevels[criterion.key] = aiSuggestion[criterion.key];
    autoFilled[criterion.key] = true;
  }

  const scores = calculateScores(normalizedLevels);

  return {
    ...scores,
    normalizedLevels,
    meta: {
      autoFilled,
      aiUsed: Object.values(autoFilled).some(Boolean),
      evaluatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  scoreTask,
  calculateScores,
  normalizeLevel,
  inferLevelsFromDescription,
  classifyTaskTag,
  inferTagFromDescription,
  normalizeTag,
  constants: {
    CRITERIA,
    LEVEL_POINTS,
    MAX_RAW_SCORE,
    ENERGY_ZONES,
    WORK_TAGS
  }
};

