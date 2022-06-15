namespace VistaLab.QueryApi.Models
{
    public sealed record DataChannelResponse
    {
        public string? Query { get; set; }
        public Column[]? Columns { get; set; }
        public List<object[]>? Dataset { get; set; }
        public IEnumerable<DataChannelDto>? DataChannels
        {
            get =>
                Dataset?.Select(
                    ds =>
                        new DataChannelDto(
                            (string)ds[0],
                            (string)ds[1],
                            (string)ds[2],
                            (string)ds[3],
                            (double?)ds[4],
                            (double?)ds[5],
                            (string?)ds[6],
                            (double?)ds[7],
                            (double?)ds[8],
                            (string?)ds[9],
                            (string?)ds[10],
                            (string?)ds[11],
                            (string?)ds[12],
                            (string?)ds[13],
                            (string?)ds[14],
                            (string?)ds[15],
                            (int?)ds[16],
                            (double?)ds[17],
                            (double?)ds[18],
                            (int?)ds[19],
                            (double?)ds[20],
                            (double?)ds[21],
                            (int?)ds[22],
                            (int?)ds[23],
                            (int?)ds[24],
                            (string?)ds[25],
                            (string)ds[26],
                            (string)ds[27],
                            (string?)ds[28],
                            (string?)ds[29],
                            (string?)ds[30],
                            (string?)ds[31],
                            (string?)ds[32],
                            (string?)ds[33],
                            (string?)ds[34],
                            (string?)ds[35],
                            (string?)ds[36],
                            (DateTime)ds[37]
                        )
                ) ?? Array.Empty<DataChannelDto>();
        }
        public int? Count { get; set; }
    }
}

public sealed record Column(string Name, string Type);
