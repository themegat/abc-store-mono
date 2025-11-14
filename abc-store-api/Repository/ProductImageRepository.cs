using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface IProductImageRepository : IGenericRepository<ProductImage>
{
}

[ExcludeFromCodeCoverage]
public class ProductImageRepository : GenericRepository<ProductImage>, IProductImageRepository
{
    public ProductImageRepository(AppDbContext context) : base(context) { }
}
