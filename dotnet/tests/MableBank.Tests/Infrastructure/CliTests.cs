using FluentAssertions;
using MableBank.Cli;

namespace MableBank.Tests.Infrastructure;

public sealed class CliTests
{
    [Fact]
    public void BuildRootCommand_exposes_dry_run_option_and_required_arguments()
    {
        var command = CliHost.BuildRootCommand();

        command.Options.Should().Contain(option => option.Name == "--dry-run");
        command.Arguments.Should().HaveCount(2);
        command.Arguments.Select(argument => argument.Name).Should().Equal("balances", "transactions");
    }

    [Fact]
    public async Task Run_returns_non_zero_when_arguments_missing()
    {
        (await CliHost.RunAsync([])).Should().Be(1);
    }
}
