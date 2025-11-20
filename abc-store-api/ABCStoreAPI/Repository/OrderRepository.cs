using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Repository;

public interface IOrderRepository : IGenericRepository<Order>
{
    public IQueryable<Order> GetByUserId(int id);
}
public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public IQueryable<Order> GetByUserId(int id)
    {
        return _dbSet.Where(o => o.UserId == id)
        .Include(o => o.ShippingAddress)
        .Include(o => o.UserDetails)
        .Include(o => o.Cart)
        .ThenInclude(c => c!.CartProducts)
        .ThenInclude(cp => cp.Product);
    }
}
