using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class CartProductDto : IDto<CartProductDto, CartProduct>
{
    [Required]
    public int Quantity { get; set; }

    [Required]
    public int ProductId { get; set; }
    public ProductDto? Product { get; set; }

    public static CartProductDto toDto(CartProduct cartProduct)
    {
        return new CartProductDto
        {
            Quantity = cartProduct.Quantity,
            ProductId = cartProduct.ProductId,
            Product = cartProduct.Product == null ? null : ProductDto.toDto(cartProduct.Product)
        };
    }
}
