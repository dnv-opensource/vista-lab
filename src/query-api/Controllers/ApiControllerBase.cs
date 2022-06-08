using Microsoft.AspNetCore.Mvc;

[Produces("application/json")]
[Consumes("application/json")]
public abstract class ApiControllerBase<T> : ControllerBase where T : ApiControllerBase<T>
{
    private ILogger<T>? _logger;
    private IConfiguration? _configuration;

    protected ILogger<T> Logger =>
        _logger ??= HttpContext.RequestServices.GetRequiredService<ILogger<T>>();

    protected IConfiguration Configuration =>
        _configuration ??= HttpContext.RequestServices.GetRequiredService<IConfiguration>();
}
