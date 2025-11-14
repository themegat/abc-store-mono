using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository.Base;

public interface ICartProductRepository : IGenericRepository<CartProduct>
{
    public IQueryable<CartProduct> GetByCartIdAndProductId(int cartId, int productId);
}

[ExcludeFromCodeCoverage]
public class CartProductRepository : GenericRepository<CartProduct>, ICartProductRepository
{
    public CartProductRepository(AppDbContext appDbContext) : base(appDbContext) { }

    public IQueryable<CartProduct> GetByCartIdAndProductId(int cartId, int productId)
    {
        return _dbSet.Where(cp => cp.CartId.Equals(cartId) && cp.ProductId.Equals(productId));
    }
}
