using System.Net;
using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Consumer;
using ABCStoreAPI.Service.Consumer.Base;
using ABCStoreAPI.Service.Tests.Helpers;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;

namespace ABCStoreAPI.Service.Tests.Consumer;

public class FakestoreConsumerTest
{
    private Mock<IUnitOfWork> _uowMock = null!;
    private Mock<IProductRepository> _productRepositoryMock = null!;
    private Mock<IProductCategoryRepository> _productCategoryRepositoryMock = null!;
    private Mock<IProductImageRepository> _productImageRepositoryMock = null!;

    private Mock<ILogger<FakestoreConsumer>> _consumerLoggerMock = null!;
    private Mock<ILogger<ProductConsumerUtil>> _productUtilLoggerMock = null!;

    private IOptions<ApiConfig> _apiConfigOptions = null!;

    private readonly List<Product> addedProducts = new List<Product>();


    [SetUp]
    public void Setup()
    {
        _uowMock = new Mock<IUnitOfWork>();

        _productRepositoryMock = new Mock<IProductRepository>();
        _productRepositoryMock
            .Setup(r => r.Add(It.IsAny<Product>()))
            .Callback<Product>(addedProducts.Add);

        _productRepositoryMock
            .Setup(r => r.GetById(1))
            .Returns(() => addedProducts[0]);

        _productCategoryRepositoryMock = new Mock<IProductCategoryRepository>();
        _productImageRepositoryMock = new Mock<IProductImageRepository>();

        _consumerLoggerMock = new Mock<ILogger<FakestoreConsumer>>();
        _productUtilLoggerMock = new Mock<ILogger<ProductConsumerUtil>>();

        _uowMock.Setup(u => u.Products).Returns(_productRepositoryMock.Object);

        _uowMock.Setup(u => u.ProductCategories).Returns(_productCategoryRepositoryMock.Object);
        _uowMock.Setup(u => u.ProductImages).Returns(_productImageRepositoryMock.Object);

        _uowMock.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        var electronicsCategory = new ProductCategory { Id = 10, Name = "electronics" };

        _productCategoryRepositoryMock
            .Setup(pc => pc.GetByName("electronics"))
            .Returns(new List<ProductCategory> { electronicsCategory }.AsQueryable());

        _productRepositoryMock
            .Setup(p => p.GetByName(It.IsAny<string>()))
            .Returns(Enumerable.Empty<Product>().AsQueryable());

        _apiConfigOptions = Options.Create(new ApiConfig
        {
            FakestoreBaseUrl = "https://fake-store.test"
        });
    }

    [Test]
    public async Task ConsumeAsync_InvalidHttpClientResponse_LogsError()
    {
        var errorJson = @"{ ""error"": ""Invalid request"" }";

        var httpClient = HttpClientTestHelpers.CreateHttpClient(errorJson, HttpStatusCode.BadRequest);

        var productUtil = new ProductConsumerUtil(_uowMock.Object, _productUtilLoggerMock.Object);

        var consumer = new FakestoreConsumer(
            httpClient,
            _uowMock.Object,
            _apiConfigOptions,
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
        [
          {
            ""id"": 1,
            ""title"": ""Test Product One"",
            ""description"": ""Product one from Fakestore"",
            ""price"": 77.18,
            ""stock"": 5,
            ""category"": ""electronics"",
            ""image"": ""https://example.com/image_one.png"",
            ""thumbnail"": """"
          },
          {
            ""id"": 2,
            ""title"": ""Test Product Two"",
            ""description"": ""Product two from Fakestore"",
            ""price"": 123.45,
            ""stock"": 18,
            ""category"": ""electronics"",
            ""image"": ""https://example.com/image_two.png"",
            ""thumbnail"": ""https://example.com/thumb.png""
          }
        ]";

        var firebaseJson = @"
        {
            ""data"": [
                {
                    ""id"": 1,
                    ""url"": ""https://test.cloudfunctions.net/thumb.png""
                }   
            ]
        }";

        Environment.SetEnvironmentVariable("FIREBASE_FUNCTION_URL", "https://test.cloudfunctions.net/generateThumbnails");
        var httpClient = HttpClientTestHelpers.CreateHttpClient(json, HttpStatusCode.OK, firebaseJson);
        var productUtil = new ProductConsumerUtil(_uowMock.Object, _productUtilLoggerMock.Object);

        var consumer = new FakestoreConsumer(
            httpClient,
            _uowMock.Object,
            _apiConfigOptions,
            _consumerLoggerMock.Object,
            productUtil);

        await consumer.ConsumeAsync();

        _productRepositoryMock.Verify(p => p.Add(It.IsAny<Product>()), Times.Exactly(2));

        Assert.That(addedProducts.Any(prod =>
                prod.Name == "Test Product One" &&
                prod.Description == "Product one from Fakestore" &&
                prod.Price == 77.18m &&
                prod.StockQuantity == 5 &&
                prod.ProductCategoryId == 10 &&
                prod.ThumbnailUrl == "https://test.cloudfunctions.net/thumb.png"));

        Assert.That(addedProducts.Any(prod =>
                prod.Name == "Test Product Two" &&
                prod.Description == "Product two from Fakestore" &&
                prod.Price == 123.45m &&
                prod.StockQuantity == 18 &&
                prod.ProductCategoryId == 10 &&
                prod.ThumbnailUrl == "https://example.com/thumb.png"));

        _uowMock.Verify(u => u.CompleteAsync(), Times.AtLeastOnce);
    }

    [Test]
    public async Task ConsumeAsync_WhenProductAlreadyExists_DoesNotAddDuplicate()
    {
        var json = @"
        [
          {
            ""id"": 2,
            ""title"": ""Existing Product"",
            ""description"": ""Already in DB"",
            ""price"": 50.00,
            ""stock"": 10,
            ""category"": ""electronics"",
            ""image"": ""https://example.com/existing.png"",
            ""thumbnail"": ""https://example.com/existing-thumb.png""
          }
        ]";

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

        var consumer = new FakestoreConsumer(
            httpClient,
            _uowMock.Object,
            _apiConfigOptions,
            _consumerLoggerMock.Object,
            productUtil);

        await consumer.ConsumeAsync();

        _productRepositoryMock.Verify(
            p => p.Add(It.IsAny<Product>()),
            Times.Never);
    }

}
