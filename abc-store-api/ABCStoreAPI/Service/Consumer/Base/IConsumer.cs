using ABCStoreAPI.Repository;

namespace ABCStoreAPI.Service.Consumer.Base;

public abstract class IConsumer
{
    protected const string SysUser = "system";
    protected readonly HttpClient _httpClient;
    protected readonly IUnitOfWork _uow;
    public abstract Task ConsumeAsync();

    public IConsumer(HttpClient httpClient, IUnitOfWork uow)
    {
        _httpClient = httpClient;
        _uow = uow;
    }

}
