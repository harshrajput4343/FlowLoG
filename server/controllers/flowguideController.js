/**
 * FlowGuide AI Controller
 *
 * Translates natural-language questions into safe, user-scoped Prisma
 * read-only queries via the Groq API (OpenAI-compatible format).
 *
 * Security layers:
 *   1. Auth middleware (JWT) – req.userId is always set
 *   2. Operation whitelist – only read methods allowed
 *   3. userId injection – every query forced to filter by owner
 *   4. Result cap – findMany limited to 100 rows
 *   5. Include depth – max 2 levels of relation nesting
 *   6. JSON parse safety – try/catch with regex fallback
 */

const prisma = require('../prismaClient');

// ── Config ──────────────────────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || (process.env.GROQ_API_KEY && (process.env.GROQ_API_KEY.startsWith('AQ.') || process.env.GROQ_API_KEY.startsWith('AIza')) ? process.env.GROQ_API_KEY : null);
const GROQ_API_KEY = !GEMINI_API_KEY ? process.env.GROQ_API_KEY : null;

const MODEL = process.env.GROQ_MODEL || process.env.GEMINI_MODEL || (GEMINI_API_KEY ? 'models/gemma-4-26b-a4b-it' : 'gemma2-9b-it');

const FALLBACK_ANSWER =
  "I couldn't process that. Try asking about your boards, lists, or cards.";

// ── Allowed operations (read-only) ──────────────────────────────────────
const ALLOWED_OPS = new Set([
  'board.findMany',   'board.findFirst',   'board.count',
  'list.findMany',    'list.findFirst',    'list.count',
  'card.findMany',    'card.findFirst',    'card.count',    'card.aggregate',
  'label.findMany',   'label.findFirst',   'label.count',
  'cardLabel.findMany','cardLabel.count',
  'checklist.findMany','checklist.findFirst','checklist.count',
  'checklistItem.findMany','checklistItem.findFirst','checklistItem.count',
  'boardMember.findMany','boardMember.count',
  'cardMember.findMany','cardMember.count',
]);

// ── User-scope injection map ────────────────────────────────────────────
// Each model maps to the nested path that reaches Board.ownerId
const SCOPE_PATHS = {
  board:         (uid) => ({ ownerId: uid }),
  list:          (uid) => ({ board: { ownerId: uid } }),
  card:          (uid) => ({ list: { board: { ownerId: uid } } }),
  label:         (uid) => ({ board: { ownerId: uid } }),
  cardLabel:     (uid) => ({ card: { list: { board: { ownerId: uid } } } }),
  checklist:     (uid) => ({ card: { list: { board: { ownerId: uid } } } }),
  checklistItem: (uid) => ({ checklist: { card: { list: { board: { ownerId: uid } } } } }),
  boardMember:   (uid) => ({ board: { ownerId: uid } }),
  cardMember:    (uid) => ({ card: { list: { board: { ownerId: uid } } } }),
};

// ── System prompt ───────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are FlowGuide AI, a data assistant for the FlowLog Kanban app.
Your job: convert the user's natural-language question into a single Prisma query.

## Prisma Schema

model User {
  id Int @id, email String, name String?, isPremium Boolean
  ownedBoards Board[], boardMembers BoardMember[], cardMembers CardMember[]
}
model Board {
  id Int @id, title String, background String?, ownerId Int,
  createdAt DateTime, updatedAt DateTime
  lists List[], labels Label[], members BoardMember[]
}
model List {
  id Int @id, title String, order Int, boardId Int, color String?,
  createdAt DateTime, updatedAt DateTime
  cards Card[], board Board
}
model Card {
  id Int @id, title String, description String?, order Int,
  dueDate DateTime?, listId Int, createdAt DateTime, updatedAt DateTime
  list List, labels CardLabel[], members CardMember[], checklists Checklist[]
}
model Label {
  id Int @id, name String?, color String, boardId Int
  cards CardLabel[], board Board
}
model CardLabel { id Int @id, cardId Int, labelId Int, card Card, label Label }
model Checklist {
  id Int @id, title String, cardId Int
  card Card, items ChecklistItem[]
}
model ChecklistItem {
  id Int @id, content String, isChecked Boolean, checklistId Int
  checklist Checklist
}
model BoardMember { id Int @id, boardId Int, userId Int, board Board, user User }
model CardMember  { id Int @id, cardId Int, userId Int, card Card, user User }

