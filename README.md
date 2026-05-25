# Canton AppOps Toolkit

> **Open-source, privacy-preserving telemetry and reward-readiness tooling for Canton application providers.**

Canton AppOps Toolkit is an early-stage developer toolkit for teams building and operating applications on Canton. The goal is to make app-level activity, traffic usage, operational health, and reward-readiness easier to measure, explain, and report without exposing sensitive transaction payloads.

This project is intentionally positioned as **common-good developer infrastructure** for the Canton ecosystem, not as a closed reward-farming dashboard or a private SaaS-only product.

## Status

Pre-grant prototype. The repository is being prepared as an evidence package for a Canton Development Fund proposal.

Current focus:

- clarify the problem and project scope;
- document the privacy model;
- build a small CLI proof of concept;
- generate sample AppOps reports;
- collect feedback from Canton builders, app providers, and validator operators.

## Why this exists

Canton app builders need to answer operational questions that are currently hard to answer with a reusable, ecosystem-wide workflow:

- Is my application producing meaningful activity?
- Which templates, choices, or workflows are active?
- How much traffic is my app or validator consuming?
- Am I approaching traffic or operational limits?
- Can I generate a credible weekly activity report for a grant, pilot, Featured App review, or internal update?
- Can I monitor app health without leaking private transaction data?

Today, teams often need to stitch together Ledger API data, Validator API data, Scan/public network data, logs, dashboards, scripts, and manual reporting. This creates duplicated work and slows down new builders.

Canton AppOps Toolkit aims to provide a reusable reference implementation for this workflow.

## Who it is for

Initial users:

- Canton application builders;
- app providers preparing for DevNet/TestNet/MainNet operations;
- teams preparing grant or Featured App evidence;
- validator operators who need basic operational and traffic visibility;
- ecosystem contributors building reusable Canton developer tooling.

## Initial scope

The first version will focus on a small, practical AppOps loop:

1. **Collect** privacy-preserving app telemetry from configured Canton data sources.
2. **Normalize** metrics into a documented local schema.
3. **Inspect** activity and operational health in a reference dashboard.
4. **Report** weekly app activity, traffic context, and reward-readiness.
5. **Share** reusable docs, examples, and templates for other Canton builders.

Planned components:

- `canton-appops` CLI;
- local config file and `doctor` checks;
- sample metrics schema;
- local-only aggregate metrics storage;
- sample/reference dashboard;
- Markdown/HTML report generator;
- privacy model documentation;
- example configs for LocalNet/DevNet-style workflows;
- grant/Featured App readiness report templates.

## Planned CLI shape

```bash
# Create a starter config
canton-appops init

# Check local config and API connectivity
canton-appops doctor

# Collect sample or configured metrics
canton-appops collect --sample

# Generate a weekly AppOps report
canton-appops report --sample

# Start a local reference dashboard
canton-appops dashboard
```

The exact command surface may change during the prototype phase.

## Non-goals

This project is intentionally narrow. It is **not** trying to be:

- a full Canton block explorer;
- a replacement for existing Canton, Daml, Splice, or LocalNet tooling;
- a closed-source SaaS required to use the toolkit;
- a reward farming, wash-activity, or guaranteed reward prediction tool;
- a compliance, custody, or enterprise RBAC platform;
- a multi-chain analytics product;
- a system that exports raw private transaction payloads by default.

The goal is app-provider observability and reporting, not ecosystem directory, speculative reward optimization, or generalized chain analytics.

## Privacy-first design

Canton's privacy model is a core reason for using the network. This toolkit should respect that model.

Default principles:

- aggregate metrics by default;
- local-only operation by default;
- no raw transaction payload export by default;
- no customer, counterparty, or sensitive party names in reports by default;
- optional hashing or redaction for identifiers;
- explicit opt-in for any remote export;
- clear separation between local open-source tooling and any future hosted service.

See [`docs/privacy-model.md`](docs/privacy-model.md) for the draft privacy model.

## Grant alignment

The intended Canton Development Fund angle is:

> Open-source app-provider telemetry, traffic/reward-readiness, and standardized reporting as reusable developer tooling and reference infrastructure for the Canton ecosystem.

Grant-funded work should remain reusable and open source. A future hosted service may exist, but it should be optional and not required to use the grant-funded core toolkit.

## Early roadmap

### Phase 0: Evidence package

- README and privacy model;
- CLI skeleton;
- sample metrics schema;
- sample report generator;
- reference dashboard mock/sample;
- feedback from Canton builders and validator operators.

### Phase 1: MVP collector and local dashboard

- local config;
- `init`, `doctor`, `collect`, `report`, and `dashboard` commands;
- sample data and local storage;
- report templates;
- quickstart docs.

### Phase 2: Canton API integrations

- Scan/public data adapter;
- Ledger API activity adapter;
- Validator API traffic/status adapter where available;
- template/choice/workflow metrics;
- documented assumptions and limitations.

### Phase 3: Pilot hardening

- pilot feedback;
- Docker/package distribution;
- better docs;
- release tags;
- technical blog or case study;
- maintenance plan.

## Feedback wanted

This project is looking for feedback from Canton builders and operators:

- What app activity metrics do you need weekly?
- Which operational signals are hardest to collect today?
- What would make an AppOps report credible for a grant or Featured App review?
- What privacy constraints must the collector enforce by default?
- Which Canton APIs or deployment setups should be supported first?

Please open an issue or discussion with your use case.

## License

Apache-2.0. See [`LICENSE`](LICENSE).

## Disclaimer

This project is experimental and not affiliated with, endorsed by, or approved by the Canton Foundation unless explicitly stated in the future. It does not provide financial advice, does not guarantee Canton Coin rewards, and should not be used to manufacture artificial activity.
