using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class UserDetailsDto : IDto<UserDetailsDto, UserDetails>
{
    public string? UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PreferredCurrency { get; set; }

    public static UserDetailsDto toDto(UserDetails entity) => new UserDetailsDto
    {
        UserId = entity.UserId,
        FirstName = entity.FirstName,
        LastName = entity.LastName,
        PreferredCurrency = entity.PreferredCurrency
    };
}
