using System;
using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Consumer.Base;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace ABCStoreAPI.Service;

class ExchangerateapiConsumable
{
    [JsonProperty("time_last_update_unix")]
    public long TimeLastUpdateUnix { get; set; }

    [JsonProperty("time_last_update_utc")]
    public string TimeLastUpdateUtc { get; set; } = string.Empty;

    [JsonProperty("time_next_update_unix")]
    public long TimeNextUpdateUnix { get; set; }

    [JsonProperty("time_next_update_utc")]
    public string TimeNextUpdateUtc { get; set; } = string.Empty;

    [JsonProperty("base_code")]
    public string BaseCode { get; set; } = string.Empty;

    [JsonProperty("conversion_rates")]
    public Dictionary<string, decimal> ConversionRates { get; set; } = new Dictionary<string, decimal>();
}

public class ExchangerateapiConsumer : IConsumer
{
    private readonly ILogger<ExchangerateapiConsumer> _logger;
    private readonly string _apiKey;
    private readonly string _baseCurrency;
    private readonly string _apiUrl;

    public ExchangerateapiConsumer(HttpClient httpClient,
    ILogger<ExchangerateapiConsumer> logger, IUnitOfWork uow,
    IOptions<ApiConfig> apiConfig) : base(httpClient, uow)
    {
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("EXCHANGE_RATE_API_KEY") ?? "";
        _baseCurrency = apiConfig.Value.ExchangeRate.BaseCurrency;
        _apiUrl = apiConfig.Value.ExchangeRate.Url;
    }

    private async Task PersistExchangeRates(ExchangerateapiConsumable consumable)
    {
        int count = 0;

        var supportedCurrencies = _uow.SupportedCurrencies.GetAll().ToList();

        foreach (var currency in supportedCurrencies)
        {
            var exchangeRates = consumable.ConversionRates.ToList();
            var rateEntry = exchangeRates.FindAll(rateEntry => rateEntry.Key == currency.Code);

            if (rateEntry != null)
            {
                var exchangeRate = new ExchangeRate
                {
                    TimeLastUpdateUnix = consumable.TimeLastUpdateUnix,
                    TimeNextUpdateUnix = consumable.TimeNextUpdateUnix,
                    Rate = rateEntry.First().Value,
                    SupportedCurrencyId = currency.Id,
                    CreatedBy = SysUser,
                    UpdatedBy = SysUser
                };

                _uow.ExchangeRates.Add(exchangeRate);
                count++;
            }
        }

        await _uow.CompleteAsync();
        _logger.LogInformation("Imported {Count} exchange rates.", count);
    }

    override
    public async Task ConsumeAsync()
    {
        var response = await _httpClient.GetAsync($"{_apiUrl}/{_apiKey}/latest/{_baseCurrency}");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var exchangeRateResponse = JsonConvert.DeserializeObject<ExchangerateapiConsumable>(content);

        if (exchangeRateResponse != null)
        {
            if (await _uow.ExchangeRates.Truncate())
            {
                await PersistExchangeRates(exchangeRateResponse);
            }
            else
            {
                _logger.LogError("Failed to truncate ExchangeRate table, skipping import.");
            }
        }
    }
}
