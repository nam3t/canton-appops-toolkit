# Project Context: Canton AppOps Toolkit

Last reviewed: 2026-05-25

This document explains the context someone needs before they can understand, use, review, or contribute to Canton AppOps Toolkit.

It is written for:

- Canton application builders;
- app providers preparing for LocalNet, DevNet, TestNet, or MainNet operations;
- validator operators who need basic operational visibility;
- grant reviewers and potential Canton Foundation champions;
- contributors who want to understand why this repo exists;
- investor-builders evaluating Canton Network from a builder/tooling angle.

This is not financial advice, not a reward guarantee, and not an endorsement by the Canton Foundation.

## 1. One-sentence project thesis

Canton AppOps Toolkit is open-source, privacy-preserving operational tooling that helps Canton application providers collect aggregate app telemetry, understand traffic and reliability, and generate credible activity/reward-readiness reports without exposing private transaction payloads.

## 2. Why Canton needs this kind of tooling

Canton is designed for regulated and institution-grade workflows where privacy and control matter. That creates a different observability problem from public chains.

On a typical public chain, a block explorer or public indexer can often inspect most activity. On Canton, transaction visibility is intentionally scoped: only the relevant stakeholders see, validate, and record their part of a transaction. This is a feature, not a bug, but it means app providers need privacy-aware operational tools rather than generic public-chain analytics.

The practical problem:

- app teams need to know if their app is producing meaningful activity;
- they need to track templates, choices, workflows, traffic, errors, and uptime;
- they may need evidence for a grant, pilot, customer update, or Featured App review;
- they cannot casually export raw transaction payloads, party identifiers, customer names, or private contract details;
- there is no obvious reusable AppOps workflow that every Canton builder can adopt.

This project exists to turn that repeated manual work into a reusable local toolkit.

## 3. Canton concepts users should know

### Canton Network

Canton Network is a blockchain network designed for privacy-preserving, interoperable financial applications. A key idea is that independent applications and participants can keep control over their own data while still composing through shared synchronization infrastructure.

Useful mental model:

```text
Private app workflows + controlled transaction visibility
        +
Global Synchronizer for atomic cross-application coordination
        =
Institutional-grade composability without public leakage of all app data
```

### Global Synchronizer

The Global Synchronizer is the decentralized interoperability and ordering service for Canton Network. It enables atomic transactions across independent Canton applications/subnets while preserving privacy and participant controls.

For this project, the Global Synchronizer matters because app operations may involve:

- cross-application activity;
- traffic consumption;
- validator participation;
- Canton Coin fee/burn/reward mechanics;
- evidence that an app creates real utility.

### Canton Coin (CC)

Canton Coin is the native utility token associated with the Global Synchronizer. Official Canton materials describe CC as being used for traffic fees and network incentives. Fees, rewards, and traffic are important context for this toolkit, but this project should not be framed as a trading bot, reward farming tool, or guaranteed reward predictor.

Important nuance:

- Canton Coin value capture depends on real network usage, traffic, burns, minting/reward mechanics, liquidity, and governance.
- App-provider tooling can help measure utility, but measuring utility is not the same as guaranteeing rewards or investment returns.

### Daml

Daml is the smart contract language used in the Canton ecosystem. App-level activity is often expressed through Daml concepts such as:

- templates;
- choices;
- contracts;
- creates/exercises/archives;
- parties;
- workflows.

The toolkit’s metrics schema intentionally starts with these app-provider-friendly concepts instead of trying to reproduce every ledger detail.

### Validators and Super Validators

A validator participates in Canton applications and interacts with the network on behalf of users/apps. Super Validators operate decentralized infrastructure for the Global Synchronizer.

For AppOps, validator context matters because:

- validators can have traffic budgets;
- app/user activity may consume traffic;
- validator APIs expose useful operational and wallet-related workflows;
- app reports may need to explain validator/app health without exposing secrets.

### Traffic

Traffic is the resource consumed by Canton transactions submitted through the synchronizer. Some traffic may be available by default; additional traffic may need to be bought with Canton Coin depending on the flow and validator setup.

This toolkit treats traffic as an operational signal:

- Are we consuming traffic?
- Are we close to limits?
- Which workflows are traffic-heavy?
- Can we report traffic usage safely?

### Featured Apps and reward-readiness

Canton tokenomics and ecosystem messaging emphasize rewards for utility, especially application-provider utility. This creates a need for credible activity reports.

But this project must stay on the right side of incentive design:

- good: measuring real usage, traffic, uptime, and operational readiness;
- bad: manufacturing artificial/wash activity to chase rewards;
- good: scenario-based reward-readiness reporting;
- bad: promising rewards or claiming eligibility without evidence.

## 4. The core user problem

A Canton app provider needs answers to questions like:

