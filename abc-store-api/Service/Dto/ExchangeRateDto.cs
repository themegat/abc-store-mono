namespace ABCStoreAPI.Service.Dto;

public class ExchangeRateDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public string Symbol { get; set; } = string.Empty;

    public static ExchangeRateDto toDto(Database.Model.ExchangeRate exchangeRate)
    {
        return new ExchangeRateDto
        {
            Code = exchangeRate.SupportedCurrency.Code,
            Name = exchangeRate.SupportedCurrency.Name,
            Rate = exchangeRate.Rate,
            Symbol = exchangeRate.SupportedCurrency.Symbol
        };
    }
}
