import { parseArgs } from 'node:util';
import { ProcessDay } from './application/ProcessDay.js';
import { DomainError } from './domain/errors.js';
import { CsvAccountBalanceReader } from './infrastructure/CsvAccountBalanceReader.js';
import { CsvTransferInstructionReader } from './infrastructure/CsvTransferInstructionReader.js';
import { formatReport } from './infrastructure/ConsoleReporter.js';
import { CsvParseError } from './infrastructure/errors.js';
import { InputFileValidationError, validateInputFile } from './infrastructure/InputFile.js';

const USAGE = 'Usage: mable-bank [--dry-run] <account_balances.csv> <transactions.csv>';

export type CliOptions = {
  readonly dryRun: boolean;
  readonly balancesPath: string;
  readonly transactionsPath: string;
};

export type ParsedCli =
  | { readonly ok: true; readonly options: CliOptions }
  | { readonly ok: false; readonly reason: 'usage' | 'help' };

export function parseCliOptions(argv: readonly string[]): ParsedCli {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      allowPositionals: true,
    });

    if (values.help) {
      return { ok: false, reason: 'help' };
    }

    const balancesPath = positionals[0];
    const transactionsPath = positionals[1];
    if (!balancesPath || !transactionsPath) {
      return { ok: false, reason: 'usage' };
    }

    return {
      ok: true,
      options: {
        dryRun: values['dry-run'] ?? false,
        balancesPath,
        transactionsPath,
      },
    };
  } catch {
    return { ok: false, reason: 'usage' };
  }
}

export function runProcessingDay(options: CliOptions): ReturnType<ProcessDay['call']> {
  const balancesPath = validateInputFile(options.balancesPath);
  const transactionsPath = validateInputFile(options.transactionsPath);

  return new ProcessDay({
    balancesReader: new CsvAccountBalanceReader(balancesPath),
    transfersReader: new CsvTransferInstructionReader(transactionsPath),
    dryRun: options.dryRun,
  }).call();
}

export function runCli(argv: readonly string[]): number {
  const parsed = parseCliOptions(argv);
  if (!parsed.ok) {
    if (parsed.reason === 'help') {
      console.log(USAGE);
      console.log('  --dry-run   Simulate transfers without mutating balances');
      console.log('  -h, --help  Show help');
    } else {
      console.error(USAGE);
    }
    return parsed.reason === 'help' ? 0 : 1;
  }

  try {
    const report = runProcessingDay(parsed.options);
    console.log(formatReport(report));
    return 0;
  } catch (error) {
    if (
      error instanceof CsvParseError ||
      error instanceof InputFileValidationError ||
      error instanceof DomainError
    ) {
      console.error(`Error: ${error.message}`);
      return 1;
    }
    throw error;
  }
}
