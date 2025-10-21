using System;

namespace ABCStoreAPI.Database.Model;

public class SupportedCurrency : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
}
