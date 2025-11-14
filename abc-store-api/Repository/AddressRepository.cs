using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Database.Model;

namespace ABCStoreAPI.Repository;

public interface IAddressRepository: IGenericRepository<Address>
{
    
}

 [ExcludeFromCodeCoverage]
public class AddressRepository: GenericRepository<Address>, IAddressRepository
{
    public AddressRepository(AppDbContext context): base(context)
    {
        
    }
}
