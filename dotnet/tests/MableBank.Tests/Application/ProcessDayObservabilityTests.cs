using FluentAssertions;
using MableBank.Application;
using MableBank.Application.Telemetry;
using MableBank.Infrastructure;

namespace MableBank.Tests.Application;

public sealed class ProcessDayObservabilityTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    [Fact]
    public async Task Records_adr_contract_for_each_transfer()
    {
        var logger = new RecordingLogger();
        var metrics = new RecordingMetrics();

        await new ProcessDay(
            new CsvAccountBalanceReader(FixturePath("mable_account_balances.csv")),
            new CsvTransferInstructionReader(FixturePath("mable_transactions.csv")),
            logger: logger,
            metrics: metrics).CallAsync();

        metrics.Records.Should().HaveCount(4);
        metrics.Increments.Should().HaveCount(4);
        metrics.Increments.Should().OnlyContain(increment =>
            increment.Name == TransferProcessedTelemetry.MetricName);
        metrics.Increments.Should().OnlyContain(increment => increment.Outcome == "succeeded");
        metrics.Increments.Should().OnlyContain(increment => increment.Reason == null);

        logger.Entries.Should().HaveCount(4);
        logger.WireEntries.Should().HaveCount(4);
        logger.WireEntries.Should().OnlyContain(entry => entry.Event == TransferProcessedTelemetry.EventName);
        logger.WireEntries.Should().OnlyContain(entry => entry.Outcome == "succeeded");

        var firstEntry = logger.WireEntries[0];
        firstEntry.TransferId.Should().NotBeNullOrWhiteSpace();
        firstEntry.Event.Should().Be(TransferProcessedTelemetry.EventName);
        firstEntry.Outcome.Should().Be("succeeded");
        firstEntry.From.Should().Be("1111234522226789");
        firstEntry.To.Should().Be("1212343433335665");
    }
}
