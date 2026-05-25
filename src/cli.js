import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  buildSampleMetricsSnapshot,
  stringifyMetricsSnapshot,
  validateMetricsSnapshot,
} from './metrics.js';
import { renderMetricsReport } from './report.js';

export const CONFIG_FILE = 'canton-appops.config.yaml';
export const SAMPLE_METRICS_FILE = path.join('.canton-appops', 'metrics', 'sample-appops-metrics.json');
export const SAMPLE_REPORT_FILE = path.join('.canton-appops', 'reports', 'sample-appops-report.md');
export const VERSION = '0.1.0';

const HELP_TEXT = `Canton AppOps Toolkit

Open-source, privacy-preserving telemetry and reward-readiness tooling for Canton application providers.

Usage:
  canton-appops <command> [options]
  canton-appops --help

Commands:
  canton-appops init              Create a starter local config file
  canton-appops doctor            Check local config and environment
  canton-appops collect --sample  Write a privacy-safe sample metrics snapshot
  canton-appops report --sample   Generate a privacy-safe sample Markdown report
  canton-appops help              Show this help message

Options:
  -h, --help                Show help
  -v, --version             Show version
  --force                   Overwrite an existing config when used with init
  --stdout                  Print collect/report output to stdout instead of writing a file

Examples:
  canton-appops init
  canton-appops doctor
  canton-appops collect --sample
  canton-appops collect --sample --stdout
  canton-appops report --sample
  canton-appops report --sample --stdout
`;

export const DEFAULT_CONFIG = `# Canton AppOps Toolkit starter config
# Default mode is local-only and aggregate-only. Do not export raw Canton
# transaction payloads unless you explicitly change this file and understand
# the privacy/security implications.

schema_version: 1

app:
  name: "example-canton-app"
  environment: "local"
  description: "Starter app-provider telemetry profile"

canton:
  network: "localnet"
  participant:
    ledger_api_url: "http://localhost:7575"
  validator:
    api_url: "http://localhost:5003"

sources:
  sample:
    enabled: true
  ledger_api:
    enabled: false
  validator_api:
    enabled: false
  scan_api:
    enabled: false

privacy:
  mode: "local-only"
  aggregate_only: true
  export_raw_payloads: false
  hash_identifiers: true
  redact_party_ids: true

storage:
  directory: ".canton-appops"

reporting:
  default_period: "weekly"
  output_directory: "reports"
`;

function write(stream, text) {
  stream.write(text);
}

function hasFlag(args, ...flags) {
  return args.some((arg) => flags.includes(arg));
}

