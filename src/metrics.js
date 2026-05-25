const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isoNow() {
  return new Date().toISOString();
}

function isoDaysBefore(isoTimestamp, days) {
  return new Date(new Date(isoTimestamp).getTime() - days * ONE_DAY_MS).toISOString();
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireObject(errors, snapshot, path, label = path) {
  const value = path.split('.').reduce((current, segment) => current?.[segment], snapshot);
  if (!isObject(value)) {
    errors.push(`${label} is required`);
    return null;
  }
  return value;
}

function requireNumber(errors, snapshot, path) {
  const value = path.split('.').reduce((current, segment) => current?.[segment], snapshot);
  if (typeof value !== 'number' || Number.isNaN(value)) {
    errors.push(`${path} must be a number`);
  }
}

export function buildSampleMetricsSnapshot(options = {}) {
  const generatedAt = options.generatedAt ?? isoNow();
  const periodEnd = options.periodEnd ?? generatedAt;
  const periodStart = options.periodStart ?? isoDaysBefore(periodEnd, 7);

  return {
    schema_version: 1,
    generated_at: generatedAt,
    app: {
      name: options.appName ?? 'example-canton-app',
      environment: options.environment ?? 'local',
      network: options.network ?? 'localnet',
    },
    period: {
      start: periodStart,
      end: periodEnd,
      granularity: 'weekly',
    },
    source: {
      kind: 'sample',
      adapters: ['sample'],
      description: 'Static privacy-safe sample data for the Canton AppOps Toolkit prototype.',
    },
    metrics: {
      activity: {
        total_workflows: 24,
        completed_workflows: 23,
        failed_workflows: 1,
        unique_templates_touched: 5,
        unique_choices_exercised: 8,
        top_templates: [
          {
            template: 'AppOps:TransferInstruction',
            create_count: 10,
            exercise_count: 12,
          },
          {
            template: 'AppOps:SettlementBatch',
            create_count: 6,
            exercise_count: 8,
          },
          {
            template: 'AppOps:OperatorHeartbeat',
            create_count: 7,
            exercise_count: 0,
          },
        ],
        top_choices: [
          {
            choice: 'AcceptInstruction',
            exercise_count: 9,
          },
          {
            choice: 'MarkSettled',
            exercise_count: 7,
          },
          {
            choice: 'ArchiveHeartbeat',
            exercise_count: 4,
          },
        ],
      },
      traffic: {
        estimated_traffic_units: 1840,
        command_submissions: 48,
        accepted_transactions: 46,
        rejected_transactions: 2,
        read_operations: 120,
        write_operations: 36,
      },
      operations: {
        success_rate: 0.9583,
        error_count: 1,
        warning_count: 3,
        p50_latency_ms: 180,
        p95_latency_ms: 420,
        last_success_at: periodEnd,
      },
    },
    privacy: {
      mode: 'local-only',
      aggregate_only: true,
      raw_payloads_included: false,
      party_ids: 'redacted',
      contract_ids: 'omitted',
      counterparty_names: 'omitted',
      notes: [
        'Sample snapshot contains aggregate counters only.',
        'No raw transaction payloads, party identifiers, contract identifiers, or customer names are included.',
      ],
    },
    reward_readiness: {
      status: 'sample-only',
      score: null,
      signals: [
        'workflow activity present',
        'traffic estimate present',
        'operational success rate present',
      ],
      caveats: [
        'Sample metrics are not evidence of real Canton usage.',
        'Reward-readiness is descriptive reporting, not reward farming or reward prediction.',
      ],
    },
  };
}

export function validateMetricsSnapshot(snapshot) {
  const errors = [];

  if (!isObject(snapshot)) {
    return { ok: false, errors: ['snapshot must be an object'] };
  }

  if (snapshot.schema_version !== 1) {
    errors.push('schema_version must be 1');
  }

  requireObject(errors, snapshot, 'app');
  requireObject(errors, snapshot, 'period');
  requireObject(errors, snapshot, 'source');
  requireObject(errors, snapshot, 'metrics');
  requireObject(errors, snapshot, 'metrics.activity');
  requireObject(errors, snapshot, 'metrics.traffic');
  requireObject(errors, snapshot, 'metrics.operations');
  requireObject(errors, snapshot, 'privacy');
  requireObject(errors, snapshot, 'reward_readiness');

  requireNumber(errors, snapshot, 'metrics.activity.total_workflows');
  requireNumber(errors, snapshot, 'metrics.traffic.estimated_traffic_units');
  requireNumber(errors, snapshot, 'metrics.operations.success_rate');

  if (snapshot.source?.kind !== 'sample' && snapshot.source?.kind !== 'ledger-api' && snapshot.source?.kind !== 'validator-api') {
    errors.push('source.kind must be one of sample, ledger-api, validator-api');
  }

  if (snapshot.privacy?.aggregate_only !== true) {
    errors.push('privacy.aggregate_only must be true by default');
  }

  if (snapshot.privacy?.raw_payloads_included !== false) {
    errors.push('privacy.raw_payloads_included must be false; raw payload export is not allowed in the prototype');
  }

  return { ok: errors.length === 0, errors };
}

export function stringifyMetricsSnapshot(snapshot) {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}
