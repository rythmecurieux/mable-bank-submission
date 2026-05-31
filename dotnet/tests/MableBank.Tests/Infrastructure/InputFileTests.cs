using FluentAssertions;
using MableBank.Infrastructure;

namespace MableBank.Tests.Infrastructure;

public sealed class InputFileTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    [Fact]
    public void Returns_expanded_path_for_readable_file()
    {
        var path = FixturePath("mable_account_balances.csv");
        InputFile.Validate(path).Should().Be(Path.GetFullPath(path));
    }

    [Fact]
    public void Rejects_missing_files()
    {
        Action act = () => InputFile.Validate("missing.csv");
        act.Should().Throw<InputFileValidationException>().WithMessage("*not found*");
    }

    [Fact]
    public void Rejects_empty_path()
    {
        Action act = () => InputFile.Validate("   ");
        act.Should().Throw<InputFileValidationException>().WithMessage("*required*");
    }
}
