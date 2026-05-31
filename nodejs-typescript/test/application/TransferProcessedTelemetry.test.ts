import { describe, expect, it } from 'vitest';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { Money } from '../../src/domain/Money.js';
import { transferFailure, transferSkipped, transferSuccess } from '../../src/domain/TransferResult.js';
import { createTransferInstruction } from '../../src/domain/TransferInstruction.js';
import { TransferProcessedTelemetry } from '../../src/application/telemetry/TransferProcessedTelemetry.js';

describe('TransferProcessedTelemetry', () => {
  const instruction = createTransferInstruction({
    fromAccountNumber: AccountNumber.parse('1111234522226789'),
    toAccountNumber: AccountNumber.parse('1212343433335665'),
    amount: Money.fromDecimalString('10.00'),
  });

  it('maps success to ADR wire format', () => {
    const telemetry = TransferProcessedTelemetry.fromResult(transferSuccess(instruction));

    expect(telemetry.outcome).toBe('succeeded');
    expect(telemetry.toLogEntry()).toEqual({
      event: 'transfer.processed',
      outcome: 'succeeded',
      reason_code: null,
      transfer_id: instruction.transferId.toString(),
      from: '1111234522226789',
      to: '1212343433335665',
    });
    expect(telemetry.toMetricIncrement()).toEqual({
      name: 'transfer.processed',
      outcome: 'succeeded',
      reason: null,
    });
  });

  it('maps failure reason codes to log and metric tags', () => {
    const telemetry = TransferProcessedTelemetry.fromResult(
      transferFailure(instruction, 'source_not_found'),
    );

    expect(telemetry.outcome).toBe('failed');
    expect(telemetry.toLogEntry().reason_code).toBe('source_not_found');
    expect(telemetry.toMetricIncrement().reason).toBe('source_not_found');
  });

  it('maps skipped transfers to skipped wire format', () => {
    const telemetry = TransferProcessedTelemetry.fromResult(transferSkipped(instruction));

    expect(telemetry.outcome).toBe('skipped');
    expect(telemetry.toLogEntry().reason_code).toBe('already_processed');
  });
});
