using System.Text.Json.Serialization;

namespace ABCStoreAPI.Database.Model;

[JsonConverter(typeof(JsonStringEnumConverter<CartStatus>))]
public enum CartStatus
{
    IN_PROGRESS,
    COMPLETE
}

public class CartProduct : BaseEntity
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public int CartId { get; set; }

    public Product? Product { get; set; }
    public Cart? Cart { get; set; }
}

public class Cart : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public CartStatus Status { get; set; }

    public List<CartProduct> CartProducts { get; set; } = new List<CartProduct>();
}
