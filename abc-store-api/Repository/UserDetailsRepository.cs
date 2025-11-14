using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Repository;

public interface IUserDetailsRepository : IGenericRepository<UserDetails>
{
    public UserDetails? GetByUserId(string userId);
}

 [ExcludeFromCodeCoverage]
public class UserDetailsRepository : GenericRepository<UserDetails>, IUserDetailsRepository
{
    public UserDetailsRepository(AppDbContext context) : base(context) { }

    public UserDetails? GetByUserId(string userId)
    {
        return _dbSet.Where(x => x.UserId == userId)
        .Include(u => u.BillingAddress)
        .FirstOrDefault();
    }
}
