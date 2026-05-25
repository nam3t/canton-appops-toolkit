# Canton AppOps Weekly Report

> Sample-only AppOps report for prototype review. This report demonstrates the reporting format and is not evidence of real Canton usage.

## Report context

- **App:** example-canton-app
- **Environment:** local
- **Network:** localnet
- **Period:** 2026-05-18T00:00:00.000Z → 2026-05-25T00:00:00.000Z
- **Generated at:** 2026-05-25T00:00:00.000Z
- Source: sample

## Executive summary

- **Total workflows:** 24
- **Completed workflows:** 23
- **Failed workflows:** 1
- **Estimated traffic units:** 1,840
- **Success rate:** 95.83%
- **Reward-readiness status:** sample-only

## Activity

- **Unique templates touched:** 5
- **Unique choices exercised:** 8

### Top templates

| Template | Creates | Exercises |
| --- | --- | --- |
| AppOps:TransferInstruction | 10 | 12 |
| AppOps:SettlementBatch | 6 | 8 |
| AppOps:OperatorHeartbeat | 7 | 0 |

### Top choices

| Choice | Exercises |
| --- | --- |
| AcceptInstruction | 9 |
| MarkSettled | 7 |
| ArchiveHeartbeat | 4 |

## Traffic and operations

- **Command submissions:** 48
- **Accepted transactions:** 46
- **Rejected transactions:** 2
- **Read operations:** 120
- **Write operations:** 36
- **Error count:** 1
- **Warning count:** 3
- **p50 latency:** 180 ms
- **p95 latency:** 420 ms
- **Last success at:** 2026-05-25T00:00:00.000Z

## Reward-readiness signals

- workflow activity present
- traffic estimate present
- operational success rate present

## Caveats

- Sample metrics are not evidence of real Canton usage.
- Reward-readiness is descriptive reporting, not reward farming or reward prediction.

## Privacy guarantees

- **Mode:** local-only
- **Aggregate only:** yes
- **Raw payloads included:** no
- **Party IDs:** redacted
- **Contract IDs:** omitted
- **Counterparty names:** omitted

- Sample snapshot contains aggregate counters only.
- No raw transaction payloads, party identifiers, contract identifiers, or customer names are included.

## Sharing guidance

This report is designed for local review, grant/pilot evidence preparation, and builder feedback. Do not present sample-only output as production usage. Future real reports should document adapter sources, privacy settings, and any redaction policy before external sharing.
