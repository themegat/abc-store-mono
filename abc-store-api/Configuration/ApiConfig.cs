namespace ABCStoreAPI.Configuration;

public class ExchangeRateConfig
{
    public string BaseCurrency { get; set; } = "";
    public string Url { get; set; } = "";
}

public class ApiConfig
{
    public string DummyjsonBaseUrl { get; set; } = "";
    public string FakestoreBaseUrl { get; set; } = "";
    public ExchangeRateConfig ExchangeRate { get; set; } = new ExchangeRateConfig();
    public string TokenIssuer { get; set; } = "";
}