## Allowed operations
findMany, findFirst, count, aggregate (card only)

## Rules — FOLLOW STRICTLY
1. Return ONLY a valid JSON object. No markdown, no code fences, no explanation.
2. Format: { "operation": "<model>.<method>", "args": { "where": {...}, "include": {...} } }
3. The "args" object is passed directly to Prisma. Use valid Prisma query syntax.
4. For "count", args should have "where" only (no "include").
5. For "aggregate", use _count, _avg, _sum, _min, _max fields.
6. NEVER use create, update, delete, upsert, createMany, updateMany, deleteMany.
7. Do NOT add userId/ownerId filters — the server adds them automatically.
8. Use "include" to join related data when the question needs it.
9. For "overdue cards", use: { "dueDate": { "lt": "NOW" } } — server replaces "NOW" with real date.
10. Keep queries simple. Prefer count over findMany when the user asks "how many".

## Examples

User: "How many boards do I have?"
{ "operation": "board.count", "args": { "where": {} } }

User: "Show me all overdue cards"
{ "operation": "card.findMany", "args": { "where": { "dueDate": { "lt": "NOW" } }, "include": { "list": { "include": { "board": true } } } } }

User: "Which list has the most cards?"
{ "operation": "list.findMany", "args": { "where": {}, "include": { "_count": { "select": { "cards": true } } } } }

User: "How many checklist items are incomplete?"
{ "operation": "checklistItem.count", "args": { "where": { "isChecked": false } } }`;

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Deep-merge source into target (mutates target).
 * Used to inject userId scope without overwriting LLM-generated filters.
 */
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Replace the sentinel string "NOW" with the current ISO date anywhere
 * in the args object (recursive).
 */
function replaceDateSentinels(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return obj === 'NOW' ? new Date().toISOString() : obj;
  }
  if (Array.isArray(obj)) return obj.map(replaceDateSentinels);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = replaceDateSentinels(v);
    }
    return out;
  }
  return obj;
}

/**
 * Sanitize the "include" object to prevent deeply-nested relation bombs.
 * Allows at most `maxDepth` levels.
 */
function sanitizeInclude(include, maxDepth = 2, current = 0) {
  if (!include || typeof include !== 'object' || current >= maxDepth) {
    return current >= maxDepth ? undefined : include;
  }
  const clean = {};
  for (const [key, val] of Object.entries(include)) {
    if (val === true || val === false) {
      clean[key] = val;
    } else if (typeof val === 'object' && val !== null) {
      const nested = { ...val };
      if (nested.include) {
        nested.include = sanitizeInclude(nested.include, maxDepth, current + 1);
        if (nested.include === undefined) delete nested.include;
      }
      clean[key] = nested;
    }
  }
  return clean;
}

/**
 * Try to extract JSON from LLM text that might include markdown fences.
 */
function extractJSON(text) {
  // First try direct parse
  try {
    return JSON.parse(text);
  } catch (_) {
    // ignore
  }

  // Try to extract from markdown code block
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (_) {
      // ignore
    }
  }

  // Try to find first { ... } block
  const braces = text.match(/\{[\s\S]*\}/);
  if (braces) {
    try {
      return JSON.parse(braces[0]);
    } catch (_) {
      // ignore
    }
  }

  return null;
}

/**
 * Call the selected LLM API (Google AI Studio/Gemini or Groq).
 */
async function callLLM(systemPrompt, userMessage) {
  if (GEMINI_API_KEY) {
    const modelName = MODEL.startsWith('models/') ? MODEL : `models/${MODEL}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Gemini API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      throw new Error('Unexpected Gemini API response structure');
    }

    return data.candidates[0].content.parts[0].text;
  } else if (GROQ_API_KEY) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Groq API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected Groq API response structure');
    }

    return data.choices[0].message.content;
  } else {
    throw new Error('Neither GEMINI_API_KEY nor GROQ_API_KEY is configured');
  }
}


