using System.ComponentModel;

namespace QueryApi.Models;

public class DataChannelFilter
{
    [property: DefaultValue(new[] { "411/*/C101.31-*" })]
    public string[]? PrimaryItem { get; set; }

    [property: DefaultValue(null)]
    public string[]? SecondaryItem { get; set; }

    [property: DefaultValue(null)]
    public string[]? Meta { get; set; }
}
