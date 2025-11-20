using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface ISupportedCurrenyRepository : IGenericRepository<SupportedCurrency> { }

public class SupportedCurrenyRepository : GenericRepository<SupportedCurrency>, ISupportedCurrenyRepository
{
    public SupportedCurrenyRepository(AppDbContext context) : base(context) { }

}
