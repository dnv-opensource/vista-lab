using Common.Models;

namespace VistaLab.QueryApi.Models
{
    public sealed record TimeSeriesResponse : BaseResponse
    {
        public IEnumerable<TimeSeriesDto>? TimeSeries
        {
            get =>
                Dataset?.Select(
                    ds =>
                        new TimeSeriesDto(
                            (string)ds[0],
                            (string)ds[1],
                            (string?)ds[2],
                            (string?)ds[3],
                            (DateTime)ds[4]
                        )
                ) ?? Array.Empty<TimeSeriesDto>();
        }
    }
}