using System.Net;
using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Consumer;
using ABCStoreAPI.Service.Consumer.Base;
using ABCStoreAPI.Service.Tests.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;

namespace ABCStoreAPI.Service.Tests.Consumer;

public class DummyjsonConsumerTest
{
    private Mock<IUnitOfWork> _uowMock = null!;
    private Mock<IProductRepository> _productRepositoryMock = null!;
    private Mock<IProductCategoryRepository> _productCategoryRepositoryMock = null!;
    private Mock<IProductImageRepository> _productImageRepositoryMock = null!;

    private Mock<ILogger<DummyjsonConsumer>> _consumerLoggerMock = null!;
    private Mock<ILogger<ProductConsumerUtil>> _productUtilLoggerMock = null!;

    private IOptions<ApiConfig> _apiConfigOptions = null!;

    [SetUp]
    public void Setup()
    {
        _uowMock = new Mock<IUnitOfWork>();

        _productRepositoryMock = new Mock<IProductRepository>();
        _productCategoryRepositoryMock = new Mock<IProductCategoryRepository>();
        _productImageRepositoryMock = new Mock<IProductImageRepository>();

        _consumerLoggerMock = new Mock<ILogger<DummyjsonConsumer>>();
        _productUtilLoggerMock = new Mock<ILogger<ProductConsumerUtil>>();

        _uowMock.Setup(u => u.Products).Returns(_productRepositoryMock.Object);
        _uowMock.Setup(u => u.ProductCategories).Returns(_productCategoryRepositoryMock.Object);
        _uowMock.Setup(u => u.ProductImages).Returns(_productImageRepositoryMock.Object);

        _uowMock.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        var groceriesCategory = new ProductCategory { Id = 5, Name = "groceries" };

        _productCategoryRepositoryMock
            .Setup(pc => pc.GetByName("groceries"))
            .Returns(new List<ProductCategory> { groceriesCategory }.AsQueryable());

        _productRepositoryMock
            .Setup(p => p.GetByName(It.IsAny<string>()))
            .Returns(Enumerable.Empty<Product>().AsQueryable());

        _apiConfigOptions = Options.Create(new ApiConfig
        {
            FakestoreBaseUrl = "https://dummy-json.test"
        });
    }

    [Test]
    public async Task ConsumeAsync_InvalidHttpClientResponse_LogsError()
    {
        var errorJson = @"{ ""error"": ""Invalid request"" }";

        var httpClient = HttpClientTestHelpers.CreateHttpClient(errorJson, HttpStatusCode.BadRequest);

        var productUtil = new ProductConsumerUtil(_uowMock.Object, _productUtilLoggerMock.Object);

        var consumer = new DummyjsonConsumer(
            httpClient,
            _apiConfigOptions,
            _uowMock.Object,
            _consumerLoggerMock.Object,
            productUtil
         );

        await consumer.ConsumeAsync();

        _consumerLoggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) =>
                    v.ToString()!.Contains("Invalid request") ||
                    v.ToString()!.Contains("Bad Request")
                ),
                It.IsAny<Exception>(),
                (Func<It.IsAnyType, Exception?, string>)It.IsAny<object>()),
            Times.Once);
    }

    [Test]
    public async Task ConsumeAsync_WhenNewProduct_AddsProductAndSaves()
    {
        var json = @"
       {
        ""products"":  [
                {
                    ""id"": 1,
                    ""title"": ""Test Product One"",
                    ""description"": ""A grocery product from DummyJson"",
                    ""price"": 123.45,
                    ""stock"": 5,
                    ""category"": ""groceries"",
                    ""images"": [""https://example.com/image-one.png"", ""https://example.com/image-two.png""],
                    ""thumbnail"": ""https://example.com/thumb.png""
                },
                  {
                    ""id"": 2,
                    ""title"": ""Test Product Two"",
                    ""description"": ""An electronic product from DummyJson"",
                    ""price"": 100.15,
                    ""stock"": 15,
                    ""category"": ""electronics"",
                    ""images"": [""https://example.com/image_three.png""],
                    ""thumbnail"": ""https://example.com/thumb_two.png""
                }
            ]
       }";

        var httpClient = HttpClientTestHelpers.CreateHttpClient(json, HttpStatusCode.OK);

        var productUtil = new ProductConsumerUtil(_uowMock.Object, _productUtilLoggerMock.Object);

        var consumer = new DummyjsonConsumer(
            httpClient,
            _apiConfigOptions,
            _uowMock.Object,
            _consumerLoggerMock.Object,
            productUtil);

        await consumer.ConsumeAsync();

        _productRepositoryMock.Verify(
            p => p.Add(It.Is<Product>(prod =>
                prod.Name == "Test Product Two" &&
                prod.Description == "An electronic product from DummyJson" &&
                prod.Price == 100.15m &&
                prod.StockQuantity == 15 &&
                prod.ProductCategoryId == 0
            )),
            Times.Once);

        _uowMock.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);
    }

    [Test]
    public async Task ConsumeAsync_WhenProductAlreadyExists_DoesNotAddDuplicate()
    {
        var json = @"
      {
        ""products"":   [
                {
                    ""id"": 2,
                    ""title"": ""Existing Product"",
                    ""description"": ""Already in DB"",
                    ""price"": 50.00,
                    ""stock"": 10,
                    ""category"": ""groceries"",
                    ""image"": [""https://example.com/existing.png""],
                    ""thumbnail"": ""https://example.com/existing-thumb.png""
                }
            ]
      }";

        var httpClient = HttpClientTestHelpers.CreateHttpClient(json, HttpStatusCode.OK);

        var existingProduct = new Product
        {
            Id = 99,
            Name = "Existing Product"
        };

        _productRepositoryMock
            .Setup(p => p.GetByName("Existing Product"))
            .Returns(new List<Product> { existingProduct }.AsQueryable());

        var productUtil = new ProductConsumerUtil(_uowMock.Object, _productUtilLoggerMock.Object);

        var consumer = new DummyjsonConsumer(
            httpClient,
            _apiConfigOptions,
            _uowMock.Object,
            _consumerLoggerMock.Object,
            productUtil);

        await consumer.ConsumeAsync();

        _productRepositoryMock.Verify(
            p => p.Add(It.IsAny<Product>()),
            Times.Never);
    }
}
