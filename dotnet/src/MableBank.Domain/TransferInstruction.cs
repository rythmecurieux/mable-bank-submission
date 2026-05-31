using MableBank.Domain.Errors;

namespace MableBank.Domain;

public sealed record TransferInstruction(
    TransferId TransferId,
    AccountNumber FromAccountNumber,
    AccountNumber ToAccountNumber,
    Money Amount)
{
    public static TransferInstruction Create(
        AccountNumber fromAccountNumber,
        AccountNumber toAccountNumber,
        Money amount,
        TransferId? transferId = null) =>
        CreateWithId(transferId ?? TransferId.Derive(fromAccountNumber, toAccountNumber, amount), fromAccountNumber, toAccountNumber, amount);

    public static TransferInstruction CreateWithId(
        TransferId transferId,
        AccountNumber fromAccountNumber,
        AccountNumber toAccountNumber,
        Money amount)
    {
        if (amount.Amount == 0m)
        {
            throw new InvalidTransferInstructionException("Transfer amount must be positive");
        }

        if (fromAccountNumber.Equals(toAccountNumber))
        {
            throw new InvalidTransferInstructionException("Source and destination accounts must differ");
        }

        return new TransferInstruction(transferId, fromAccountNumber, toAccountNumber, amount);
    }
}
