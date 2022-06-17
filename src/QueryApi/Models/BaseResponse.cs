namespace VistaLab.QueryApi.Models
{
    public record BaseResponse
    {
        public string? Query { get; set; }
        public Column[]? Columns { get; set; }
        public List<object[]>? Dataset { get; set; }
        public int? Count { get; set; }

        public sealed record Column(string Name, string Type);
    }
}
