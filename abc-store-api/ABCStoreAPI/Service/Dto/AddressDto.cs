using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class AddressDto : IDto<AddressDto, Address>
{
    [Required]
    [StringLength(200, MinimumLength = 5)]
    [Display(Name = "StreetAddress")]
    public required string AddressLine1 { get; set; }
    [Required]
    [StringLength(100, MinimumLength = 5)]
    [Display(Name = "Suburb")]
    public required string AddressLine2 { get; set; }
    [Required]
    [StringLength(10, MinimumLength = 3)]
    [Display(Name = "AreaCode")]
    public required string ZipCode { get; set; }
    [Required]
    public required AddressType AddressType { get; set; }

    public static AddressDto toDto(Address entity) => new AddressDto
    {
        AddressLine1 = entity.AddressLine1,
        AddressLine2 = entity.AddressLine2,
        ZipCode = entity.ZipCode,
        AddressType = entity.AddressType
    };
}
