using Newtonsoft.Json;
using VistaLab.QueryApi.Models;

namespace VistaLab.QueryApi.Unit.Test.Models
{
    public class DataChannelResponseTest
    {
        private const int TOTAL_OF_DATA_CHANNELS = 90;
        private const string DATA_CHANNEL_SAMPLE_PATH = @"Models/data-channel-response.json";

        [Fact]
        public void Set_DataChannelResponse_GetDataChannelProperty()
        {
            //Arrange
            var path = Path.Combine(Directory.GetCurrentDirectory(), DATA_CHANNEL_SAMPLE_PATH);
            var str = File.ReadAllText(path);

            //Act
            var json = JsonConvert.DeserializeObject<DataChannelResponse>(str);
            var dataChannels = json?.DataChannels;

            //Assert
            Assert.NotNull(dataChannels);
            Assert.Equal(TOTAL_OF_DATA_CHANNELS, dataChannels?.Count);
        }
    }
}
