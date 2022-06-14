namespace VistaLab.QueryApi.Models
{
    public sealed record DataChannelResponse
    {
        public string? Query { get; set; }
        public Column[]? Columns { get; set; }
        public List<object[]>? Dataset { get; set; }
        public List<DataChannelDto>? DataChannels
        {
            get
            {
                var props = typeof(DataChannelDto).GetProperties();
                var dataChannels = new List<DataChannelDto>();

                for (int i = 0; i < Dataset?.Count; i++)
                {
                    var dataChannel = new DataChannelDto();
                    for (int j = 0; j < Dataset[i].Length; j++)
                    {
                        props[j].SetValue(dataChannel, Dataset[i][j], null);
                    }
                    dataChannels.Add(dataChannel);
                }

                return dataChannels;
            }
        }
        public int? Count { get; set; }
    }
}

public sealed record Column(string Name, string Type);
