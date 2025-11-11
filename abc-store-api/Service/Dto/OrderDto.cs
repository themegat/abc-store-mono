using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class OrderDto : IDto<OrderDto, Order>
{
    public string UserId { get; set; }
    public int CartId { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public bool IsPaid { get; set; }
    public AddressDto? ShippingAddress { get; set; }

    public static OrderDto toDto(Order entity) => new OrderDto
    {
        UserId = entity.UserDetails != null ? entity.UserDetails.UserId : string.Empty,
        CartId = entity.CartId,
        OrderDate = entity.OrderDate,
        Status = entity.Status,
        IsPaid = entity.IsPaid,
        ShippingAddress = entity.ShippingAddress != null ? AddressDto.toDto(entity.ShippingAddress) : null
    };

}
