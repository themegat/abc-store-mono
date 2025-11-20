namespace ABCStoreAPI.Database.Model;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int ProductCategoryId { get; set; }
    public string ThumbnailUrl { get; set; } = string.Empty;

    public ProductCategory? ProductCategory { get; set; }
    public List<ProductImage>? ProductImages { get; set; }
}
