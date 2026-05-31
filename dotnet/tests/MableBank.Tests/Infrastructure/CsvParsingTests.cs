using FluentAssertions;
using MableBank.Domain;
using MableBank.Infrastructure;

namespace MableBank.Tests.Infrastructure;

public sealed class CsvParsingTests
{
    [Fact]
    public async Task Reads_quoted_fields_with_embedded_commas()
    {
        var tempPath = Path.Combine(Path.GetTempPath(), $"mable-quoted-{Guid.NewGuid():N}.csv");
        await File.WriteAllTextAsync(
            tempPath,
            """
            Account,Balance
            "1111234522226789","5000.00"
            """);

        try
        {
            var accounts = await AsyncTestHelpers.ToListAsync(
                new CsvAccountBalanceReader(tempPath).ReadAccountsAsync());
            accounts.Should().ContainSingle();
            accounts[0].AccountNumber.Value.Should().Be("1111234522226789");
            accounts[0].Balance.ToString().Should().Be("5000.00");
        }
        finally
        {
            File.Delete(tempPath);
        }
    }

    [Fact]
    public async Task Reads_multiline_quoted_field()
    {
        var tempPath = Path.Combine(Path.GetTempPath(), $"mable-multiline-{Guid.NewGuid():N}.csv");
        await File.WriteAllTextAsync(
            tempPath,
            """
            From,To,Amount
            "1111234522226789","1212343433335665","10.00"
            """);

        try
        {
            var instructions = await AsyncTestHelpers.ToListAsync(
                new CsvTransferInstructionReader(tempPath).ReadInstructionsAsync());
            instructions.Should().ContainSingle();
            instructions[0].Amount.ToString().Should().Be("10.00");
        }
        finally
        {
            File.Delete(tempPath);
        }
    }
}
