import type { TransferInstruction } from './TransferInstruction.js';

export type TransferFailureReason =
  | 'source_not_found'
  | 'destination_not_found'
  | 'insufficient_funds';

export type TransferSkipReason = 'already_processed';

const REASON_MESSAGES: Record<TransferFailureReason | TransferSkipReason, string> = {
  source_not_found: 'Source account not found',
  destination_not_found: 'Destination account not found',
  insufficient_funds: 'Insufficient funds',
  already_processed: 'Transfer already processed',
};

export type TransferResult =
  | {
      readonly status: 'success';
      readonly instruction: TransferInstruction;
    }
  | {
      readonly status: 'failure';
      readonly instruction: TransferInstruction;
      readonly reason: TransferFailureReason;
      readonly message: string;
    }
  | {
      readonly status: 'skipped';
      readonly instruction: TransferInstruction;
      readonly reason: TransferSkipReason;
      readonly message: string;
    };

export function transferSuccess(instruction: TransferInstruction): TransferResult {
  return { status: 'success', instruction };
}

export function transferFailure(
  instruction: TransferInstruction,
  reason: TransferFailureReason,
): TransferResult {
  return {
    status: 'failure',
    instruction,
    reason,
    message: REASON_MESSAGES[reason],
  };
}

export function transferSkipped(
  instruction: TransferInstruction,
  reason: TransferSkipReason = 'already_processed',
): TransferResult {
  return {
    status: 'skipped',
    instruction,
    reason,
    message: REASON_MESSAGES[reason],
  };
}

export function isTransferSuccess(
  result: TransferResult,
): result is Extract<TransferResult, { status: 'success' }> {
  return result.status === 'success';
}

export function isTransferFailure(
  result: TransferResult,
): result is Extract<TransferResult, { status: 'failure' }> {
  return result.status === 'failure';
}

export function isTransferSkipped(
  result: TransferResult,
): result is Extract<TransferResult, { status: 'skipped' }> {
  return result.status === 'skipped';
}

export function transferReasonCode(result: TransferResult): string | undefined {
  if (isTransferFailure(result)) return result.reason;
  if (isTransferSkipped(result)) return result.reason;
  return undefined;
}
