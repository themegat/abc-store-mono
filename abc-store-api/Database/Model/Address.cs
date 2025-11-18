using System.Text.Json.Serialization;

namespace ABCStoreAPI.Database.Model;

[JsonConverter(typeof(JsonStringEnumConverter<AddressType>))]
public enum AddressType
{
    SHIPPING,
    BILLING
}

public class Address : BaseEntity
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public AddressType AddressType { get; set; }
}
