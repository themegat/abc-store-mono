using System.Diagnostics.CodeAnalysis;

namespace ABCStoreAPI.Database;

 [ExcludeFromCodeCoverage]
public abstract class DataSeeder
{
    protected readonly AppDbContext _context;
    protected ILogger<DataSeeder> _logger;
    protected const string SysUser = "system";

    public DataSeeder(AppDbContext context, ILogger<DataSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }
    public abstract Task SeedAsync();
}


