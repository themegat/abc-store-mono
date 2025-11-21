using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;
using Microsoft.Extensions.Options;

namespace ABCStoreAPI.Service.Dto;

public class OrderDto : IDto<OrderDto, Order>
{
    [Required]
    [MinLength(1)]
    public required string UserId { get; set; }

    [Required]
    public required int CartId { get; set; }
    public DateTime? OrderDate { get; set; }
    public OrderStatus? Status { get; set; }
    public bool? IsPaid { get; set; }

    [Required]
    [ValidateObjectMembers]
    public required AddressDto ShippingAddress { get; set; }
    public CartDto? Cart { get; set; }
    public UserDetailsDto? UserDetails { get; set; }

    public static OrderDto toDto(Order entity) => new OrderDto
    {
        UserId = entity.UserDetails != null ? entity.UserDetails.UserId : string.Empty,
        CartId = entity.CartId,
        OrderDate = entity.OrderDate,
        Status = entity.Status,
        IsPaid = entity.IsPaid,
        ShippingAddress = AddressDto.toDto(entity.ShippingAddress),
        UserDetails = entity.UserDetails == null ? null : UserDetailsDto.toDto(entity.UserDetails),
        Cart = entity.Cart == null ? null : CartDto.toDto(entity.Cart)
    };

}
