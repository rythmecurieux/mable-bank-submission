using System.Diagnostics;
using FluentAssertions;
using MableBank.Cli;

namespace MableBank.Tests;

public sealed class CliIntegrationTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    [Fact]
    public void Demo_cli_runs_against_fixtures()
    {
        var cliAssembly = typeof(CliHost).Assembly.Location;

        var startInfo = new ProcessStartInfo
        {
            FileName = "dotnet",
            Arguments =
                $"exec \"{cliAssembly}\" \"{FixturePath("mable_account_balances.csv")}\" \"{FixturePath("mable_transactions.csv")}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };

        using var process = Process.Start(startInfo);
        process.Should().NotBeNull();
        process!.WaitForExit(TimeSpan.FromMinutes(2));
        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();

        process.ExitCode.Should().Be(0, $"stderr: {error}\nstdout: {output}");
        output.Should().Contain("1111234522226789: 4820.50");
        output.Should().Contain("Successful transfers: 4");
    }
}
