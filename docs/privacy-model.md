# Privacy Model

Canton AppOps Toolkit is designed around a simple rule:

> **Measure application operations without exposing private business data.**

The toolkit should help Canton app providers understand activity, traffic usage, operational health, and reward-readiness while respecting Canton's privacy-first architecture.

This document is a draft and will evolve as the collector, API adapters, and reporting workflow are implemented.

## Goals

The privacy model aims to:

- keep raw transaction payloads local by default;
- collect aggregate operational metrics instead of sensitive business data;
- make remote export explicitly opt-in;
- give app operators clear control over what is collected, stored, and shared;
- support useful reports without exposing customers, counterparties, or private contract details;
- provide safe defaults for solo builders, app teams, and validator operators.

## Non-goals

The toolkit is not intended to be:

- a data warehouse for private Canton transactions;
- a public explorer for private app state;
- a customer analytics platform;
- a compliance archive;
- a replacement for an app team's security, privacy, or legal review;
- a system that requires sending raw contract payloads to a hosted service.

## Default operating mode

The default mode should be:

```yaml
privacy:
  mode: aggregate_only
  local_only: true
  include_payloads: false
  hash_party_ids: true
  export_raw_events: false
```

Meaning:

- metrics are aggregated before reporting;
- data stays on the operator's machine or infrastructure;
- transaction payloads are not exported;
- party identifiers are hashed or redacted where possible;
- any remote export requires explicit configuration.

## Data categories

### 1. Safe-by-default aggregate metrics

These are the preferred metrics for the initial toolkit:

- transaction count by time window;
- create/exercise/archive counts;
- template-level counts;
- choice-level counts;
- workflow-level counts when configured by the app operator;
- collection timestamp and source metadata;
- traffic consumed/remaining where available;
- high-level error or failed collection counters;
- report completeness indicators.

Example:

```json
{
  "window": {
    "from": "2026-06-01T00:00:00Z",
    "to": "2026-06-08T00:00:00Z"
  },
  "activity": {
    "transactions": 1240,
    "creates": 820,
    "exercises": 390,
    "archives": 310
  },
  "templates": [
    { "name": "MyApp.Payment", "count": 410 },
    { "name": "MyApp.Settlement", "count": 180 }
  ]
}
```

### 2. Potentially sensitive metadata

These fields may be useful but should be handled carefully:

- party IDs;
- participant IDs;
- validator IDs;
- contract IDs;
- command IDs;
- workflow IDs;
- user-defined labels;
- template names if they reveal proprietary business logic;
- exact timestamps if they reveal customer behavior.

Default handling:

- hash, redact, bucket, or make these fields optional;
- document the risk clearly;
- require explicit configuration before including them in reports or exports.

### 3. Sensitive data not collected by default

The toolkit should not collect or export these by default:

- raw contract payloads;
- customer names;
- counterparty names;
- account identifiers;
- settlement instructions;
- asset positions;
- personally identifiable information;
- confidential business terms;
- raw logs containing secrets or credentials;
- API tokens, JWTs, private keys, or validator secrets.

If a future debugging mode needs raw data, it must be:

- local-only by default;
- clearly labeled as sensitive;
- disabled in report generation by default;
- never sent to a hosted service without explicit opt-in.

## Local-only first

The initial design should work fully without a hosted service:

- CLI runs locally;
- config lives locally;
- metrics are stored locally;
- dashboard can run locally;
- reports can be generated locally;
- the user decides what to share.

This matters because app teams may have strict privacy, security, or regulatory constraints.

## Optional remote export

Remote export may be useful later for a hosted dashboard, team collaboration, long-term retention, or managed alerts. It must remain optional.

If remote export is implemented, it should follow these rules:

1. Off by default.
2. Requires explicit endpoint and API key configuration.
3. Exports aggregate metrics unless the user explicitly changes the mode.
4. Logs what categories of data will be exported.
5. Provides a dry-run preview where possible.
6. Supports disabling export immediately.

