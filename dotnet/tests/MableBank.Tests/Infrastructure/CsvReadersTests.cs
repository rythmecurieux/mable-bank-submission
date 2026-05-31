using FluentAssertions;
using MableBank.Domain;
using MableBank.Infrastructure;

namespace MableBank.Tests.Infrastructure;

public sealed class CsvReadersTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    [Fact]
    public async Task Reads_account_balances_with_headers()
    {
        var accounts = await AsyncTestHelpers.ToListAsync(
            new CsvAccountBalanceReader(FixturePath("mable_account_balances.csv")).ReadAccountsAsync());
        accounts.Should().HaveCount(5);
    }

    [Fact]
    public async Task Reads_transfer_instructions_with_headers()
    {
        var instructions = await new CsvTransferInstructionReader(FixturePath("mable_transactions.csv"))
            .ReadAllAsync();
        instructions.Should().HaveCount(4);
    }

    [Fact]
    public async Task Rejects_missing_and_malformed_files()
    {
        Func<Task> missing = async () => await AsyncTestHelpers.ToListAsync(
            new CsvAccountBalanceReader("missing.csv").ReadAccountsAsync());
        await missing.Should().ThrowAsync<CsvParseException>();

        var tempPath = Path.Combine(Path.GetTempPath(), $"mable-balances-{Guid.NewGuid():N}.csv");
        await File.WriteAllTextAsync(tempPath, "Account,Balance\n1111234522226789\n");
        try
        {
            Func<Task> malformed = async () => await AsyncTestHelpers.ToListAsync(
                new CsvAccountBalanceReader(tempPath).ReadAccountsAsync());
            await malformed.Should().ThrowAsync<CsvParseException>();
        }
        finally
        {
            File.Delete(tempPath);
        }
    }
}
