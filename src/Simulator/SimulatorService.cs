using ExcelDataReader;
using System.Reflection;
using Vista.SDK.Transport.Json;
using Vista.SDK.Transport.Json.DataChannel;

namespace Simulator
{
    public class SimulatorService : IHostedService
    {
        private readonly ILogger<SimulatorService> _logger;
        private readonly ISimulator _simulator;

        public SimulatorService(ILogger<SimulatorService> logger, ISimulator simulator)
        {
            _logger = logger;
            _simulator = simulator;
        }

        public async Task StartAsync(CancellationToken stoppingToken)
        {
            try
            {
                var vessels = (await GetDataChannelLists(stoppingToken)).ToArray();
                var dataChannelCount = vessels.Length;

                var maxThreads = Math.Min(
                    Math.Min(Environment.ProcessorCount, dataChannelCount),
                    16
                );
                var threads = new Task[maxThreads];

                _logger.LogInformation(
                    "Max threads available: {maxThreads}, ProcessorCount: {processorCount}",
                    maxThreads,
                    Environment.ProcessorCount
                );

                for (int i = 0; i < maxThreads; i++)
                {
                    // Assumes no more than 16 data channel lists
                    var vessel = vessels[i];
                    threads[i] = Task.Run(
                        () =>
                            _simulator.SimulateDataChannel(
                                vessel.DataChannels,
                                vessel.TimeSeries,
                                stoppingToken
                            ),
                        stoppingToken
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting simulator");
                throw;
            }
        }

        public async Task<
            IEnumerable<(DataChannelListPackage DataChannels, ExcelTimeSeriesFile? TimeSeries)>
        > GetDataChannelLists(CancellationToken stoppingToken)
        {
            Stream GetResource(string resourceName)
            {
                return Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName)
                    ?? throw new Exception("Couldnt find file");
            }
            var assembly = Assembly.GetExecutingAssembly();
            var names = assembly.GetManifestResourceNames();
            var dataChannels =
                new List<(DataChannelListPackage DataChannels, ExcelTimeSeriesFile? TimeSeries)>();

            const string internalDelimiter = ".internal.";

            var useOnlyInternal = names.Any(
                n => n.Contains(internalDelimiter, StringComparison.OrdinalIgnoreCase)
            );

            if (useOnlyInternal)
                names = names
                    .Where(n => n.Contains(internalDelimiter, StringComparison.OrdinalIgnoreCase))
                    .ToArray();

            foreach (
                var name in names.Where(n => n.EndsWith("json", StringComparison.OrdinalIgnoreCase))
            )
            {
                await using var dataChannelsFile = GetResource(name);
                var dataChannelListDto = await Serializer.DeserializeDataChannelListAsync(
                    dataChannelsFile,
                    stoppingToken
                );
                if (dataChannelListDto is null)
                    throw new Exception("Couldnt load datachannels");

                var nameStart = name.IndexOf(internalDelimiter) + internalDelimiter.Length;
                var nameEnd = name.IndexOf('-');
                var actualName = name.Substring(nameStart, nameEnd - nameStart);

                ExcelTimeSeriesFile? timeSeries = null;
                var timeSeriesName = names.FirstOrDefault(
                    n =>
                        n.Contains(actualName, StringComparison.OrdinalIgnoreCase)
                        && n.EndsWith("xlsx", StringComparison.OrdinalIgnoreCase)
                );
                if (timeSeriesName is not null)
                {
                    var timeSeriesFile = GetResource(timeSeriesName);
                    var reader = ExcelReaderFactory.CreateReader(timeSeriesFile);
                    timeSeries = new ExcelTimeSeriesFile(timeSeriesFile, reader);
                }

                _logger.LogInformation("Using internal datachannels from disk - {file}", name);

                dataChannels.Add((dataChannelListDto, timeSeries));
            }

            return dataChannels.ToArray();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}

public sealed record ExcelTimeSeriesFile(Stream FileStream, IExcelDataReader Reader)
    : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        Reader.Dispose();
        await FileStream.DisposeAsync();
    }
}
