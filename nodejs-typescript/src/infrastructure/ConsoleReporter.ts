import type { ProcessingReport } from '../application/ProcessingReport.js';
import { isTransferFailure } from '../domain/TransferResult.js';
import { formatMoney } from './MoneyFormatter.js';

export function formatReport(report: ProcessingReport): string {
  const lines: string[] = [
    report.dryRunMode
      ? 'Mable Bank Transfer Processing (dry run)'
      : 'Mable Bank Transfer Processing',
    '',
    `Transfers processed: ${String(report.processedCount)}`,
    `Successful transfers: ${String(report.succeededCount)}`,
    `Failed transfers: ${String(report.failedCount)}`,
  ];

  if (report.skippedCount > 0) {
    lines.push(`Skipped transfers (already processed): ${String(report.skippedCount)}`);
  }

  if (report.dryRunMode) {
    lines.push('No balances were mutated during dry run.');
  }

  lines.push('', 'Final balances:');
  for (const snapshot of report.finalBalances) {
    lines.push(`${snapshot.accountNumber.toString()}: ${formatMoney(snapshot.balance)}`);
  }

  const failures = report.failedResults.filter(isTransferFailure);
  if (failures.length > 0) {
    lines.push('', 'Failed transfers:');
    failures.forEach((result, index) => {
      const instruction = result.instruction;
      lines.push(
        `${String(index + 1)}. From ${instruction.fromAccountNumber.toString()} to ${instruction.toAccountNumber.toString()} for ${formatMoney(instruction.amount)} - ${result.message}`,
      );
    });
  }

  return lines.join('\n');
}
