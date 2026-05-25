# Sample Report Generator

Day 4 adds the first Markdown report generator for Canton AppOps Toolkit.

The report generator turns a privacy-safe AppOps metrics snapshot into a weekly Markdown report that can be reviewed locally or shared as early grant/pilot evidence. The prototype only supports explicit sample mode so nobody mistakes fixture output for real Canton usage.

## Prototype command

```bash
canton-appops report --sample
```

This writes:

```text
.canton-appops/reports/sample-appops-report.md
```

For scripting or CI inspection:

```bash
canton-appops report --sample --stdout
```

## Deterministic fixture

A deterministic sample report is checked in at:

```text
samples/sample-appops-report.md
```

It is generated from:

```text
samples/sample-appops-metrics.json
```

## Report sections

The current Markdown report includes:

1. report context: app, environment, network, period, generated timestamp, source;
2. executive summary: workflow totals, traffic estimate, success rate, reward-readiness status;
3. activity: unique templates, choices, top templates, top choices;
4. traffic and operations: command/transaction counters, latency, errors, warnings;
5. reward-readiness signals and caveats;
6. privacy guarantees;
7. sharing guidance.

## Privacy and safety invariants

The renderer validates the metrics snapshot before rendering. It refuses snapshots that violate the prototype privacy defaults, including snapshots that include raw payloads.

The default report is designed to avoid:

- raw Canton transaction payloads;
- raw contract IDs;
- raw party IDs;
- customer names;
- counterparty names;
- secrets or validator credentials.

The report may include template and choice names because they are useful for app-provider reporting, but future real adapters should support allowlists, hashing, or redaction before public export.

## Reward-readiness scope

Reward-readiness is descriptive reporting only. It is not reward farming, reward prediction, or a guarantee of Canton Coin rewards.

Sample output must always be treated as format evidence, not evidence of real network usage.

## Day 4 acceptance criteria

- `canton-appops report --sample` generates a Markdown report.
- `canton-appops report --sample --stdout` prints the report without writing a file.
- Report rendering has library-level tests.
- CLI behavior has tests for file output, stdout mode, and non-sample refusal.
- Report output documents sample-only caveats and privacy guarantees.
- The renderer refuses unsafe snapshots that include raw payloads.