- What happened in my app this week?
- Which templates and choices were active?
- How many workflows completed or failed?
- How much traffic did my app likely consume?
- Are there operational errors or reliability gaps?
- Can I generate a credible report for a grant, pilot, investor update, or internal review?
- Can I share that report without leaking private transaction details?

Today, the answer often requires stitching together:

- Canton Ledger API data;
- Validator API data;
- Scan/public network data;
- logs;
- dashboards;
- ad hoc scripts;
- manual notes and screenshots.

Canton AppOps Toolkit aims to provide the reusable version of that workflow.

## 5. Target users and what they need

### Application builders

They need:

- a quick way to initialize local config;
- a sample metrics model they can understand;
- examples for LocalNet/DevNet workflows;
- report templates they can adapt;
- clear privacy defaults.

### App providers / operators

They need:

- local collection jobs;
- aggregate activity metrics;
- traffic and operational health summaries;
- report generation;
- safe export controls.

### Validator operators

They need:

- validator status and traffic context;
- connectivity checks;
- warnings before traffic or config issues become operational incidents;
- no accidental leakage of validator secrets or user data.

### Grant reviewers / Foundation champions

They need to answer:

- Does this project create common-good value for Canton?
- Is it reusable by other builders?
- Does it avoid closed SaaS lock-in for grant-funded work?
- Are milestones clear and verifiable?
- Does the privacy model respect Canton’s architecture?
- Does reward-readiness avoid reward farming?

### Investor-builders

They need to understand whether the toolkit helps observe real utility signals:

- app activity;
- traffic consumption;
- repeat usage;
- operational reliability;
- ecosystem tooling gaps;
- whether usage can translate into CC demand/burn/reward signals.

This repo should help an investor-builder learn the network from the inside by building useful tooling first.

## 6. Project scope

The intended open-source core includes:

- `canton-appops` CLI;
- local config and `doctor` checks;
- sample metrics schema;
- local-only aggregate metrics storage;
- sample/report generator;
- local/reference dashboard;
- privacy model documentation;
- example configs for LocalNet/DevNet-style workflows;
- grant/Featured App readiness report templates;
- future adapters for Scan API, Ledger API, and Validator API.

The current prototype already includes:

- dependency-free Node.js CLI skeleton;
- `init` command;
- `doctor` command;
- `collect --sample` command;
- sample AppOps metrics envelope;
- JSON Schema draft;
- privacy model document;
- sample fixture and tests.

## 7. Non-goals

This project is intentionally not:

- a Canton block explorer;
- a generic multi-chain analytics platform;
- a replacement for Canton, Daml, Splice, Scan, Ledger API, or Validator API tooling;
- a compliance archive;
- a custody or wallet product;
- a closed SaaS required to use the toolkit;
- a reward farming or wash-activity tool;
- a guaranteed Canton Coin reward predictor;
- a system that exports private Canton transaction payloads by default.

The distinction matters: the goal is reusable app-provider operations and reporting, not speculative reward optimization.

## 8. Privacy model everyone must understand

Canton’s privacy model is the reason this toolkit needs to exist and the constraint it must respect.

Default rules:

- local-only operation by default;
- aggregate metrics by default;
- no raw transaction payload export by default;
- no customer names or counterparty names in public reports by default;
- no raw party IDs or contract IDs in public reports by default;
- optional hashing/redaction for sensitive identifiers;
- explicit opt-in for any remote export;
- clear separation between open-source local tooling and any future hosted service.

Safe default metrics include:

- workflow counts;
- create/exercise/archive counts;
- template-level counts;
- choice-level counts;
- traffic estimates;
- success/error counters;
- latency summaries;
- report completeness indicators.

Potentially sensitive data includes:

- party IDs;
- participant IDs;
- validator IDs;
- contract IDs;
- command IDs;
- workflow IDs;
- exact timestamps;
- template names if they reveal proprietary logic.

Sensitive data not collected or exported by default:

- raw contract payloads;
- customer names;
- counterparty names;
- asset positions;
- settlement instructions;
- account identifiers;
- PII;
- secrets, API keys, JWTs, private keys, or validator credentials.

## 9. Metrics model mental model

The first metrics envelope is intentionally small:

```text
snapshot
├── app: reporting labels
├── period: reporting window
├── source: sample / future API adapter metadata
├── metrics
│   ├── activity: workflows, templates, choices
│   ├── traffic: estimated traffic and transaction counters
│   └── operations: success rate, errors, latency
├── privacy: explicit guarantees and redactions
└── reward_readiness: descriptive signals and caveats
```

This structure lets the project generate useful reports while keeping sensitive data out of the default output.

The sample commands are:

```bash
node bin/canton-appops.js collect --sample
node bin/canton-appops.js report --sample
```

For JSON output:

