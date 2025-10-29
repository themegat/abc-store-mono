namespace ABCStoreAPI.Service.Dto.Base;

public interface IDto<T, U>
{
    public abstract static T toDto(U entity);
}
