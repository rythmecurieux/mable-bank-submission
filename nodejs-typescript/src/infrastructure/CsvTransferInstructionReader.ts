import { AccountNumber } from '../domain/AccountNumber.js';
import { Money } from '../domain/Money.js';
import {
  createTransferInstruction,
  type TransferInstruction,
} from '../domain/TransferInstruction.js';
import { TransferId } from '../domain/TransferId.js';
import type { TransferInstructionReader } from '../application/ports/readers.js';
import { CsvParseError, csvParseError } from './errors.js';
import { columnIndex, readCsvRecords, rowNumber } from './csv.js';

export class CsvTransferInstructionReader implements TransferInstructionReader {
  constructor(private readonly path: string) {}

  eachInstruction(callback: (instruction: TransferInstruction) => void): void {
    let records: ReturnType<typeof readCsvRecords>;
    try {
      records = readCsvRecords(this.path);
    } catch (error) {
      throw csvParseError(`Transactions file not found: ${this.path}`, error);
    }

    const fromIndex = columnIndex(records.headers, 'From');
    const toIndex = columnIndex(records.headers, 'To');
    const amountIndex = columnIndex(records.headers, 'Amount');
    const transferIdIndex = records.headers.findIndex(
      (header) => header.trim().toLowerCase() === 'transferid',
    );

    records.rows.forEach((row, index) => {
      callback(
        this.parseRow(row, rowNumber(index), fromIndex, toIndex, amountIndex, transferIdIndex),
      );
    });
  }

  readAll(): TransferInstruction[] {
    const instructions: TransferInstruction[] = [];
    this.eachInstruction((instruction) => {
      instructions.push(instruction);
    });
    return instructions;
  }

  private parseRow(
    row: string[],
    lineNumber: number,
    fromIndex: number,
    toIndex: number,
    amountIndex: number,
    transferIdIndex: number,
  ): TransferInstruction {
    const fromValue = row[fromIndex];
    const toValue = row[toIndex];
    const amountValue = row[amountIndex];
    if (!fromValue || !toValue || !amountValue) {
      throw new CsvParseError(`Row ${String(lineNumber)}: missing From, To, or Amount`);
    }

    try {
      const transferIdValue = transferIdIndex >= 0 ? row[transferIdIndex] : undefined;
      const transferId =
        transferIdValue && transferIdValue.trim().length > 0
          ? TransferId.parse(transferIdValue)
          : undefined;
      return createTransferInstruction({
        fromAccountNumber: AccountNumber.parse(fromValue),
        toAccountNumber: AccountNumber.parse(toValue),
        amount: Money.fromDecimalString(amountValue),
        ...(transferId !== undefined ? { transferId } : {}),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw csvParseError(`Row ${String(lineNumber)}: ${message}`, error);
    }
  }
}
