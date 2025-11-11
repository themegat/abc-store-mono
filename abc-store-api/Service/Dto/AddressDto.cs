using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class AddressDto : IDto<AddressDto, Address>
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public AddressType AddressType { get; set; }

    public static AddressDto toDto(Address entity) => new AddressDto
    {
        AddressLine1 = entity.AddressLine1,
        AddressLine2 = entity.AddressLine2,
        ZipCode = entity.ZipCode,
        AddressType = entity.AddressType
    };
}