// ── Main handler ────────────────────────────────────────────────────────

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    // ── Validate input ──────────────────────────────────────────────
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        answer: 'Please type a question about your boards, lists, or cards.',
        data: null,
      });
    }

    const userMessage = message.trim().substring(0, 500); // cap length

    // ── Step 1: Ask LLM to generate a Prisma query ──────────────────
    let llmRaw;
    try {
      llmRaw = await callLLM(SYSTEM_PROMPT, userMessage);
    } catch (err) {
      console.error('FlowGuide LLM call #1 failed:', err.message);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    // ── Step 2: Parse the JSON response ─────────────────────────────
    const parsed = extractJSON(llmRaw);
    if (!parsed || !parsed.operation || typeof parsed.operation !== 'string') {
      console.error('FlowGuide: could not parse LLM output:', llmRaw);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    const { operation, args: rawArgs } = parsed;

    // ── Step 3: Validate operation against whitelist ────────────────
    if (!ALLOWED_OPS.has(operation)) {
      console.warn('FlowGuide: blocked disallowed operation:', operation);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    const [model, method] = operation.split('.');

    // Verify the model actually exists on the Prisma client
    if (!prisma[model]) {
      console.warn('FlowGuide: unknown Prisma model:', model);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    if (typeof prisma[model][method] !== 'function') {
      console.warn('FlowGuide: invalid method on model:', operation);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    // ── Step 4: Build safe args ─────────────────────────────────────
    let args = rawArgs && typeof rawArgs === 'object' ? { ...rawArgs } : {};

    // Ensure where exists
    if (!args.where || typeof args.where !== 'object') {
      args.where = {};
    }

    // Replace "NOW" date sentinels
    args = replaceDateSentinels(args);

    // Inject userId scope
    const scopeFn = SCOPE_PATHS[model];
    if (scopeFn) {
      deepMerge(args.where, scopeFn(userId));
    } else {
      // Unknown model somehow passed whitelist – block it
      console.warn('FlowGuide: no scope path for model:', model);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    // Cap findMany results
    if (method === 'findMany' && !args.take) {
      args.take = 100;
    }

    // Sanitize include depth
    if (args.include) {
      args.include = sanitizeInclude(args.include, 2);
    }

    // Remove include for count (Prisma doesn't support it)
    if (method === 'count') {
      delete args.include;
      delete args.select;
      delete args.orderBy;
      delete args.take;
      delete args.skip;
    }

    // ── Step 5: Execute the Prisma query ────────────────────────────
    let data;
    try {
      data = await prisma[model][method](args);
    } catch (dbErr) {
      console.error('FlowGuide Prisma error:', dbErr.message);
      return res.json({ answer: FALLBACK_ANSWER, data: null });
    }

    // ── Step 6: Ask LLM to summarize the data ───────────────────────
    const summaryPrompt = `You are FlowGuide AI, a friendly assistant for the FlowLog Kanban app.
The user asked: "${userMessage}"
The database returned the following data (JSON):

${JSON.stringify(data, null, 2).substring(0, 3000)}

Write a concise, friendly answer in plain text (1-3 sentences). 
Use specific numbers from the data. 
If the data is empty or zero, say so helpfully.
Do NOT output JSON or code. Just the answer.`;

    let answer;
    try {
      answer = await callLLM(summaryPrompt, 'Please summarize the data above for the user.');
    } catch (err) {
      console.error('FlowGuide LLM call #2 failed:', err.message);
      // Still return the data with a generic answer
      answer = typeof data === 'number'
        ? `The count is ${data}.`
        : `Here's what I found — ${Array.isArray(data) ? data.length + ' result(s)' : 'see the data below'}.`;
    }

    return res.json({ answer, data });
  } catch (err) {
    console.error('FlowGuide unexpected error:', err);
    return res.json({ answer: FALLBACK_ANSWER, data: null });
  }
};

module.exports = { chat };
