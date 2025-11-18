using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class UserDetailsDto : IDto<UserDetailsDto, UserDetails>
{
    [Required]
    [StringLength(30, MinimumLength = 3)]
    public required string UserId { get; set; }
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public required string FirstName { get; set; }
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public required string LastName { get; set; }
    [Required]
    [StringLength(10, MinimumLength = 2)]
    public required string PreferredCurrency { get; set; }
    public string? ContactNumber { get; set; }
    public AddressDto? BillingAddress { get; set; }

    public static UserDetailsDto toDto(UserDetails entity) => new UserDetailsDto
    {
        UserId = entity.UserId,
        FirstName = entity.FirstName,
        LastName = entity.LastName,
        PreferredCurrency = entity.PreferredCurrency,
        ContactNumber = entity.ContactNumber,
        BillingAddress = entity.BillingAddress != null ? AddressDto.toDto(entity.BillingAddress) : null
    };
}
