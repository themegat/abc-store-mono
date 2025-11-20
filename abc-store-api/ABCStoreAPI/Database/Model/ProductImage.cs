namespace ABCStoreAPI.Database.Model;

public class ProductImage : BaseEntity
{
    public string Url { get; set; } = string.Empty;

    // Foreign key to Product
    public int ProductId { get; set; }

    // Navigation property
    public Product ? Product { get; set; }

}
