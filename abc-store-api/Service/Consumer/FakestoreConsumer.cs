
using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Consumer.Base;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace ABCStoreAPI.Service.Consumer;

class GenerateImageData
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
}

class FirebaseGenerateThumbnailRequest
{
    public int Size { get; set; }
    public List<GenerateImageData> Images { get; set; } = new List<GenerateImageData>();
}

class FirebaseGenerateThumbnailResponse
{
    public List<GenerateImageData> Data { get; set; } = new List<GenerateImageData>();
}

class FakestoreProductConsumable : ProductConsumable
{
    public string Image { get; set; }
}

public class FakestoreConsumer : IConsumer
{
    private readonly ProductConsumerUtil _productUtil;
    private readonly string _baseUrl;
    private readonly ILogger<FakestoreConsumer> _logger;

    public FakestoreConsumer(HttpClient httpClient, IUnitOfWork uow,
    IOptions<ApiConfig> apiConfig, ILogger<FakestoreConsumer> logger,
     ProductConsumerUtil productUtil) : base(httpClient, uow)
    {
        _productUtil = productUtil;
        _baseUrl = apiConfig.Value.FakestoreBaseUrl;
        _logger = logger;
    }

    private async Task ImportProductsAsync(List<FakestoreProductConsumable> products)
    {
        int newCount = 0;
        int duplicateCount = 0;
        List<Tuple<int, string>> thumbnailsToGenerate = new List<Tuple<int, string>>();

        foreach (var product in products)
        {
            var newProduct = new Product()
            {
                Name = product.Title,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.Stock,
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

            if (!_productUtil.IsExistingProduct(newProduct.Name))
            {
                if (string.IsNullOrWhiteSpace(product.Thumbnail) && !string.IsNullOrWhiteSpace(product.Image))
                {
                    thumbnailsToGenerate.Add(new Tuple<int, string>(product.Id, product.Image));
                }
                else
                {
                    newProduct.ThumbnailUrl = product.Thumbnail;
                }

                var productImage = new ProductImage()
                {
                    Url = product.Image,
                    ProductId = newProduct.Id,
                    CreatedBy = SysUser,
                    UpdatedBy = SysUser
                };
                newProduct.ProductImages = new List<ProductImage>() { productImage };

                _uow.Products.Add(newProduct);
                await _uow.CompleteAsync();

                newCount++;
            }
            else
            {
                duplicateCount++;
            }
        }

        await _productUtil.GenerateThumbnailsAsync(_httpClient, thumbnailsToGenerate);
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

            List<FakestoreProductConsumable> products =
            JsonConvert.DeserializeObject<List<FakestoreProductConsumable>>(data)!;

            var categories = new HashSet<string>(products.Select(p => p.Category).Distinct().ToList());

            await _productUtil.ImportProductCategories(categories, SysUser);
            await ImportProductsAsync(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
        }
    }
}
