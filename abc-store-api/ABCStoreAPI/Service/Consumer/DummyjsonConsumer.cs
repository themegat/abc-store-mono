using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Consumer.Base;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace ABCStoreAPI.Service.Consumer;

class DummyjsonProductConsumable : ProductConsumable { }

class DummyjsonProductResponse
{
    public List<DummyjsonProductConsumable>? products { get; set; }
}

public class DummyjsonConsumer : IConsumer
{
    private readonly ILogger<DummyjsonConsumer> _logger;
    private readonly string _baseUrl;
    private readonly ProductConsumerUtil _productConsumerUtil;

    public DummyjsonConsumer(HttpClient httpClient, IOptions<ApiConfig> apiConfig,
    IUnitOfWork uow, ILogger<DummyjsonConsumer> logger,
    ProductConsumerUtil productConsumerUtil) : base(httpClient, uow)
    {
        _productConsumerUtil = productConsumerUtil;
        _baseUrl = apiConfig.Value.DummyjsonBaseUrl;
        _logger = logger;
    }

    private async Task ImportProductsAsync(List<DummyjsonProductConsumable> products)
    {
        int newCount = 0;
        int duplicateCount = 0;
        foreach (var product in products)
        {
            var newProduct = new Product()
            {
                Name = product.Title,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.Stock,
                ThumbnailUrl = product.Thumbnail
            };
            newProduct.CreatedAt = DateTime.UtcNow;
            newProduct.UpdatedAt = DateTime.UtcNow;
            newProduct.CreatedBy = SysUser;
            newProduct.UpdatedBy = SysUser;

            var category = _uow.ProductCategories.GetByName(product.Category).ToList().FirstOrDefault();
            if (category != null)
            {
                newProduct.ProductCategoryId = category.Id;
            }

            if (!_productConsumerUtil.IsExistingProduct(newProduct.Name))
            {
                newProduct.ProductImages = product.Images.Select(image => new ProductImage()
                {
                    Url = image,
                    ProductId = product.Id,
                    CreatedBy = SysUser,
                    UpdatedBy = SysUser
                })
                    .ToList();
                _uow.Products.Add(newProduct);
                await _uow.CompleteAsync();

                newCount++;
            }
            else
            {
                duplicateCount++;
            }
        }

        _logger.LogInformation("Added {Count} products. Skipped {Skipped} duplicate products.", newCount, duplicateCount);
    }

    override
    public async Task ConsumeAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/products");
            response.EnsureSuccessStatusCode();
            string data = await response.Content.ReadAsStringAsync();

            DummyjsonProductResponse result = JsonConvert.DeserializeObject<DummyjsonProductResponse>(data)!;

            if (result.products != null)
            {
                var categories = new HashSet<string>(result.products.Select(p => p.Category).Distinct().ToList());
                await _productConsumerUtil.ImportProductCategories(categories, SysUser);
                await ImportProductsAsync(result.products);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
        }
    }
}
