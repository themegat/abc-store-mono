using System;

namespace ABCStoreAPI.Database.Model;

public class ExchangeRate : BaseEntity
{
    public long TimeLastUpdateUnix { get; set; }
    public long TimeNextUpdateUnix { get; set; }
    public decimal Rate { get; set; }

    public int SupportedCurrencyId { get; set; }
    public SupportedCurrency SupportedCurrency { get; set; } = null!;
}
