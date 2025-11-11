using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface IUserDetailsRepository : IGenericRepository<UserDetails>
{
    public UserDetails? GetByUserId(string userId);
}
public class UserDetailsRepository : GenericRepository<UserDetails>, IUserDetailsRepository
{
    public UserDetailsRepository(AppDbContext context) : base(context) { }

    public UserDetails? GetByUserId(string userId)
    {
        return _dbSet.FirstOrDefault(x => x.UserId == userId);
    }
}