function configPath(cwd) {
  return path.join(cwd, CONFIG_FILE);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertDirectoryWritable(cwd) {
  const probePath = path.join(cwd, `.canton-appops-write-probe-${process.pid}`);
  await writeFile(probePath, 'ok', 'utf8');
  await rm(probePath, { force: true });
}

function nodeMajor(version) {
  const match = /^v?(\d+)/.exec(version);
  return match ? Number(match[1]) : 0;
}

function checkPrivacyDefaults(config) {
  return (
    /mode:\s*["']local-only["']/.test(config) &&
    /aggregate_only:\s*true/.test(config) &&
    /export_raw_payloads:\s*false/.test(config)
  );
}

function readYamlString(config, sectionName, keyName) {
  let inSection = false;

  for (const line of config.split('\n')) {
    if (line.trim() === `${sectionName}:`) {
      inSection = true;
      continue;
    }

    if (inSection && /^\S/.test(line)) {
      return undefined;
    }

    if (!inSection) {
      continue;
    }

    const match = line.match(new RegExp(`^\\s+${keyName}:\\s+["']?([^"'\\n]+)["']?\\s*$`));
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
}

async function readAppProfile(cwd) {
  const profile = {
    appName: 'example-canton-app',
    environment: 'local',
    network: 'localnet',
  };

  const target = configPath(cwd);
  if (!(await fileExists(target))) {
    return profile;
  }

  const config = await readFile(target, 'utf8');
  return {
    appName: readYamlString(config, 'app', 'name') ?? profile.appName,
    environment: readYamlString(config, 'app', 'environment') ?? profile.environment,
    network: readYamlString(config, 'canton', 'network') ?? profile.network,
  };
}

async function writeSampleMetricsFile(cwd, snapshot) {
  const outputPath = path.join(cwd, SAMPLE_METRICS_FILE);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, stringifyMetricsSnapshot(snapshot), 'utf8');
  return SAMPLE_METRICS_FILE;
}

async function writeSampleReportFile(cwd, report) {
  const outputPath = path.join(cwd, SAMPLE_REPORT_FILE);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, report, 'utf8');
  return SAMPLE_REPORT_FILE;
}

function buildValidatedSampleSnapshot(profile) {
  const snapshot = buildSampleMetricsSnapshot(profile);
  const validation = validateMetricsSnapshot(snapshot);

  if (!validation.ok) {
    return { snapshot, errors: validation.errors };
  }

  return { snapshot, errors: [] };
}

export function renderHelp() {
  return HELP_TEXT;
}

export async function runInit({ args, cwd, stdout, stderr }) {
  const target = configPath(cwd);
  const force = hasFlag(args, '--force');
  const exists = await fileExists(target);

  if (exists && !force) {
    write(stderr, `${CONFIG_FILE} already exists. Re-run with --force to overwrite it.\n`);
    return 1;
  }

  await writeFile(target, DEFAULT_CONFIG, { encoding: 'utf8', flag: 'w' });
  write(stdout, `${exists ? 'Overwrote' : 'Created'} ${CONFIG_FILE}\n`);
  write(stdout, 'Next step: run `canton-appops doctor` to validate your local setup.\n');
  return 0;
}

export async function runDoctor({ cwd, stdout }) {
  const lines = ['Canton AppOps doctor', ''];
  let ok = true;

  if (nodeMajor(process.versions.node) >= 20) {
    lines.push(`✓ Node.js ${process.version}`);
  } else {
    ok = false;
    lines.push(`✗ Node.js ${process.version} detected; Node.js >=20 is required`);
  }

  try {
    await assertDirectoryWritable(cwd);
    lines.push('✓ Project directory writable');
  } catch (error) {
    ok = false;
    lines.push(`✗ Project directory is not writable: ${error.message}`);
  }

  const target = configPath(cwd);
  if (!(await fileExists(target))) {
    ok = false;
    lines.push(`✗ Config missing: ${CONFIG_FILE}`);
    lines.push('  Run `canton-appops init` to create a starter config.');
  } else {
    lines.push(`✓ Config found: ${CONFIG_FILE}`);
    const config = await readFile(target, 'utf8');
    if (checkPrivacyDefaults(config)) {
      lines.push('✓ Privacy defaults: local-only aggregate mode');
    } else {
      ok = false;
      lines.push('✗ Privacy defaults not detected: expected local-only, aggregate_only, and no raw payload export');
    }
  }

  lines.push('');
  lines.push(`Status: ${ok ? 'ok' : 'action required'}`);
  write(stdout, `${lines.join('\n')}\n`);
  return ok ? 0 : 1;
}

export async function runCollect({ args, cwd, stdout, stderr }) {
  if (!hasFlag(args, '--sample')) {
    write(stderr, 'Only sample collection is supported in this prototype. Run `canton-appops collect --sample`.\n');
    return 1;
  }

  const profile = await readAppProfile(cwd);
  const { snapshot, errors } = buildValidatedSampleSnapshot(profile);

  if (errors.length > 0) {
    write(stderr, `Sample metrics snapshot failed validation:\n${errors.join('\n')}\n`);
    return 1;
  }

  if (hasFlag(args, '--stdout')) {
    write(stdout, stringifyMetricsSnapshot(snapshot));
    return 0;
  }

  const relativePath = await writeSampleMetricsFile(cwd, snapshot);
  write(stdout, `Collected sample metrics -> ${relativePath}\n`);
  write(stdout, 'Snapshot is aggregate-only and excludes raw Canton transaction payloads.\n');
  return 0;
}

export async function runReport({ args, cwd, stdout, stderr }) {
  if (!hasFlag(args, '--sample')) {
    write(stderr, 'Only sample reports are supported in this prototype. Run `canton-appops report --sample`.\n');
    return 1;
  }

  const profile = await readAppProfile(cwd);
  const { snapshot, errors } = buildValidatedSampleSnapshot(profile);

  if (errors.length > 0) {
    write(stderr, `Sample report metrics failed validation:\n${errors.join('\n')}\n`);
    return 1;
  }

  let report;
  try {
    report = renderMetricsReport(snapshot);
  } catch (error) {
    write(stderr, `${error.message}\n`);
    return 1;
  }

  if (hasFlag(args, '--stdout')) {
    write(stdout, report);
    return 0;
  }

  const relativePath = await writeSampleReportFile(cwd, report);
  write(stdout, `Generated sample report -> ${relativePath}\n`);
  write(stdout, 'Report is sample-only and not evidence of real Canton usage.\n');
  return 0;
}

export async function run(argv, io = {}) {
  const args = [...argv];
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const cwd = io.cwd ?? process.cwd();

  const command = args[0];

  if (!command || command === 'help' || hasFlag(args, '--help', '-h')) {
    write(stdout, renderHelp());
    return 0;
  }

  if (hasFlag(args, '--version', '-v')) {
    write(stdout, `${VERSION}\n`);
    return 0;
  }

  if (command === 'init') {
    return await runInit({ args: args.slice(1), cwd, stdout, stderr });
  }

  if (command === 'doctor') {
    return await runDoctor({ cwd, stdout, stderr });
  }

  if (command === 'collect') {
    return await runCollect({ args: args.slice(1), cwd, stdout, stderr });
  }

  if (command === 'report') {
    return await runReport({ args: args.slice(1), cwd, stdout, stderr });
  }

  write(stderr, `Unknown command: ${command}\n`);
  write(stderr, 'Run `canton-appops --help` to see available commands.\n');
  return 1;
}
