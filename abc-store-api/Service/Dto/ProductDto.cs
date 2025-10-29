using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class ProductDto : IDto<ProductDto, Database.Model.Product>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string? ProductCategory { get; set; }
    public List<string>? ProductImages { get; set; }

    public static ProductDto toDto(Database.Model.Product product)
    {
        return new ProductDto
        {
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            ThumbnailUrl = product.ThumbnailUrl,
            ProductCategory = product.ProductCategory?.Name,
            ProductImages = product.ProductImages?.Select(img => img.Url).ToList()
        };
    }
}
