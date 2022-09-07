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
            var dataChannelListDtos = (await GetDataChannelLists(stoppingToken)).ToArray();
            var dataChannelCount = dataChannelListDtos.Length;

            var maxThreads = Math.Min(Math.Min(Environment.ProcessorCount, dataChannelCount), 16);
            var threads = new Task[maxThreads];

            _logger.LogInformation(
                "Max threads available: {maxThreads}, ProcessorCount: {processorCount}",
                maxThreads,
                Environment.ProcessorCount
            );

            for (int i = 0; i < maxThreads; i++)
            {
                // Assumes no more than 16 data channel lists
                var dataChannelDto = dataChannelListDtos[i];
                threads[i] = Task.Run(
                    () => _simulator.SimulateDataChannel(dataChannelDto, stoppingToken),
                    stoppingToken
                );
            }
        }

        public async Task<IEnumerable<DataChannelListPackage>> GetDataChannelLists(
            CancellationToken stoppingToken
        )
        {
            Stream GetResource(string resourceName)
            {
                return Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName)
                    ?? throw new Exception("Couldnt find file");
            }
            var assembly = Assembly.GetExecutingAssembly();
            var names = assembly.GetManifestResourceNames();
            var dataChannels = new List<DataChannelListPackage>();

            const string internalDelimiter = ".internal.";

            var useOnlyInternal = names.Any(
                n => n.Contains(internalDelimiter, StringComparison.OrdinalIgnoreCase)
            );

            foreach (
                var name in useOnlyInternal
                    ? names.Where(
                          n => n.Contains(internalDelimiter, StringComparison.OrdinalIgnoreCase)
                      )
                    : names
            )
            {
                await using var dataChannelsFile = GetResource(name);
                var dataChannelListDto = await Serializer.DeserializeDataChannelListAsync(
                    dataChannelsFile,
                    stoppingToken
                );
                if (dataChannelListDto is null)
                    throw new Exception("Couldnt load datachannels");

                _logger.LogInformation("Using internal datachannels from disk - {file}", name);

                dataChannels.Add(dataChannelListDto);
            }

            return dataChannels.ToArray();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
