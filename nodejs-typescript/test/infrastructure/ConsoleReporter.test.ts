import { describe, expect, it } from 'vitest';
import { ProcessingReport } from '../../src/application/ProcessingReport.js';
import { TransferResultRecorder } from '../../src/application/TransferResultRecorder.js';
import { transferFailure, transferSuccess } from '../../src/domain/TransferResult.js';
import { formatReport } from '../../src/infrastructure/ConsoleReporter.js';
import { buildInstruction, exampleAccountBook } from '../support/domainHelpers.js';

describe('ConsoleReporter', () => {
  const instruction = buildInstruction('1111234522226789', '1212343433335665', '999999.00');

  function buildReport(dryRun = false): ProcessingReport {
    const recorder = new TransferResultRecorder();
    recorder.record(transferSuccess(instruction));
    recorder.record(transferFailure(instruction, 'insufficient_funds'));
    return new ProcessingReport(recorder, exampleAccountBook(), dryRun);
  }

  it('prints summary, final balances, and failed transfers', () => {
    const output = formatReport(buildReport());

    expect(output).toContain('Mable Bank Transfer Processing');
    expect(output).toContain('Transfers processed: 2');
    expect(output).toContain('Successful transfers: 1');
    expect(output).toContain('Failed transfers: 1');
    expect(output).toContain('Failed transfers:');
    expect(output).toContain('Insufficient funds');
  });

  it('labels dry run output clearly', () => {
    const recorder = new TransferResultRecorder();
    recorder.record(transferSuccess(instruction));
    const report = new ProcessingReport(recorder, exampleAccountBook(), true);

    const output = formatReport(report);

    expect(output).toContain('dry run');
    expect(output).toContain('No balances were mutated during dry run.');
  });
});
