using MableBank.Domain;

namespace MableBank.Application;

/// <summary>Records transfer outcomes incrementally. Retains failures for reporting, not every success.</summary>
public sealed class TransferResultRecorder
{
    private readonly List<TransferResult> _failedResults = [];

    public IReadOnlyList<TransferResult> FailedResults => _failedResults;

    public int ProcessedCount { get; private set; }

    public int SucceededCount { get; private set; }

    public int FailedCount { get; private set; }

    public int SkippedCount { get; private set; }

    public TransferResult Record(TransferResult result)
    {
        ArgumentNullException.ThrowIfNull(result);
        ProcessedCount++;
        if (result.IsSuccess)
        {
            SucceededCount++;
        }
        else if (result.IsSkipped)
        {
            SkippedCount++;
        }
        else if (result.IsFailure)
        {
            FailedCount++;
            _failedResults.Add(result);
        }

        return result;
    }
}
