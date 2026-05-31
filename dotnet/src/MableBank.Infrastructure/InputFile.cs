namespace MableBank.Infrastructure;

public sealed class InputFileValidationException : Exception
{
    public InputFileValidationException()
    {
    }

    public InputFileValidationException(string message)
        : base(message)
    {
    }

    public InputFileValidationException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}

public static class InputFile
{
    private const long MaxBytes = 10 * 1024 * 1024;

    public static string Validate(string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            throw new InputFileValidationException("Path is required");
        }

        var expanded = Path.GetFullPath(path);
        var fileInfo = new FileInfo(expanded);
        if (!fileInfo.Exists)
        {
            throw new InputFileValidationException($"File not found: {path}");
        }

        if (fileInfo.LinkTarget is not null)
        {
            throw new InputFileValidationException($"Not a regular file: {path}");
        }

        if (fileInfo.Length > MaxBytes)
        {
            throw new InputFileValidationException(
                $"File too large (max {MaxBytes} bytes): {path}");
        }

        return expanded;
    }
}
