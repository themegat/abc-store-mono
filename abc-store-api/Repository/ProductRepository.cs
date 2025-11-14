using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface IProductRepository : IGenericRepository<Product>
{
    public IQueryable<Product> GetByName(string name);
    public IQueryable<Product> FilterBy(ExchangeRate exchangeRate, string searchTerm, int category,
            decimal minPrice, decimal maxPrice, bool inStock);

}

 [ExcludeFromCodeCoverage]
public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }

    public IQueryable<Product> GetByName(string name)
    {
        return _dbSet.Where(p => p.Name.Trim().ToLower() == name.Trim().ToLower());
    }


    public IQueryable<Product> FilterBy(ExchangeRate exchangeRate, string searchTerm = "", int categoryID = 0,
            decimal minPrice = decimal.Zero, decimal maxPrice = decimal.MaxValue, bool inStock = true)
    {
        searchTerm = searchTerm.Trim().ToLower();
        int stockLevel = inStock ? 1 : 0;
        var query = _dbSet
        .Where(p => p.Name.ToLower().Contains(searchTerm) || p.Description.ToLower().Contains(searchTerm))
        .Where(p => p.StockQuantity >= stockLevel)
        .Where(p => (p.Price * exchangeRate.Rate) >= minPrice && (p.Price * exchangeRate.Rate) <= maxPrice);
        if (categoryID > 0)
        {
            query = query.Where(p => p.ProductCategoryId == categoryID);
        }
        return query;
    }
}
