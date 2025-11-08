using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class CartProductDto : IDto<CartProductDto, CartProduct>
{
    public int Quantity { get; set; }
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
