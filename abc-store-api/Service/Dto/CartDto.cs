using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class CartDto : IDto<CartDto, Cart>
{
    public int Id { get; set; }

    public string? UserId { get; set; }
    public CartStatus Status { get; set; }
    public List<CartProductDto> CartProducts { get; set; } = new List<CartProductDto>();

    public static CartDto toDto(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Status = cart.Status,
            CartProducts = cart.CartProducts.Select(CartProductDto.toDto).ToList()
        };

    }
}
