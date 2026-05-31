using FluentAssertions;
using MableBank.Application;
using MableBank.Application.Telemetry;
using MableBank.Domain;

namespace MableBank.Tests.Application;

public sealed class TransferProcessedTelemetryTests
{
    [Fact]
    public void FromResult_success_maps_to_adr_wire_format()
    {
        var instruction = TransferInstruction.Create(
            AccountNumber.Parse("1111234522226789"),
            AccountNumber.Parse("1212343433335665"),
            Money.Parse("10.00"));

        var telemetry = TransferProcessedTelemetry.FromResult(TransferResult.CreateSuccess(instruction));

        telemetry.OutcomeWire.Should().Be("succeeded");
        telemetry.ReasonCode.Should().BeNull();
        telemetry.ToLogEntry().Should().BeEquivalentTo(new TransferProcessedLogEntry(
            TransferProcessedTelemetry.EventName,
            "succeeded",
            null,
            telemetry.TransferId.Value,
            "1111234522226789",
            "1212343433335665"));
        telemetry.ToMetricIncrement().Should().BeEquivalentTo(new MetricIncrement(
            TransferProcessedTelemetry.MetricName,
            "succeeded",
            null));
    }

    [Fact]
    public void FromResult_failure_maps_reason_code_to_log_and_metric_tags()
    {
        var instruction = TransferInstruction.Create(
            AccountNumber.Parse("9999999999999999"),
            AccountNumber.Parse("1212343433335665"),
            Money.Parse("1.00"));

        var telemetry = TransferProcessedTelemetry.FromResult(
            TransferResult.CreateFailure(instruction, TransferFailureReason.SourceNotFound));

        telemetry.OutcomeWire.Should().Be("failed");
        telemetry.ReasonCode.Should().Be("source_not_found");
        telemetry.ToLogEntry().ReasonCode.Should().Be("source_not_found");
        telemetry.ToMetricIncrement().Reason.Should().Be("source_not_found");
    }

    [Fact]
    public void FromResult_skipped_maps_to_skipped_wire_format()
    {
        var instruction = TransferInstruction.Create(
            AccountNumber.Parse("1111234522226789"),
            AccountNumber.Parse("1212343433335665"),
            Money.Parse("1.00"));

        var telemetry = TransferProcessedTelemetry.FromResult(TransferResult.CreateSkipped(instruction));

        telemetry.Outcome.Should().Be(TransferOutcome.Skipped);
        telemetry.OutcomeWire.Should().Be("skipped");
        telemetry.ReasonCode.Should().Be("already_processed");
    }
}
