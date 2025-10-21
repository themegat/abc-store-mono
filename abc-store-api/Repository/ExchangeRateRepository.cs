using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Repository;

public interface IExchangeRateRepository : IGenericRepository<ExchangeRate>
{
    public IQueryable<ExchangeRate> GetByCurrency(string currencyCode);
    public Task<bool> Truncate();
}

public class ExchangeRateRepository : GenericRepository<ExchangeRate>, IExchangeRateRepository
{
    public ExchangeRateRepository(AppDbContext context) : base(context)
    {
    }

    public IQueryable<ExchangeRate> GetByCurrency(string currencyCode)
    {
        currencyCode = currencyCode.Trim().ToUpper();
        return _dbSet.Where(er => er.SupportedCurrency.Code.ToUpper() == currencyCode);
    }

    public async Task<bool> Truncate()
    {
        var entityType = _context.Model.FindEntityType(typeof(ExchangeRate));
        if (entityType == null)
        {
            return false;
        }
        else
        {
            var tableName = entityType.GetTableName();
            string sql = $"TRUNCATE TABLE \"{tableName}\"";
            await _context.Database.ExecuteSqlRawAsync(sql);
            return true;
        }
    }
}
