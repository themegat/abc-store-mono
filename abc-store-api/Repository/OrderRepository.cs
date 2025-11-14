using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface IOrderRepository : IGenericRepository<Order>
{

}

[ExcludeFromCodeCoverage]
public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }
}
