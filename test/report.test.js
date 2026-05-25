import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSampleMetricsSnapshot } from '../src/metrics.js';
import { renderMetricsReport } from '../src/report.js';

function fixedSampleSnapshot() {
  return buildSampleMetricsSnapshot({
    generatedAt: '2026-05-25T00:00:00.000Z',
    periodStart: '2026-05-18T00:00:00.000Z',
    periodEnd: '2026-05-25T00:00:00.000Z',
  });
}

test('renderMetricsReport turns a metrics snapshot into a privacy-safe weekly Markdown report', () => {
  const report = renderMetricsReport(fixedSampleSnapshot());

  assert.match(report, /^# Canton AppOps Weekly Report/m);
  assert.match(report, /\*\*App:\*\* example-canton-app/);
  assert.match(report, /\*\*Network:\*\* localnet/);
  assert.match(report, /\*\*Period:\*\* 2026-05-18T00:00:00\.000Z → 2026-05-25T00:00:00\.000Z/);
  assert.match(report, /Total workflows:\*\* 24/);
  assert.match(report, /Estimated traffic units:\*\* 1,840/);
  assert.match(report, /Success rate:\*\* 95\.83%/);
  assert.match(report, /Reward-readiness status:\*\* sample-only/);
  assert.match(report, /AppOps:TransferInstruction/);
  assert.match(report, /AcceptInstruction/);
  assert.match(report, /## Privacy guarantees/);
  assert.match(report, /Raw payloads included:\*\* no/);
  assert.match(report, /Sample metrics are not evidence of real Canton usage\./);
  assert.match(report, /not reward farming or reward prediction/i);
  assert.doesNotMatch(report, /raw_contract_payload|party::|customer_name/i);
});

test('renderMetricsReport refuses snapshots that include raw payloads', () => {
  const snapshot = fixedSampleSnapshot();
  snapshot.privacy.raw_payloads_included = true;

  assert.throws(() => renderMetricsReport(snapshot), /raw payload/i);
});