```bash
node bin/canton-appops.js collect --sample --stdout
```

## 10. Data flow mental model

Future full workflow:

```text
Canton data sources
  ├── sample adapter now
  ├── future Scan API adapter
  ├── future Ledger API adapter
  └── future Validator API adapter
        ↓
collector
        ↓
normalizer / privacy filter
        ↓
local metrics store
        ↓
report generator + dashboard
        ↓
operator-controlled sharing
```

The privacy filter is not optional decoration. It is part of the core architecture.

## 11. Grant and sustainability context

The intended grant framing is:

> Open-source app-provider telemetry, traffic/reward-readiness, and standardized reporting as reusable developer tooling and reference infrastructure for the Canton ecosystem.

Grant-funded work should remain reusable and open source.

A future hosted service can exist, but it should be optional and should not be required to use the grant-funded core functionality.

Clear separation:

- grant-funded: CLI collector, local dashboard, metrics schema, report generator, docs, sample integrations, pilot feedback;
- not grant-funded core: private hosted SaaS, enterprise support, custom private dashboards, managed deployments.

This distinction helps reviewers see that the proposal is common-good infrastructure, not just a private startup subsidy.

## 12. Why the project is relevant to developer and investor roles

### Developer role

This project helps a developer:

- learn Canton through practical operations tooling;
- understand Daml/Canton concepts from metrics and reporting needs;
- build a useful open-source artifact;
- create grant evidence before asking for funding;
- identify future paid services from real user pain.

### Investor role

This project helps an investor:

- observe utility signals instead of only reading announcements;
- understand whether app activity can become traffic, fees, burns, or reward demand;
- distinguish real adoption from marketing claims;
- track risks around supply, liquidity, utility capture, and governance;
- build domain expertise by contributing useful infrastructure.

The key investor-builder thesis is: build tooling that reveals whether Canton usage is real, privacy-preserving, and operationally sustainable.

## 13. What contributors should read first

Recommended reading order inside this repo:

1. [`README.md`](../README.md) — project positioning, quickstart, scope, roadmap.
2. [`docs/project-context.md`](project-context.md) — this conceptual context document.
3. [`docs/privacy-model.md`](privacy-model.md) — privacy constraints and safe defaults.
4. [`docs/metrics-schema.md`](metrics-schema.md) — metrics envelope and sample collector output.
5. [`docs/report-generator.md`](report-generator.md) — sample report format and privacy guarantees.
6. [`schemas/appops-metrics.schema.json`](../schemas/appops-metrics.schema.json) — machine-readable draft schema.
7. [`samples/sample-appops-metrics.json`](../samples/sample-appops-metrics.json) — deterministic sample snapshot.
8. [`samples/sample-appops-report.md`](../samples/sample-appops-report.md) — deterministic sample Markdown report.
9. `src/cli.js`, `src/metrics.js`, and `src/report.js` — current prototype implementation.
10. `test/cli.test.js`, `test/metrics.test.js`, and `test/report.test.js` — expected behavior.

External background:

- Canton Network Global Synchronizer overview: https://www.canton.network/global-synchronizer
- Canton Coin utility overview: https://www.canton.network/blog/canton-coin-rewarding-utility
- Canton developer resources: https://www.canton.network/developer-resources
- Validator APIs / Splice docs: https://docs.sync.global/app_dev/validator_api/index.html
- Canton Foundation grants program: https://canton.foundation/grants-program

## 14. Open questions to validate with real users

Product questions:

- Which weekly activity metrics are most useful to Canton app providers?
- Which report format would grant reviewers or pilot customers trust?
- Should reports optimize for public sharing, internal operations, or both?
- Which adapter should come first: Scan API, Ledger API, or Validator API?
- What LocalNet sample app should be used as the reference workflow?

Privacy questions:

- Are template and choice names acceptable in public reports, or should they be hashed/redacted by default?
- How should exact timestamps be bucketed?
- What identifier hashing strategy is safe enough for app-provider reports?
- Should local dashboard and exported reports have different privacy levels?

Reward-readiness questions:

- What evidence counts as meaningful app utility?
- How should the toolkit distinguish real usage from artificial activity?
- What caveats must appear in every reward-readiness report?
- How should traffic-based reward changes be reflected if Canton governance updates the mechanism?

Sustainability questions:

- Which parts must remain open-source for ecosystem trust?
- Which optional services could be commercial without compromising the grant-funded core?
- What maintenance commitment would make this credible for grant review?

## 15. Design principle

When in doubt, choose the option that is:

1. more privacy-preserving;
2. more reusable by other Canton builders;
3. more honest about reward uncertainty;
4. easier to verify with tests and sample data;
5. less dependent on a hosted service;
6. better aligned with common-good developer infrastructure.

That principle is the north star for Canton AppOps Toolkit.
