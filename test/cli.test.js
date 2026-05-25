import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repoRoot, 'bin', 'canton-appops.js');

async function runCli(args, options = {}) {
  const cwd = options.cwd ?? repoRoot;

  return await new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), 'canton-appops-test-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('--help prints the planned command surface', async () => {
  const result = await runCli(['--help']);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /Canton AppOps Toolkit/);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /canton-appops init/);
  assert.match(result.stdout, /canton-appops doctor/);
  assert.match(result.stdout, /canton-appops collect --sample/);
  assert.match(result.stdout, /privacy-preserving/i);
  assert.equal(result.stderr, '');
});

test('init creates the default local-only starter config', async () => {
  await withTempDir(async (dir) => {
    const result = await runCli(['init'], { cwd: dir });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /Created canton-appops\.config\.yaml/);
    assert.equal(result.stderr, '');

    const config = await readFile(path.join(dir, 'canton-appops.config.yaml'), 'utf8');
    assert.match(config, /app:/);
    assert.match(config, /name: "example-canton-app"/);
    assert.match(config, /environment: "local"/);
    assert.match(config, /privacy:/);
    assert.match(config, /mode: "local-only"/);
    assert.match(config, /export_raw_payloads: false/);
    assert.match(config, /sources:/);
    assert.match(config, /sample:/);
    assert.match(config, /enabled: true/);
  });
});

test('init refuses to overwrite an existing config unless --force is passed', async () => {
  await withTempDir(async (dir) => {
    const configPath = path.join(dir, 'canton-appops.config.yaml');
    await writeFile(configPath, 'custom: true\n', 'utf8');

    const blocked = await runCli(['init'], { cwd: dir });
    assert.equal(blocked.code, 1);
    assert.match(blocked.stderr, /already exists/);
    assert.equal(await readFile(configPath, 'utf8'), 'custom: true\n');

    const forced = await runCli(['init', '--force'], { cwd: dir });
    assert.equal(forced.code, 0);
    assert.match(forced.stdout, /Overwrote canton-appops\.config\.yaml/);
    assert.match(await readFile(configPath, 'utf8'), /mode: "local-only"/);
  });
});

test('doctor reports action required when the config is missing', async () => {
  await withTempDir(async (dir) => {
    const result = await runCli(['doctor'], { cwd: dir });

    assert.equal(result.code, 1);
    assert.match(result.stdout, /Canton AppOps doctor/);
    assert.match(result.stdout, /Node\.js/);
    assert.match(result.stdout, /Config missing: canton-appops\.config\.yaml/);
    assert.match(result.stdout, /canton-appops init/);
    assert.match(result.stdout, /Status: action required/);
    assert.equal(result.stderr, '');
  });
});

test('doctor passes after init creates the starter config', async () => {
  await withTempDir(async (dir) => {
    const init = await runCli(['init'], { cwd: dir });
    assert.equal(init.code, 0);

    const result = await runCli(['doctor'], { cwd: dir });
    assert.equal(result.code, 0);
    assert.match(result.stdout, /Config found: canton-appops\.config\.yaml/);
    assert.match(result.stdout, /Privacy defaults: local-only aggregate mode/);
    assert.match(result.stdout, /Status: ok/);
    assert.equal(result.stderr, '');
  });
});

test('collect --sample writes a privacy-safe sample metrics snapshot', async () => {
  await withTempDir(async (dir) => {
    const init = await runCli(['init'], { cwd: dir });
    assert.equal(init.code, 0);

    const result = await runCli(['collect', '--sample'], { cwd: dir });
    assert.equal(result.code, 0);
    assert.match(result.stdout, /Collected sample metrics/);
    assert.match(result.stdout, /.canton-appops\/metrics\/sample-appops-metrics\.json/);
    assert.equal(result.stderr, '');

    const outputPath = path.join(dir, '.canton-appops', 'metrics', 'sample-appops-metrics.json');
    const snapshot = JSON.parse(await readFile(outputPath, 'utf8'));

    assert.equal(snapshot.schema_version, 1);
    assert.equal(snapshot.source.kind, 'sample');
    assert.equal(snapshot.app.name, 'example-canton-app');
    assert.equal(snapshot.privacy.raw_payloads_included, false);
    assert.equal(snapshot.privacy.aggregate_only, true);
    assert.equal(snapshot.metrics.activity.total_workflows, 24);
    assert.equal(snapshot.metrics.traffic.estimated_traffic_units, 1840);
    assert.equal(snapshot.reward_readiness.status, 'sample-only');
    assert.doesNotMatch(JSON.stringify(snapshot), /raw_contract_payload|party::|customer_name/i);
  });
});

test('collect --sample --stdout prints the sample metrics snapshot as JSON', async () => {
  await withTempDir(async (dir) => {
    const result = await runCli(['collect', '--sample', '--stdout'], { cwd: dir });

    assert.equal(result.code, 0);
    assert.equal(result.stderr, '');

    const snapshot = JSON.parse(result.stdout);
    assert.equal(snapshot.source.kind, 'sample');
    assert.equal(snapshot.privacy.mode, 'local-only');
    assert.equal(snapshot.metrics.operations.error_count, 1);
  });
});

test('unknown commands fail with a useful error', async () => {
  const result = await runCli(['dashboard']);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /Unknown command: dashboard/);
  assert.match(result.stderr, /Run `canton-appops --help`/);
});
