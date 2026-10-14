/** A deterministic tool-simulation engine. It performs no network or external side effects. */
export const VERSION = '1.0.0';
export const TOOLS = Object.freeze({
  retrieve_docs: {label: 'Retrieve knowledge', effect: 'read'},
  lookup_availability: {label: 'Check availability', effect: 'read'},
  create_booking: {label: 'Create a booking', effect: 'write'},
  send_message: {label: 'Send a message', effect: 'write'},
  escalate_human: {label: 'Hand off to a person', effect: 'write'},
  issue_refund: {label: 'Issue a refund', effect: 'write'},
  delete_record: {label: 'Delete a record', effect: 'write'},
});
export const DEFAULT_POLICY = Object.freeze({budgetMicros: 50000, maxRetries: 2, requireApproval: true, deduplicate: true, allowedTools: Object.keys(TOOLS).filter(t => t !== 'delete_record')});
const OUTCOMES = new Set(['ok', 'timeout', 'rate_limited', 'error', 'unknown']);
const TRANSIENT = new Set(['timeout', 'rate_limited']);
const SUCCESS = new Set(['succeeded', 'deduplicated']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const text = (value, max) => typeof value === 'string' && value.length > 0 && value.length <= max;
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
function fail(message) { throw new Error(message); }
function validateArgs(value, depth = 0) {
  if (depth > 5) fail('Arguments may be nested at most five levels.');
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (typeof value === 'string' && value.length <= 2000) return;
  if (Array.isArray(value) && value.length <= 30) { value.forEach(v => validateArgs(v, depth + 1)); return; }
  if (plain(value) && Object.keys(value).length <= 30) {
    for (const [key, item] of Object.entries(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key) || key.length > 100) fail('Unsupported argument key.');
      validateArgs(item, depth + 1);
    }
    return;
  }
  fail('Arguments must contain bounded JSON values.');
}
export function validateScenario(input) {
  if (!plain(input) || input.version !== 1) fail('Expected a scenario object with version: 1.');
  if (!text(input.id, 80) || !text(input.title, 120)) fail('A scenario needs an id (80 characters max) and title (120 max).');
  if (input.description !== undefined && (typeof input.description !== 'string' || input.description.length > 1200)) fail('Description must be at most 1200 characters.');
  if (!Array.isArray(input.events) || input.events.length < 1 || input.events.length > 200) fail('A scenario needs between 1 and 200 events.');
  const seen = new Set();
  const events = input.events.map((event, index) => {
    const prefix = `Event ${index + 1}: `;
    if (!plain(event) || !text(event.id, 80) || seen.has(event.id)) fail(prefix + 'id must be unique and non-empty.');
    if (!Object.hasOwn(TOOLS, event.tool)) fail(prefix + 'unknown tool. Use a tool from the documented registry.');
    if (!text(event.label, 160)) fail(prefix + 'label is required (160 characters max).');
    if (!integer(event.costMicros, 0, 1000000)) fail(prefix + 'costMicros must be an integer from 0 to 1000000.');
    if (!integer(event.latencyMs, 0, 60000)) fail(prefix + 'latencyMs must be an integer from 0 to 60000.');
    if (!Array.isArray(event.outcomes) || event.outcomes.length < 1 || event.outcomes.length > 6 || event.outcomes.some(o => !OUTCOMES.has(o))) fail(prefix + 'outcomes must contain 1–6 known result codes.');
    if (event.approved !== undefined && typeof event.approved !== 'boolean') fail(prefix + 'approved must be true or false, not a string.');
    if (event.operationId !== undefined && !text(event.operationId, 100)) fail(prefix + 'operationId must be a non-empty string.');
    const dependencies = event.dependsOn ?? [];
    if (!Array.isArray(dependencies) || dependencies.length > 20 || dependencies.some(id => !seen.has(id))) fail(prefix + 'dependsOn may reference earlier events only.');
    const args = event.args ?? {};
    if (!plain(args)) fail(prefix + 'args must be an object.');
    validateArgs(args);
    seen.add(event.id);
    return {id: event.id, label: event.label, tool: event.tool, operationId: event.operationId, approved: event.approved === true, costMicros: event.costMicros, latencyMs: event.latencyMs, outcomes: [...event.outcomes], dependsOn: [...dependencies], args: structuredClone(args)};
  });
  return {version: 1, id: input.id, title: input.title, description: input.description || '', events};
}
export function validatePolicy(input) {
  if (!plain(input)) fail('Policy must be an object.');
  if (!integer(input.budgetMicros, 0, 2000000000)) fail('Budget must be a non-negative integer in microdollars.');
  if (!integer(input.maxRetries, 0, 5)) fail('Retries must be an integer between 0 and 5.');
  if (typeof input.requireApproval !== 'boolean' || typeof input.deduplicate !== 'boolean') fail('Policy toggles must be boolean values.');
  if (!Array.isArray(input.allowedTools) || input.allowedTools.some(t => !Object.hasOwn(TOOLS, t))) fail('The tool allowlist contains an unknown tool.');
  return {...input, allowedTools: [...new Set(input.allowedTools)]};
}
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (plain(value)) return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function simulate(rawScenario, rawPolicy = DEFAULT_POLICY) {
  const scenario = validateScenario(rawScenario), policy = validatePolicy(rawPolicy);
  const ledger = new Map(), writes = new Map(), results = new Map(), rows = [];
  let costMicros = 0, durationMs = 0, unsafeWrites = 0, disallowedExecutions = 0, duplicateWrites = 0;
  for (const event of scenario.events) {
    const write = TOOLS[event.tool].effect === 'write';
    const key = event.operationId ? event.tool + ':' + event.operationId : null;
    const signature = canonical(event.args);
    const row = {...event, status: 'pending', reason: '', code: '', attempts: [], startMs: durationMs, endMs: durationMs, spentMicros: 0};
    const finish = (status, code, reason) => { row.status = status; row.code = code; row.reason = reason; row.endMs = durationMs; rows.push(row); results.set(row.id, row); };
    if (event.dependsOn.some(id => !SUCCESS.has(results.get(id).status))) { finish('skipped', 'dependency', 'A prerequisite did not succeed. Downstream work was not attempted.'); continue; }
    if (!policy.allowedTools.includes(event.tool)) { finish('blocked', 'tool_denied', 'This tool is outside the configured allowlist.'); continue; }
    if (write && policy.requireApproval && !event.approved) { finish('blocked', 'approval', 'A write requires approval recorded in this test fixture.'); continue; }
    if (write && policy.deduplicate && !key) { finish('blocked', 'missing_key', 'A write needs an operationId for deduplication.'); continue; }
    if (write && policy.deduplicate && ledger.has(key)) {
      const previous = ledger.get(key);
      if (previous.signature !== signature) finish('blocked', 'key_conflict', 'The same operationId was reused with different arguments.');
      else if (previous.uncertain) finish('uncertain', 'reconcile', 'An earlier write has an unknown result. Reconcile it before trying again.');
      else finish('deduplicated', 'cached', 'A successful write with the same operationId and arguments already exists. No extra attempt or cost.');
      continue;
    }
    let settled = false;
    for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
      if (costMicros + event.costMicros > policy.budgetMicros) { finish('blocked', 'budget', 'The next attempt would exceed the remaining simulated budget.'); settled = true; break; }
      const outcome = event.outcomes[Math.min(attempt, event.outcomes.length - 1)];
      const backoffMs = attempt > 0 ? Math.min(4000, 250 * 2 ** (attempt - 1)) : 0;
      durationMs += backoffMs + event.latencyMs;
      costMicros += event.costMicros; row.spentMicros += event.costMicros;
      row.attempts.push({number: attempt + 1, outcome, costMicros: event.costMicros, latencyMs: event.latencyMs, backoffMs});
      if (outcome === 'ok') {
        if (write) {
          if (!event.approved) unsafeWrites++;
          if (!DEFAULT_POLICY.allowedTools.includes(event.tool)) disallowedExecutions++;
          if (key && writes.has(key)) duplicateWrites++;
          if (key) { writes.set(key, true); ledger.set(key, {signature, uncertain: false}); }
        }
        finish('succeeded', 'ok', attempt ? 'Recovered after a transient failure; the simulated action completed.' : 'The simulated action completed.'); settled = true; break;
      }
      if (outcome === 'unknown' && write) {
        if (key) ledger.set(key, {signature, uncertain: true});
        finish('uncertain', 'unknown_write', 'The write may have completed. Automatic retry is stopped; reconcile with the destination.'); settled = true; break;
      }
      if (!TRANSIENT.has(outcome)) { finish('failed', 'permanent', 'This outcome is not retryable under the simulator contract.'); settled = true; break; }
    }
    if (!settled) finish('failed', 'retry_exhausted', 'The transient failure persisted after the permitted attempts.');
  }
  const count = status => rows.filter(row => row.status === status).length;
  const assertions = [
    {id: 'duplicates', label: 'No duplicate writes', passed: duplicateWrites === 0, actual: duplicateWrites, detail: 'Counts repeat successful writes with the same tool and operationId.'},
    {id: 'approval', label: 'All successful writes approved', passed: unsafeWrites === 0, actual: unsafeWrites, detail: 'Uses approval markers in the fixture, not a live authorization service.'},
    {id: 'budget', label: 'Within simulated budget', passed: costMicros <= policy.budgetMicros, actual: costMicros, detail: 'Every attempted call, including failed attempts, is charged its fixture cost.'},
    {id: 'destructive', label: 'No destructive tool succeeded', passed: disallowedExecutions === 0, actual: disallowedExecutions, detail: 'A fixed benchmark: delete_record is destructive, even if the policy allows it.'},
  ];
  return {engineVersion: VERSION, scenario: {id: scenario.id, title: scenario.title, description: scenario.description}, policy, rows, assertions, summary: {events: rows.length, attempts: rows.reduce((n, r) => n + r.attempts.length, 0), costMicros, durationMs, succeeded: count('succeeded'), blocked: count('blocked'), deduplicated: count('deduplicated'), failed: count('failed'), uncertain: count('uncertain'), skipped: count('skipped'), duplicateWrites, unsafeWrites, passed: assertions.filter(a => a.passed).length}};
}
/** Baseline keeps identical budget and retry limits; only write/tool gates are removed. */
export function compare(scenario, policy = DEFAULT_POLICY) {
  const guarded = simulate(scenario, policy);
  const baseline = simulate(scenario, {...validatePolicy(policy), requireApproval: false, deduplicate: false, allowedTools: Object.keys(TOOLS)});
  return {guarded, baseline, costDeltaMicros: baseline.summary.costMicros - guarded.summary.costMicros};
}
export function exportRun(run, omitArguments = true) {
  const copy = structuredClone(run);
  if (omitArguments) copy.rows.forEach(row => { row.args = {notice: 'Arguments omitted from export'}; });
  return copy;
}
export function parseScenarioJSON(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 256000) fail('The JSON must be smaller than 256 KB.');
  let value;
  try { value = JSON.parse(raw); } catch { fail('Invalid JSON. Check commas, quotes, and brackets.'); }
  return validateScenario(value);
}
