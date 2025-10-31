using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface ICartRepository : IGenericRepository<Cart>
{
    public IQueryable<Cart> GetByUserIdAndStatus(string userId, CartStatus status);
}

public class CartRepository : GenericRepository<Cart>, ICartRepository
{
    public CartRepository(AppDbContext appDbContext) : base(appDbContext) { }

    public IQueryable<Cart> GetByUserIdAndStatus(string userId, CartStatus status)
    {
        return _dbSet.Where(c => c.UserId.Equals(userId) && c.Status.Equals(status));
    }
}
