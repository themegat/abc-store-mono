using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Repository;

public interface ICartRepository : IGenericRepository<Cart>
{
    public Cart? FindById(int id);
    public IQueryable<Cart> GetByUserIdAndStatus(string userId, CartStatus status);
}

public class CartRepository : GenericRepository<Cart>, ICartRepository
{
    public CartRepository(AppDbContext appDbContext) : base(appDbContext) { }

    public Cart? FindById(int id)
    {
        return _dbSet.Where(c => c.Id.Equals(id))
            .Include(c => c.CartProducts)
            .ThenInclude(cp => cp.Product)
            .FirstOrDefault();
    }
    public IQueryable<Cart> GetByUserIdAndStatus(string userId, CartStatus status)
    {
        return _dbSet.Where(c => c.UserId.Equals(userId) && c.Status.Equals(status));
    }
}
