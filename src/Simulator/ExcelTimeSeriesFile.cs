using ExcelDataReader;

public sealed record ExcelTimeSeriesFile(Stream FileStream, IExcelDataReader Reader)
    : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        Reader.Dispose();
        await FileStream.DisposeAsync();
    }
}
