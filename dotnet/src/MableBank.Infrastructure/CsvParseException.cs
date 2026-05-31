namespace MableBank.Infrastructure;

public sealed class CsvParseException : Exception
{
    public CsvParseException()
    {
    }

    public CsvParseException(string message)
        : base(message)
    {
    }

    public CsvParseException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
