namespace ABCStoreAPI.Database.Model;

public class UserDetails : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PreferredCurrency { get; set; } = string.Empty;
}
