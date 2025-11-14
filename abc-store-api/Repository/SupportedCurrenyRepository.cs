using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface ISupportedCurrenyRepository : IGenericRepository<SupportedCurrency> { }

[ExcludeFromCodeCoverage]
public class SupportedCurrenyRepository : GenericRepository<SupportedCurrency>, ISupportedCurrenyRepository
{
    public SupportedCurrenyRepository(AppDbContext context) : base(context) { }

}
