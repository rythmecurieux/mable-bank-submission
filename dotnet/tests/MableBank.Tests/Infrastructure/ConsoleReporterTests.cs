using FluentAssertions;
using MableBank.Application;
using MableBank.Domain;
using MableBank.Infrastructure;

namespace MableBank.Tests.Infrastructure;

public sealed class ConsoleReporterTests
{
    private static CompanyAccountBook ExampleBook() =>
        new([
            new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("100.00")),
        ]);

    private static TransferInstruction ExampleInstruction() =>
        TransferInstruction.Create(
            AccountNumber.Parse("1111234522226789"),
            AccountNumber.Parse("1212343433335665"),
            Money.Parse("999999.00"));

    [Fact]
    public void Prints_summary_final_balances_and_failed_transfers()
    {
        var recorder = new TransferResultRecorder();
        recorder.Record(TransferResult.CreateSuccess(ExampleInstruction()));
        recorder.Record(TransferResult.CreateFailure(
            ExampleInstruction(),
            TransferFailureReason.InsufficientFunds));
        var report = new ProcessingReport(recorder, ExampleBook(), dryRun: false);

        var output = ConsoleReporter.FormatReport(report);

        output.Should().Contain("Mable Bank Transfer Processing");
        output.Should().Contain("Transfers processed: 2");
        output.Should().Contain("Successful transfers: 1");
        output.Should().Contain("Failed transfers: 1");
        output.Should().Contain("Failed transfers:");
        output.Should().Contain("Insufficient funds");
    }

    [Fact]
    public void Labels_dry_run_output_clearly()
    {
        var recorder = new TransferResultRecorder();
        recorder.Record(TransferResult.CreateSuccess(ExampleInstruction()));
        var report = new ProcessingReport(recorder, ExampleBook(), dryRun: true);

        var output = ConsoleReporter.FormatReport(report);

        output.Should().Contain("dry run");
        output.Should().Contain("No balances were mutated during dry run.");
    }
}
