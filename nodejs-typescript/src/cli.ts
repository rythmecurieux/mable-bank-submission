import { ProcessDay } from './application/ProcessDay.js';
import {
  DuplicateAccountError,
  ReconciliationError,
} from './domain/errors.js';
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

export function parseCliOptions(argv: readonly string[]): CliOptions | null {
  const args = [...argv];
  const dryRun = args[0] === '--dry-run';
  if (dryRun) {
    args.shift();
  }
  const balancesPath = args[0];
  const transactionsPath = args[1];
  if (!balancesPath || !transactionsPath) {
    return null;
  }
  return { dryRun, balancesPath, transactionsPath };
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
  const options = parseCliOptions(argv);
  if (!options) {
    console.error(USAGE);
    return 1;
  }

  try {
    const report = runProcessingDay(options);
    console.log(formatReport(report));
    return 0;
  } catch (error) {
    if (
      error instanceof CsvParseError ||
      error instanceof InputFileValidationError ||
      error instanceof DuplicateAccountError ||
      error instanceof ReconciliationError
    ) {
      console.error(`Error: ${error.message}`);
      return 1;
    }
    throw error;
  }
}
