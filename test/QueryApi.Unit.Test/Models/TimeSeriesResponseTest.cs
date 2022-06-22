using Newtonsoft.Json;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Unit.Test.Models
{
    public class TimeSeriesResponseTest
    {
        private const int TOTAL_OF_DATA_CHANNELS = 7;
        private const string TIME_SERIES_SAMPLE_PATH = @"Models/time-series-response.json";

        [Fact]
        public void Set_TimeSeriesResponse_GetDataChannelProperty()
        {
            //Arrange
            var path = Path.Combine(Directory.GetCurrentDirectory(), TIME_SERIES_SAMPLE_PATH);
            var str = File.ReadAllText(path);

            //Act
            var json = JsonConvert.DeserializeObject<TimeSeriesResponse>(str);
            var dataChannels = json?.TimeSeries;

            //Assert
            Assert.NotNull(dataChannels);
            Assert.Equal(TOTAL_OF_DATA_CHANNELS, dataChannels?.Count());
        }
    }
}
