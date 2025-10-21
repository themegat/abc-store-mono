using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface IProductCategoryRepository : IGenericRepository<ProductCategory>
{
    public IQueryable<ProductCategory> GetByName(string name);
}
public class ProductCategoryRepository : GenericRepository<ProductCategory>, IProductCategoryRepository
{
    public ProductCategoryRepository(AppDbContext context) : base(context) { }

    public IQueryable<ProductCategory> GetByName(string name)
    {
        return _dbSet.Where(p => p.Name.Trim().ToLower() == name.Trim().ToLower());
    }
}
