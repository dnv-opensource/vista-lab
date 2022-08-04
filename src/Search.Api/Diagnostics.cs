using System.Diagnostics;
using Vista.SDK;

namespace Search.Api;

public static class Diagnostics
{
    public static readonly ActivitySource Source = new ActivitySource("Search", "1.0.0");

    public static void AddVisVersion(this Activity? activity, VisVersion visVersion) =>
        activity?.SetTag("visVersion", visVersion);

    public static void AddGmodNodeCode(this Activity? activity, string code) =>
        activity?.SetTag("gmodNodeCode", code);

    public static void AddGmodPathCount(this Activity? activity, long pathCount) =>
        activity?.SetTag("gmodPathCount", pathCount);

    public static void AddIndexDocumentCount(this Activity? activity, long documentCount) =>
        activity?.SetTag("indexDocumentCount", documentCount);
}
