# Agent Reliability Lab

A local-first workbench for reproducible tool-agent reliability experiments, by Henrri Alessandro Gaytán Cardenas.

**[Open the live workbench](https://alessandrogayttan.github.io/agent-lab/)** · [Portfolio case study](https://alessandrogayttan.github.io/case-agent-lab.html)

## What it does

Six synthetic scenarios exercise duplicate webhook deliveries, transient outages, permissions, cost overruns, ambiguous writes and an Alessia appointment workflow. Change a policy, inspect each attempt and compare against a baseline with the same budget and retry count but without write approval, deduplication or tool restrictions. Import your own scenario JSON, export a JSON or standalone HTML report, and save up to six argument-redacted reports in browser storage.

This is a deterministic simulator, not an LLM judge, production gateway, security certification or live WhatsApp connection. It never executes tools or sends messages. Passing invariants does not imply task completion: a run can pass all safety checks while blocking every action. Costs and latency come from fixtures; no model tokens or real billing are measured. Imports are counterfactual replays, not verification of remote side effects. Browser code runs locally; typography may be fetched from Google Fonts.

## Run and test

Serve the repository root using any static HTTP server and open `/agent-lab/`. Node 20+ is sufficient for the engine and CLI; no package installation is needed.

```sh
cd agent-lab
node --test tests/*.test.mjs
node cli.mjs duplicate-delivery report.html
node cli.mjs my-scenario.json report.json
```

CLI exits 0 when all four invariants pass, 1 for failed invariants, 2 for invalid input or I/O errors. Operational failure and safety failure are separate; inspect the report. The CLI uses the default policy. Programmatic callers can pass a policy to `simulate` or `compare`.

## Scenario contract

Download a scenario from the app for a complete example. Version 1 requires `id`, `title`, and 1–200 events. Each event requires a unique `id`, known `tool`, `label`, integer `costMicros` (USD millionths per attempt), integer `latencyMs`, and 1–6 `outcomes`. Optional fields: `args`, boolean `approved`, `operationId`, and `dependsOn` (earlier event IDs only). JSON imports are bounded to 256 KB. Argument nesting, key and value sizes are bounded. Arbitrary tool names, executable code and prototype keys are rejected.

Outcomes: `ok`, `timeout`, `rate_limited`, `error`, `unknown`. `timeout` and `rate_limited` mean a **known non-completion** eligible for retry. A network timeout after a write may have committed: represent it as `unknown`, never as a retryable timeout. The Alessia adapter conservatively converts write timeouts to `unknown`. Outcome sequences repeat their final value if more attempts are available. This fixed sequence makes replays reproducible, not probabilistic forecasts.

The engine evaluates dependencies, tool permissions, approval and deduplication before attempts. Successful writes are cached by tool plus operation ID and canonical arguments. Reuse with different arguments is blocked. Unknown writes stop immediately and quarantine matching subsequent writes until external reconciliation; this simulator does not perform reconciliation. Permanent failures are not retried. Every attempt consumes its fixture cost, and budget is checked before it starts. Retry delays use bounded exponential backoff. Duration is a serial virtual timeline, not wall-clock performance. Ledgers are per run; they are not durable or distributed idempotency stores.

Four fixed assertions detect repeated successful keyed writes, successful unapproved writes, budget overspend and successful `delete_record` calls. Missing operation IDs cannot establish duplicate identity when deduplication is off; the assertion does not infer semantic duplicates.

## Alessia trace adapter

`alessia-adapter.mjs` exposes `fromAlessiaTrace(calls)`. Its explicit mapping references the public [Alessia tools](https://github.com/alessandrogayttan/alessia-whatsapp/blob/main/tools.py); it does not modify or import production code. Unsupported tools are rejected.

```js
import {fromAlessiaTrace} from './alessia-adapter.mjs';
import {simulate} from './engine.mjs';
const scenario = fromAlessiaTrace([{
  name: 'agendar_cita', operationId: 'synthetic-operation-1',
  args: {slot: 'synthetic-slot'}, approved: true,
  costMicros: 1000, latencyMs: 200, outcomes: ['timeout']
}]);
const report = simulate(scenario); // unknown write; no blind retry
```

This normalized contract requires observed outcomes and explicit cost estimates. It does not parse arbitrary production log formats or prove that the real assistant enforces these policies. To integrate production safely, instrument a staging tool wrapper, redact patient data, map observations to this contract, and verify outcomes against the destination before replaying uncertain writes. Approval flags in fixtures are test inputs, not an authorization mechanism.

## Structure and privacy

`engine.mjs` is a pure simulation core shared by browser and CLI. `scenarios.mjs` holds reproducible cases; `app.mjs` renders with DOM text APIs; `report.mjs` escapes HTML exports; `tests/` covers the invariants and edge cases. No backend, secrets, telemetry, account or deployment service is required.

The app retains reports only when Save locally is selected, using this origin's localStorage. Arguments are omitted from saved/exported reports by default, but labels/descriptions remain and can contain sensitive data. Downloaded scenario JSON includes its arguments. Do not import patient data or credentials. Clear saved runs removes this app's saved reports. GitHub Pages serves the static assets; no service worker caches private imports.

## Next milestones

Actual staging-agent execution, durable per-tenant idempotency storage, provider billing measurements, authenticated approvals, isolated worker jobs and production trace ingestion are future work. The published app makes no claim that these services exist.
