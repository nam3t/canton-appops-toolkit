import { validateMetricsSnapshot } from './metrics.js';

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function renderTable(headers, rows) {
  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rowLines = rows.map((row) => `| ${row.join(' | ')} |`);
  return [headerLine, separatorLine, ...rowLines].join('\n');
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '- None reported.';
  }

  return items.map((item) => `- ${item}`).join('\n');
}

export function renderMetricsReport(snapshot) {
  const validation = validateMetricsSnapshot(snapshot);
  if (!validation.ok) {
    throw new Error(`Cannot render unsafe or invalid metrics snapshot:\n${validation.errors.join('\n')}`);
  }

  const activity = snapshot.metrics.activity;
  const traffic = snapshot.metrics.traffic;
  const operations = snapshot.metrics.operations;
  const privacy = snapshot.privacy;
  const rewardReadiness = snapshot.reward_readiness;

  const templateRows = activity.top_templates.map((entry) => [
    entry.template,
    formatNumber(entry.create_count),
    formatNumber(entry.exercise_count),
  ]);

  const choiceRows = activity.top_choices.map((entry) => [
    entry.choice,
    formatNumber(entry.exercise_count),
  ]);

  return `# Canton AppOps Weekly Report

> Sample-only AppOps report for prototype review. This report demonstrates the reporting format and is not evidence of real Canton usage.

## Report context

- **App:** ${snapshot.app.name}
- **Environment:** ${snapshot.app.environment}
- **Network:** ${snapshot.app.network}
- **Period:** ${snapshot.period.start} → ${snapshot.period.end}
- **Generated at:** ${snapshot.generated_at}
- Source: ${snapshot.source.kind}

## Executive summary

- **Total workflows:** ${formatNumber(activity.total_workflows)}
- **Completed workflows:** ${formatNumber(activity.completed_workflows)}
- **Failed workflows:** ${formatNumber(activity.failed_workflows)}
- **Estimated traffic units:** ${formatNumber(traffic.estimated_traffic_units)}
- **Success rate:** ${formatPercent(operations.success_rate)}
- **Reward-readiness status:** ${rewardReadiness.status}

## Activity

- **Unique templates touched:** ${formatNumber(activity.unique_templates_touched)}
- **Unique choices exercised:** ${formatNumber(activity.unique_choices_exercised)}

### Top templates

${renderTable(['Template', 'Creates', 'Exercises'], templateRows)}

### Top choices

${renderTable(['Choice', 'Exercises'], choiceRows)}

## Traffic and operations

- **Command submissions:** ${formatNumber(traffic.command_submissions)}
- **Accepted transactions:** ${formatNumber(traffic.accepted_transactions)}
- **Rejected transactions:** ${formatNumber(traffic.rejected_transactions)}
- **Read operations:** ${formatNumber(traffic.read_operations)}
- **Write operations:** ${formatNumber(traffic.write_operations)}
- **Error count:** ${formatNumber(operations.error_count)}
- **Warning count:** ${formatNumber(operations.warning_count)}
- **p50 latency:** ${formatNumber(operations.p50_latency_ms)} ms
- **p95 latency:** ${formatNumber(operations.p95_latency_ms)} ms
- **Last success at:** ${operations.last_success_at}

## Reward-readiness signals

${renderList(rewardReadiness.signals)}

## Caveats

${renderList(rewardReadiness.caveats)}

## Privacy guarantees

- **Mode:** ${privacy.mode}
- **Aggregate only:** ${yesNo(privacy.aggregate_only)}
- **Raw payloads included:** ${yesNo(privacy.raw_payloads_included)}
- **Party IDs:** ${privacy.party_ids}
- **Contract IDs:** ${privacy.contract_ids}
- **Counterparty names:** ${privacy.counterparty_names}

${renderList(privacy.notes)}

## Sharing guidance

This report is designed for local review, grant/pilot evidence preparation, and builder feedback. Do not present sample-only output as production usage. Future real reports should document adapter sources, privacy settings, and any redaction policy before external sharing.
`;
}
