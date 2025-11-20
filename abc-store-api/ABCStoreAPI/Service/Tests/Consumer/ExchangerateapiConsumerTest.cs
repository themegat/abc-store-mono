using System.Net;
using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Tests.Helpers;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;

namespace ABCStoreAPI.Service.Tests.Consumer;

public class ExchangerateapiConsumerTest
{
    private Mock<IUnitOfWork> _uowMock = null!;
    private Mock<IExchangeRateRepository> _exchangeRateRepositoryMock = null!;
    private Mock<ISupportedCurrenyRepository> _supportedCurrenyRepositoryMock = null!;

    private Mock<ILogger<ExchangerateapiConsumer>> _consumerLoggerMock = null!;
    private IOptions<ApiConfig> _apiConfigOptions = null!;
    private readonly List<ExchangeRate> addedRates = new List<ExchangeRate>();

    private readonly string _json = @"
            {
                ""time_last_update_unix"": 1731612000,
                ""time_last_update_utc"": ""2024-11-15 00:00 UTC"",
                ""time_next_update_unix"": 1731698400,
                ""time_next_update_utc"": ""2024-11-16 00:00 UTC"",
                ""base_code"": ""USD"",
                ""conversion_rates"": {
                    ""USD"": 1.00,
                    ""EUR"": 0.92,
                    ""GBP"": 0.78,
                    ""JPY"": 151.45,
                    ""AUD"": 1.53,
                    ""ZAR"": 18.42,
                    ""KRW"": 1365.55
                }
            }";

    [SetUp]
    public void Setup()
    {
        _uowMock = new Mock<IUnitOfWork>();

        _exchangeRateRepositoryMock = new Mock<IExchangeRateRepository>();
        _supportedCurrenyRepositoryMock = new Mock<ISupportedCurrenyRepository>();

        _consumerLoggerMock = new Mock<ILogger<ExchangerateapiConsumer>>();

        _uowMock.Setup(u => u.ExchangeRates).Returns(_exchangeRateRepositoryMock.Object);
        _uowMock.Setup(u => u.SupportedCurrencies).Returns(_supportedCurrenyRepositoryMock.Object);

        _uowMock.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        var supportedCurrencies = new List<SupportedCurrency>
        {
            new SupportedCurrency { Id = 1, Code = "ZAR" },
            new SupportedCurrency { Id = 2, Code = "USD" },
            new SupportedCurrency { Id = 3, Code = "JPY" }
        };

        _supportedCurrenyRepositoryMock
        .Setup(s => s.GetAll())
                    .Returns(supportedCurrencies.AsQueryable());

        _exchangeRateRepositoryMock
            .Setup(r => r.Add(It.IsAny<ExchangeRate>()))
            .Callback<ExchangeRate>(addedRates.Add);

        _apiConfigOptions = Options.Create(new ApiConfig
        {
            ExchangeRate = new ExchangeRateConfig
            {
                BaseCurrency = "USD",
                Url = "https://test.exchangerate-api.com/test"
            }
        });

        Environment.SetEnvironmentVariable("EXCHANGE_RATE_API_KEY", "test_key");
    }

    [Test]
    public async Task ConsumeAsync_InvalidHttpClientResponse_LogsError()
    {
        var errorJson = @"{ ""error"": ""Invalid API key"" }";

        var httpClient = HttpClientTestHelpers.CreateHttpClient(errorJson, HttpStatusCode.Unauthorized);

        var consumer = new ExchangerateapiConsumer(
            httpClient,
        _consumerLoggerMock.Object,
         _uowMock.Object,
         _apiConfigOptions);

        await consumer.ConsumeAsync();

        _consumerLoggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) =>
                    v.ToString()!.Contains("Invalid API key") ||
                    v.ToString()!.Contains("Unauthorized")
                ),
                It.IsAny<Exception>(),
                (Func<It.IsAnyType, Exception?, string>)It.IsAny<object>()),
            Times.Once);
    }

    [Test]
    public async Task ConsumeAsync_ExchangeRateNotTruncated_LogsErrorAndSkips()
    {
        _uowMock.Setup(u => u.ExchangeRates.Truncate()).ReturnsAsync(false);

        var httpClient = HttpClientTestHelpers.CreateHttpClient(_json, HttpStatusCode.OK);

        var consumer = new ExchangerateapiConsumer(
            httpClient,
        _consumerLoggerMock.Object,
         _uowMock.Object,
         _apiConfigOptions);

        await consumer.ConsumeAsync();

        var errorMessage = "Failed to truncate ExchangeRate table, skipping import.";

        _consumerLoggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) =>
                    v.ToString()!.Contains(errorMessage)
                ),
                It.IsAny<Exception>(),
                (Func<It.IsAnyType, Exception?, string>)It.IsAny<object>()),
            Times.Once);
    }

    [Test]
    public async Task ConsumeAsync_ExchangeRateTruncated_AddsExchangeRatesAndSaves()
    {
        _uowMock.Setup(u => u.ExchangeRates.Truncate()).ReturnsAsync(true);

        var httpClient = HttpClientTestHelpers.CreateHttpClient(_json, HttpStatusCode.OK);

        var consumer = new ExchangerateapiConsumer(
            httpClient,
        _consumerLoggerMock.Object,
         _uowMock.Object,
         _apiConfigOptions);

        await consumer.ConsumeAsync();

        _uowMock.Verify(u => u.ExchangeRates.Truncate(), Times.Once);

        _exchangeRateRepositoryMock.Verify(r => r.Add(It.IsAny<ExchangeRate>()),
                                        Times.AtLeastOnce);

        Assert.That(addedRates.Any(r => r.Rate == 18.42m && r.SupportedCurrencyId == 1));
        Assert.That(addedRates.Any(r => r.Rate == 1.00m && r.SupportedCurrencyId == 2));
        Assert.That(addedRates.Any(r => r.Rate == 151.45m && r.SupportedCurrencyId == 3));

        _uowMock.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);

        _uowMock.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);
    }
}
