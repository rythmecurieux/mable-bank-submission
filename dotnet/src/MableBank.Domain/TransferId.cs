using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using MableBank.Domain.Errors;

namespace MableBank.Domain;

public sealed record TransferId(string Value)
{
    public static TransferId Derive(AccountNumber from, AccountNumber to, Money amount)
    {
        var key = string.Join(
            '|',
            from.Value,
            to.Value,
            amount.Amount.ToString("F2", CultureInfo.InvariantCulture));
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(key));
        return new TransferId(Convert.ToHexString(hash));
    }

    public static TransferId Parse(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidTransferInstructionException("Transfer id cannot be blank");
        }

        return new TransferId(value.Trim());
    }
}
