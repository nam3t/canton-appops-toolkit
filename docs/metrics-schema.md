# AppOps Metrics Schema

This document defines the first privacy-preserving metrics envelope for Canton AppOps Toolkit.

The goal is not to mirror Canton ledger internals. The goal is to provide a small, stable reporting shape for app providers who need to explain activity, traffic context, operational health, and reward-readiness without leaking private transaction payloads.

Machine-readable draft schema: [`../schemas/appops-metrics.schema.json`](../schemas/appops-metrics.schema.json)

## Prototype command

```bash
canton-appops collect --sample
```

This writes:

```text
.canton-appops/metrics/sample-appops-metrics.json
```

For scripting:

```bash
canton-appops collect --sample --stdout
```

## Envelope

Top-level fields:

- `schema_version`: currently `1`.
- `generated_at`: when the snapshot was produced.
- `app`: app identity context.
- `period`: reporting window.
- `source`: data adapter metadata.
- `metrics`: aggregate activity, traffic, and operational counters.
- `privacy`: explicit privacy guarantees for the snapshot.
- `reward_readiness`: descriptive readiness signals and caveats.

## App context

```json
{
  "app": {
    "name": "example-canton-app",
    "environment": "local",
    "network": "localnet"
  }
}
```

These values are reporting labels, not sensitive party identifiers. The CLI reads them from `canton-appops.config.yaml` when present and falls back to the sample defaults.

## Period

```json
{
  "period": {
    "start": "2026-05-18T00:00:00.000Z",
    "end": "2026-05-25T00:00:00.000Z",
    "granularity": "weekly"
  }
}
```

The Phase 0 prototype focuses on weekly evidence reports because this aligns with grant, pilot, and Featured App review workflows.

## Metrics

### Activity

Activity metrics describe app-level workflow usage in aggregate:

- `total_workflows`
- `completed_workflows`
- `failed_workflows`
- `unique_templates_touched`
- `unique_choices_exercised`
- `top_templates`
- `top_choices`

Template and choice names are useful for app-provider reporting, but they may still reveal business logic. Future real adapters should support allowlists, hashing, and redaction before report export.

### Traffic

Traffic metrics estimate app operational load:

- `estimated_traffic_units`
- `command_submissions`
- `accepted_transactions`
- `rejected_transactions`
- `read_operations`
- `write_operations`

The sample collector uses static values. Real adapters must document how traffic units are estimated or sourced.

### Operations

Operational metrics describe health and reliability:

- `success_rate`
- `error_count`
- `warning_count`
- `p50_latency_ms`
- `p95_latency_ms`
- `last_success_at`

## Privacy rules

The default schema is intentionally conservative:

```json
{
  "privacy": {
    "mode": "local-only",
    "aggregate_only": true,
    "raw_payloads_included": false,
    "party_ids": "redacted",
    "contract_ids": "omitted",
    "counterparty_names": "omitted"
  }
}
```

Prototype invariants:

- no raw transaction payloads;
- no customer names;
- no counterparty names;
- no raw contract IDs;
- no raw party IDs;
- aggregate counters by default;
- explicit export mode required for any future remote upload.

## Reward-readiness scope

`reward_readiness` is descriptive reporting, not reward farming or reward prediction.

The sample output uses:

```json
{
  "status": "sample-only"
}
```

Future real adapters can add stronger evidence such as real activity windows, uptime, traffic usage, and report completeness, but the toolkit should avoid manufacturing artificial activity or promising rewards.

## Day 3 acceptance criteria

- A documented metrics envelope exists.
- A machine-readable JSON Schema draft exists.
- `canton-appops collect --sample` creates a sample metrics snapshot.
- `canton-appops collect --sample --stdout` prints the snapshot for scripts.
- Tests verify that sample output is aggregate-only and excludes raw payload fields.
