using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class CartDto : IDto<CartDto, Cart>
{
    public int? Id { get; set; }

    [Required]
    public string? UserId { get; set; }
    public CartStatus? Status { get; set; }
    
    [Required]
    [MinLength(1, ErrorMessage = "At least one cart product is required")]
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
