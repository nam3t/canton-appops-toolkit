import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSampleMetricsSnapshot,
  validateMetricsSnapshot,
} from '../src/metrics.js';

test('buildSampleMetricsSnapshot returns the Day 3 AppOps metrics envelope', () => {
  const snapshot = buildSampleMetricsSnapshot({
    generatedAt: '2026-05-25T00:00:00.000Z',
    periodStart: '2026-05-18T00:00:00.000Z',
    periodEnd: '2026-05-25T00:00:00.000Z',
  });

  assert.equal(snapshot.schema_version, 1);
  assert.deepEqual(snapshot.app, {
    name: 'example-canton-app',
    environment: 'local',
    network: 'localnet',
  });
  assert.deepEqual(snapshot.period, {
    start: '2026-05-18T00:00:00.000Z',
    end: '2026-05-25T00:00:00.000Z',
    granularity: 'weekly',
  });
  assert.equal(snapshot.source.kind, 'sample');
  assert.equal(snapshot.metrics.activity.total_workflows, 24);
  assert.equal(snapshot.metrics.activity.unique_templates_touched, 5);
  assert.equal(snapshot.metrics.activity.top_templates[0].template, 'AppOps:TransferInstruction');
  assert.equal(snapshot.metrics.traffic.estimated_traffic_units, 1840);
  assert.equal(snapshot.metrics.operations.success_rate, 0.9583);
  assert.equal(snapshot.privacy.mode, 'local-only');
  assert.equal(snapshot.privacy.aggregate_only, true);
  assert.equal(snapshot.privacy.raw_payloads_included, false);
  assert.equal(snapshot.reward_readiness.status, 'sample-only');
});

test('validateMetricsSnapshot accepts the sample envelope', () => {
  const result = validateMetricsSnapshot(buildSampleMetricsSnapshot());

  assert.deepEqual(result, { ok: true, errors: [] });
});

test('validateMetricsSnapshot rejects snapshots that include raw payloads', () => {
  const snapshot = buildSampleMetricsSnapshot();
  snapshot.privacy.raw_payloads_included = true;

  const result = validateMetricsSnapshot(snapshot);

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /raw payload/i);
});

test('validateMetricsSnapshot rejects missing required metric sections', () => {
  const snapshot = buildSampleMetricsSnapshot();
  delete snapshot.metrics.traffic;

  const result = validateMetricsSnapshot(snapshot);

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /metrics\.traffic/);
});
