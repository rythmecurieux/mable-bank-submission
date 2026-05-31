using MableBank.Domain.Errors;

namespace MableBank.Domain;

public sealed class CompanyAccountBook
{
    private readonly Dictionary<AccountNumber, Account> _accounts = new();
    private ILedger _ledger = NullLedger.Instance;

    public CompanyAccountBook(IEnumerable<Account>? accounts = null)
    {
        if (accounts is null)
        {
            return;
        }

        foreach (var account in accounts)
        {
            AddAccount(account);
        }
    }

    public ILedger Ledger
    {
        get => _ledger;
        set => _ledger = value ?? NullLedger.Instance;
    }

    public void AddAccount(Account account)
    {
        ArgumentNullException.ThrowIfNull(account);
        if (_accounts.ContainsKey(account.AccountNumber))
        {
            throw new DuplicateAccountException(
                $"Duplicate account number: {account.AccountNumber}");
        }

        _accounts[account.AccountNumber] = CopyAccount(account);
    }

    public AccountBalance? BalanceFor(AccountNumber accountNumber)
    {
        if (!_accounts.TryGetValue(accountNumber, out var account))
        {
            return null;
        }

        return new AccountBalance(account.AccountNumber, account.Balance);
    }

    public TransferResult Transfer(TransferInstruction instruction)
    {
        ArgumentNullException.ThrowIfNull(instruction);
        var reason = Evaluate(instruction);
        if (reason is not null)
        {
            return TransferResult.CreateFailure(instruction, reason.Value);
        }

        _ledger.Atomic(() => Apply(instruction));
        return TransferResult.CreateSuccess(instruction);
    }

    public TransferResult Simulate(TransferInstruction instruction)
    {
        ArgumentNullException.ThrowIfNull(instruction);
        var reason = Evaluate(instruction);
        return reason is not null
            ? TransferResult.CreateFailure(instruction, reason.Value)
            : TransferResult.CreateSuccess(instruction);
    }

    public IReadOnlyList<AccountBalance> FinalBalances()
    {
        return _accounts.Values
            .Select(account => new AccountBalance(account.AccountNumber, account.Balance))
            .OrderBy(snapshot => snapshot.AccountNumber.Value, StringComparer.Ordinal)
            .ToList();
    }

    public Dictionary<AccountNumber, Money> CaptureBalanceSnapshot() =>
        _accounts.ToDictionary(pair => pair.Key, pair => pair.Value.Balance);

    public void RestoreBalanceSnapshot(Dictionary<AccountNumber, Money> snapshot)
    {
        ArgumentNullException.ThrowIfNull(snapshot);
        foreach (var (accountNumber, balance) in snapshot)
        {
            _accounts[accountNumber].ReplaceBalance(balance);
        }
    }

    private TransferFailureReason? Evaluate(TransferInstruction instruction)
    {
        if (!_accounts.TryGetValue(instruction.FromAccountNumber, out var source))
        {
            return TransferFailureReason.SourceNotFound;
        }

        if (!_accounts.ContainsKey(instruction.ToAccountNumber))
        {
            return TransferFailureReason.DestinationNotFound;
        }

        if (!source.CanDebit(instruction.Amount))
        {
            return TransferFailureReason.InsufficientFunds;
        }

        return null;
    }

    private void Apply(TransferInstruction instruction)
    {
        if (!_accounts.TryGetValue(instruction.FromAccountNumber, out var source)
            || !_accounts.TryGetValue(instruction.ToAccountNumber, out var destination))
        {
            throw new InvariantViolationException("apply called without successful evaluation");
        }

        source.Debit(instruction.Amount);
        destination.Credit(instruction.Amount);
    }

    private static Account CopyAccount(Account account) => account.Copy();
}
