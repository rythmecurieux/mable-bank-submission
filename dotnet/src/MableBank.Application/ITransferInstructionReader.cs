using MableBank.Domain;

namespace MableBank.Application;

public interface ITransferInstructionReader
{
    IAsyncEnumerable<TransferInstruction> ReadInstructionsAsync(CancellationToken cancellationToken = default);
}
