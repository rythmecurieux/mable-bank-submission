using MableBank.Domain.Errors;

namespace MableBank.Domain;

public static class Reconciliation
{
    public static void Verify(CompanyAccountBook accountBook)
    {
        ArgumentNullException.ThrowIfNull(accountBook);
        VerifyBalances(accountBook.FinalBalances());
    }

    public static void VerifyBalances(IEnumerable<AccountBalance> balances)
    {
        ArgumentNullException.ThrowIfNull(balances);
        foreach (var snapshot in balances)
        {
            if (snapshot.Balance.IsNegative())
            {
                throw new ReconciliationException(
                    $"Negative balance on account {snapshot.AccountNumber}");
            }
        }
    }
}