Example future config:

```yaml
export:
  enabled: false
  endpoint: "https://api.example.com/ingest"
  api_key_env: "CANTON_APPOPS_API_KEY"
  include_payloads: false
```

## Identifier handling

Party, validator, participant, contract, and workflow identifiers can be sensitive depending on context.

Recommended handling:

- default to redaction or hashing;
- use a configurable salt for hashing;
- avoid showing full IDs in public reports;
- allow local dashboards to show more detail than exported reports;
- allow teams to define friendly aliases locally without exporting the alias map.

Example:

```yaml
privacy:
  hash_party_ids: true
  hash_salt_env: "CANTON_APPOPS_HASH_SALT"
  show_full_ids_in_local_dashboard: false
```

## Report privacy levels

Reports should support privacy levels.

### Public report

Suitable for community updates, grant evidence, or public case studies.

Should include:

- aggregate activity counts;
- high-level workflow categories;
- traffic summary if non-sensitive;
- operational readiness checklist;
- methodology and caveats.

Should avoid:

- raw payloads;
- customer/counterparty names;
- exact private contract details;
- full IDs.

### Internal report

Suitable for app team operations.

May include:

- more detailed workflow breakdown;
- internal aliases;
- environment-specific diagnostics;
- alert history;
- configuration gaps.

Still should avoid secrets and private keys.

### Debug report

Suitable only for local troubleshooting.

May include more detail, but must be clearly marked sensitive and should not be generated accidentally.

## Reward-readiness without reward farming

The toolkit may help teams understand reward-readiness, but it must not encourage artificial activity.

Reports should frame reward-related sections as:

- evidence of real app utility;
- operational readiness;
- traffic and activity transparency;
- scenario analysis with assumptions;
- not guaranteed rewards;
- not instructions to manufacture activity.

Recommended disclaimer:

> Reward-readiness metrics are informational and scenario-based. They do not guarantee Canton Coin rewards and should not be used to create artificial or wash activity.

## Security expectations

The toolkit should follow basic security hygiene:

- never print secrets in normal logs;
- load API keys from environment variables or local secret stores;
- avoid committing generated configs containing credentials;
- mark sensitive fields in config examples;
- fail safely when required permissions are missing;
- provide `doctor` checks that explain missing access without exposing credentials.

## Data retention

Default retention should be conservative and local.

Recommended defaults:

```yaml
retention:
  local_days: 30
  report_outputs: keep_until_deleted
  remote_days: null
```

Future hosted deployments should document retention separately.

## Configuration example

```yaml
project:
  name: example-canton-app
  environment: devnet

sources:
  scan_api_url: ""
  ledger_api_url: ""
  validator_api_url: ""

privacy:
  mode: aggregate_only
  local_only: true
  include_payloads: false
  hash_party_ids: true
  export_raw_events: false

metrics:
  templates:
    - MyApp.Payment
    - MyApp.Settlement
  choices:
    - CreatePayment
    - SettlePayment

reports:
  default_privacy_level: public
```

## Implementation checklist

Before a feature is considered privacy-safe, verify:

- [ ] Does it work in local-only mode?
- [ ] Does it avoid raw payload export by default?
- [ ] Does it avoid printing secrets?
- [ ] Are sensitive identifiers hashed, redacted, or explicitly opt-in?
- [ ] Can the user preview or understand what is included in a report?
- [ ] Is the report safe to share publicly at the selected privacy level?
- [ ] Are caveats documented for reward-readiness metrics?

## Open questions

These should be resolved through builder and validator feedback:

- Which Ledger API fields are safe and useful for default aggregation?
- Which Validator API traffic fields are available to typical app providers?
- Should template names be considered safe by default or configurable?
- What level of timestamp precision is acceptable in public reports?
- What report format is most useful for grant/Featured App evidence?
- Which deployment mode should be supported first: LocalNet, DevNet, TestNet, or production app providers?
