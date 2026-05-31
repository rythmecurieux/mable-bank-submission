import { describe, expect, it } from 'vitest';
import { TransferResultRecorder } from '../../src/application/TransferResultRecorder.js';
import { transferFailure, transferSuccess } from '../../src/domain/TransferResult.js';
import { buildInstruction } from '../support/domainHelpers.js';

describe('TransferResultRecorder', () => {
  it('counts outcomes without storing every success', () => {
    const instruction = buildInstruction('1111234522226789', '1212343433335665', '10.00');
    const recorder = new TransferResultRecorder();

    recorder.record(transferSuccess(instruction));
    recorder.record(transferFailure(instruction, 'insufficient_funds'));

    expect(recorder.processedCount).toBe(2);
    expect(recorder.succeededCount).toBe(1);
    expect(recorder.failedCount).toBe(1);
    expect(recorder.failedResults).toHaveLength(1);
  });
});
