namespace ABCStoreAPI.Database.Model;

public enum OrderStatus
{
    CREATED,
    PENDING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}

public class Order : BaseEntity
{
    public int UserId { get; set; }
    public int CartId { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public bool IsPaid { get; set; }
    public int AddressId { get; set; }

    public virtual UserDetails? UserDetails { get; set; }
    public virtual Cart? Cart { get; set; }
    public virtual required Address ShippingAddress { get; set; }
}
