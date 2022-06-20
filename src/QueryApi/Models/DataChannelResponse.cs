using Common.Models;
using System.Dynamic;

namespace VistaLab.QueryApi.Models
{
    public sealed record DataChannelResponse : BaseResponse
    {
        public IEnumerable<DataChannelDto>? DataChannels
        {
            get =>
                Dataset?.Select(
                    ds =>
                        new DataChannelDto(
                            (string)ds[0],
                            (string?)ds[1],
                            (string)ds[2],
                            (string)ds[3],
                            (string?)ds[4],
                            (string)ds[5],
                            (double?)ds[6],
                            (double?)ds[7],
                            (string?)ds[8],
                            (double?)ds[9],
                            (double?)ds[10],
                            (string?)ds[11],
                            (string?)ds[12],
                            (string?)ds[13],
                            (string?)ds[14],
                            (string?)ds[15],
                            (string?)ds[16],
                            (string?)ds[17],
                            (int?)ds[18],
                            (int?)ds[19],
                            (int?)ds[20],
                            (int?)ds[21],
                            (int?)ds[22],
                            (int?)ds[23],
                            (int?)ds[24],
                            (int?)ds[25],
                            (int?)ds[26],
                            (string)ds[27],
                            (string)ds[28],
                            (string)ds[29],
                            (string?)ds[30],
                            (string?)ds[31],
                            (string?)ds[32],
                            (string?)ds[33],
                            (string?)ds[34],
                            (string?)ds[35],
                            (string?)ds[36],
                            (string?)ds[37],
                            (string?)ds[38],
                            (DateTime)ds[39]
                        )
                ) ?? Array.Empty<DataChannelDto>();
        }
    }
}
