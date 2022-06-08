namespace VistaLab.Api.Services;

public abstract class BaseService
{
    private readonly IServiceProvider _serviceProvider;
    private IDbSession? _dbSession;
    private IConfiguration? _configuration;

    protected IDbSession DbSession =>
        _dbSession ??= _serviceProvider.GetRequiredService<IDbSession>();

    protected IConfiguration Configuration =>
        _configuration ??= _serviceProvider.GetRequiredService<IConfiguration>();

    protected IServiceProvider ServiceProvider => _serviceProvider;

    protected BaseService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
}
