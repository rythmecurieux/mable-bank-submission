#!/usr/bin/env node
import { runCli } from '../src/cli.js';

async function main(): Promise<void> {
  const exitCode = runCli(process.argv.slice(2));
  process.exit(exitCode);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
