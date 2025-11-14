using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using Moq;
using NUnit.Framework;
using Soenneker.Utils.AutoBogus;

using ABCStoreAPI.Service.Tests.Base;

namespace ABCStoreAPI.Service.Tests
{
    public class ExchangeRateServiceTest
    {
        private Mock<IUnitOfWork> _uowMock = null!;
        private Mock<IExchangeRateRepository> _exchangeRateRepositoryMock = null!;
        private ExchangeRateService _exchangeRateService = null!;

        private List<ExchangeRate> _exchangeRates = null!;

        [SetUp]
        public void Setup()
        {
            var autoFaker = new AutoFaker();

            _exchangeRates = autoFaker.Generate<ExchangeRate>(5);

            var knownRate = _exchangeRates[0];
            knownRate.SupportedCurrency.Code = "USD";
            knownRate.Rate = 19.99m;

            _uowMock = new Mock<IUnitOfWork>();
            _exchangeRateRepositoryMock = new Mock<IExchangeRateRepository>();

            _exchangeRateRepositoryMock
                .Setup(r => r.GetAll())
                .Returns(new TestAsyncEnumerable<ExchangeRate>(_exchangeRates));

            _exchangeRateRepositoryMock
                .Setup(r => r.GetByCurrency(It.IsAny<string>()))
                .Returns<string>(code =>
                {
                    var filtered = _exchangeRates
                        .Where(e => e.SupportedCurrency.Code == code)
                        .ToList();

                    return new TestAsyncEnumerable<ExchangeRate>(filtered);
                });

            _uowMock.Setup(u => u.ExchangeRates).Returns(_exchangeRateRepositoryMock.Object);

            _exchangeRateService = new ExchangeRateService(_uowMock.Object);
        }

        #region GetAllExchangeRatesAsync

        [Test]
        public async Task GetAllExchangeRatesAsync_ReturnsAllRates()
        {
            var result = await _exchangeRateService.GetAllExchangeRatesAsync();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(_exchangeRates.Count));

            var expectedCodes = _exchangeRates.Select(e => e.SupportedCurrency.Code).ToList();
            var resultCodes = result.Select(d => d.Code).ToList();
            Assert.That(resultCodes, Is.EquivalentTo(expectedCodes));
        }

        [Test]
        public async Task GetAllExchangeRatesAsync_WhenNoRates_ReturnsEmptyList()
        {
            var emptyList = new List<ExchangeRate>();
            _exchangeRateRepositoryMock
                .Setup(r => r.GetAll())
                .Returns(new TestAsyncEnumerable<ExchangeRate>(emptyList));

            var result = await _exchangeRateService.GetAllExchangeRatesAsync();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(0));
        }

        #endregion

        #region GetExchangeRateByCurrencyCodeAsync

        [Test]
        public async Task GetExchangeRateByCurrencyCodeAsync_WhenRateExists_ReturnsDto()
        {
            var usdRate = _exchangeRates[0];
            usdRate.SupportedCurrency.Code = "USD";
            usdRate.Rate = 19.99m;
            var result = await _exchangeRateService.GetExchangeRateByCurrencyCodeAsync("USD");

            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Code, Is.EqualTo("USD"));
            Assert.That(result.Rate, Is.EqualTo(19.99m));
        }

        [Test]
        public async Task GetExchangeRateByCurrencyCodeAsync_WhenRateDoesNotExist_ReturnsNull()
        {
            var result = await _exchangeRateService.GetExchangeRateByCurrencyCodeAsync("ZZZ");

            Assert.That(result, Is.Null);
        }

        #endregion
    }
}
