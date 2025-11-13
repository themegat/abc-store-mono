using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using ABCStoreAPI.Service.Tests.Base;
using Moq;
using NUnit.Framework;
using Soenneker.Utils.AutoBogus;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ABCStoreAPI.Service.Tests
{
    public class ProductServiceTest
    {
        private Mock<IUnitOfWork> _uowMock = null!;
        private Mock<IProductRepository> _productRepositoryMock = null!;
        private Mock<IProductCategoryRepository> _productCategoryRepositoryMock = null!;
        private Mock<IExchangeRateRepository> _exchangeRateRepositoryMock = null!;
        private ProductService _productService = null!;

        private List<ProductCategory> _categories = null!;
        private List<Product> _products = null!;
        private List<ExchangeRate> _exchangeRates = null!;

        [SetUp]
        public void Setup()
        {
            var autoFaker = new AutoFaker();

            _categories = autoFaker.Generate<ProductCategory>(3);
            _products = autoFaker.Generate<Product>(10);
            _exchangeRates = autoFaker.Generate<ExchangeRate>(3);

            var knownZarRate = _exchangeRates[0];
            knownZarRate.SupportedCurrency.Code = "ZAR";
            knownZarRate.Rate = 20m;

            _uowMock = new Mock<IUnitOfWork>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _productCategoryRepositoryMock = new Mock<IProductCategoryRepository>();
            _exchangeRateRepositoryMock = new Mock<IExchangeRateRepository>();

            _productCategoryRepositoryMock
                .Setup(r => r.GetAll())
                .Returns(new TestAsyncEnumerable<ProductCategory>(_categories));

            _uowMock
                .Setup(u => u.ProductCategories)
                .Returns(_productCategoryRepositoryMock.Object);

            _productRepositoryMock
                .Setup(r => r.FilterBy(
                    It.IsAny<ExchangeRate>(),
                    It.IsAny<string>(),
                    It.IsAny<int>(),
                    It.IsAny<decimal>(),
                    It.IsAny<decimal>(),
                    It.IsAny<bool>()))
                .Returns<ExchangeRate, string, int, decimal, decimal, bool>(
                    (rate, term, categoryId, minPrice, maxPrice, inStock) =>
                        new TestAsyncEnumerable<Product>(_products));

            _uowMock
                .Setup(u => u.Products)
                .Returns(_productRepositoryMock.Object);

            _exchangeRateRepositoryMock
                .Setup(r => r.GetByCurrency(It.IsAny<string>()))
                .Returns<string>(code =>
                {
                    var filtered = _exchangeRates
                        .Where(e => e.SupportedCurrency.Code == code)
                        .ToList();

                    return new TestAsyncEnumerable<ExchangeRate>(filtered);
                });

            _uowMock
                .Setup(u => u.ExchangeRates)
                .Returns(_exchangeRateRepositoryMock.Object);

            _productService = new ProductService(_uowMock.Object);
        }

        #region GetAllProductCategoriesAsync

        [Test]
        public async Task GetAllProductCategoriesAsync_ReturnsAllCategories()
        {
            var result = await _productService.GetAllProductCategoriesAsync();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(_categories.Count));
        }

        [Test]
        public async Task GetAllProductCategoriesAsync_WhenNoCategories_ReturnsEmptyList()
        {
            var emptyCategories = new List<ProductCategory>();

            _productCategoryRepositoryMock
                .Setup(r => r.GetAll())
                .Returns(new TestAsyncEnumerable<ProductCategory>(emptyCategories));

            var result = await _productService.GetAllProductCategoriesAsync();

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(0));
        }

        #endregion

        #region GetFilteredProductsAsync

        [Test]
        public async Task GetFilteredProductsAsync_UsdCurrency_DoesNotConvertPrice()
        {
            var autoFaker = new AutoFaker();
            var product = autoFaker.Generate<Product>();
            product.Price = 100m;

            var products = new List<Product> { product };

            _productRepositoryMock
                .Setup(r => r.FilterBy(
                    It.IsAny<ExchangeRate>(),
                    It.IsAny<string>(),
                    It.IsAny<int>(),
                    It.IsAny<decimal>(),
                    It.IsAny<decimal>(),
                    It.IsAny<bool>()))
                .Returns(new TestAsyncEnumerable<Product>(products));

            var page = new PagedRequest
            {
                PageNumber = 1,
                PageSize = 10
            };

            var result = await _productService.GetFilteredProductsAsync(
                page,
                searchTerm: "",
                categoryId: 0,
                minPrice: 0,
                maxPrice: decimal.MaxValue,
                inStock: true,
                currencyCode: "USD");

            dynamic dynResult = result;
            var items = (IEnumerable<ProductDto>)dynResult.Items;
            var dto = items.Single();

            Assert.That(dto.Price, Is.EqualTo(100m));
        }

        [Test]
        public async Task GetFilteredProductsAsync_NonUsdCurrency_ConvertsPriceUsingExchangeRate()
        {
            var autoFaker = new AutoFaker();
            var product = autoFaker.Generate<Product>();
            product.Price = 10m;

            var products = new List<Product> { product };

            _productRepositoryMock
                .Setup(r => r.FilterBy(
                    It.IsAny<ExchangeRate>(),
                    It.IsAny<string>(),
                    It.IsAny<int>(),
                    It.IsAny<decimal>(),
                    It.IsAny<decimal>(),
                    It.IsAny<bool>()))
                .Returns(new TestAsyncEnumerable<Product>(products));

            var zarRate = _exchangeRates[0];
            zarRate.SupportedCurrency.Code = "ZAR";
            zarRate.Rate = 20m;

            var page = new PagedRequest
            {
                PageNumber = 1,
                PageSize = 10
            };

            var result = await _productService.GetFilteredProductsAsync(
                page,
                searchTerm: "",
                categoryId: 0,
                minPrice: 0,
                maxPrice: decimal.MaxValue,
                inStock: true,
                currencyCode: "ZAR");

            dynamic dynResult = result;
            var items = (IEnumerable<ProductDto>)dynResult.Items;
            var dto = items.Single();

            Assert.That(dto.Price, Is.EqualTo(200m));
        }

        [Test]
        public async Task GetFilteredProductsAsync_PageNumberLessThanOne_NormalizesToOne()
        {
            var page = new PagedRequest
            {
                PageNumber = 0, 
                PageSize = 5
            };

            var result = await _productService.GetFilteredProductsAsync(
                page,
                searchTerm: "",
                categoryId: 0,
                minPrice: 0,
                maxPrice: decimal.MaxValue,
                inStock: true,
                currencyCode: "USD");

            dynamic dynResult = result;

            int pageNumber = dynResult.PageNumber;
            Assert.That(pageNumber, Is.EqualTo(1));
        }

        #endregion
    }
}
