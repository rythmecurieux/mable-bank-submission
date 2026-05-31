using System.Runtime.CompilerServices;
using MableBank.Application;
using MableBank.Domain;
using MableBank.Domain.Errors;
using MableBank.Infrastructure.Csv;

namespace MableBank.Infrastructure;

public sealed class CsvTransferInstructionReader : ITransferInstructionReader
{
    private readonly string _path;

    public CsvTransferInstructionReader(string path) => _path = path;

    public async IAsyncEnumerable<TransferInstruction> ReadInstructionsAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var rowNumber = 1;
        await foreach (var row in CsvRowReader.ReadRecordsAsync<TransferRow>(_path, cancellationToken)
                           .ConfigureAwait(false))
        {
            rowNumber++;
            yield return ParseRow(row, rowNumber);
        }
    }

    public async Task<IReadOnlyList<TransferInstruction>> ReadAllAsync(
        CancellationToken cancellationToken = default)
    {
        var instructions = new List<TransferInstruction>();
        await foreach (var instruction in ReadInstructionsAsync(cancellationToken).ConfigureAwait(false))
        {
            instructions.Add(instruction);
        }

        return instructions;
    }

    private static TransferInstruction ParseRow(TransferRow row, int rowNumber)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(row.From)
                || string.IsNullOrWhiteSpace(row.To)
                || string.IsNullOrWhiteSpace(row.Amount))
            {
                throw new CsvParseException($"Row {rowNumber}: missing From, To, or Amount");
            }

            var from = AccountNumber.Parse(row.From);
            var to = AccountNumber.Parse(row.To);
            var amount = Money.Parse(row.Amount);
            var transferId = string.IsNullOrWhiteSpace(row.TransferId)
                ? null
                : TransferId.Parse(row.TransferId);
            return TransferInstruction.Create(from, to, amount, transferId);
        }
        catch (Exception ex) when (ex is CsvParseException or DomainException)
        {
            throw new CsvParseException($"Row {rowNumber}: {ex.Message}", ex);
        }
    }

}
