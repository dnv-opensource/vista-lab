using QuestDB;

namespace IngestApi.Repositories;

public static class QuestDbExtensions
{
    public static LineTcpSender TrySymbol(
        this LineTcpSender client,
        ReadOnlySpan<char> symbolName,
        string? value
    )
    {
        if (value is null)
            return client;

        return client.Symbol(symbolName, value);
    }

    public static LineTcpSender TryColumn(
        this LineTcpSender client,
        ReadOnlySpan<char> columnName,
        string? value
    )
    {
        if (value is null)
            return client;

        return client.Column(columnName, value);
    }

    public static LineTcpSender TryColumn(
        this LineTcpSender client,
        ReadOnlySpan<char> columnName,
        double? value
    )
    {
        if (value is null)
            return client;

        return client.Column(columnName, value.Value);
    }

    public static LineTcpSender TryColumn(
        this LineTcpSender client,
        ReadOnlySpan<char> columnName,
        long? value
    )
    {
        if (value is null)
            return client;

        return client.Column(columnName, value.Value);
    }
}
