
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using Newtonsoft.Json;

namespace ABCStoreAPI.Service.Consumer.Base;

public class ProductConsumerUtil
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<ProductConsumerUtil> _logger;
    public ProductConsumerUtil(IUnitOfWork uow, ILogger<ProductConsumerUtil> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    public bool IsExistingProduct(string name) =>
     _uow.Products.GetByName(name).ToList().Count > 0;

    public bool IsExistingCategory(string name) =>
       _uow.ProductCategories.GetByName(name).ToList().Count > 0;

    public async Task ImportProductCategories(HashSet<string> categoryNames, string user)
    {
        int newCount = 0;
        int duplicateCount = 0;

        foreach (var categoryName in categoryNames)
        {
            if (!IsExistingCategory(categoryName))
            {
                var newCategory = new ProductCategory()
                {
                    Name = categoryName
                };
                newCategory.CreatedAt = DateTime.UtcNow;
                newCategory.UpdatedAt = DateTime.UtcNow;
                newCategory.CreatedBy = user;
                newCategory.UpdatedBy = user;

                _uow.ProductCategories.Add(newCategory);
                newCount++;
            }
            else
            {
                duplicateCount++;
            }
        }

        await _uow.CompleteAsync();
        _logger.LogInformation("Added {Count} product categories. Skipped {Skipped} duplicate categories.", newCount, duplicateCount);
    }

    public async Task PersistProductImages(int productId, List<string> imageUrls, string user)
    {
        var product = _uow.Products.GetById(productId);

        if (product != null)
        {
            foreach (var imageUrl in imageUrls)
            {

                var productImage = new ProductImage()
                {
                    Url = imageUrl,
                    ProductId = product.Id
                };
                productImage.CreatedAt = DateTime.UtcNow;
                productImage.UpdatedAt = DateTime.UtcNow;
                productImage.CreatedBy = user;
                productImage.UpdatedBy = user;

                _uow.ProductImages.Add(productImage);
            }

            await _uow.CompleteAsync();
        }
    }

    public async Task GenerateThumbnailsAsync(HttpClient httpClient, List<Tuple<int, string>> thumbnailsToGenerate)
    {
        var request = new FirebaseGenerateThumbnailRequest()
        {
            Size = 200,
            Images = thumbnailsToGenerate.Select(t => new GenerateImageData() { Id = t.Item1, Url = t.Item2 }).ToList()
        };

        var firebaseBaseUrl = Environment.GetEnvironmentVariable("FIREBASE_FUNCTION_URL");
        var response = await httpClient.PostAsJsonAsync(firebaseBaseUrl, request);
        response.EnsureSuccessStatusCode();
        string data = await response.Content.ReadAsStringAsync();

        FirebaseGenerateThumbnailResponse generatedThumbnails =
            JsonConvert.DeserializeObject<FirebaseGenerateThumbnailResponse>(data)!;

        foreach (var thumbnail in generatedThumbnails.Data)
        {
            var product = _uow.Products.GetById(thumbnail.Id);
            if (product != null)
            {
                product.ThumbnailUrl = thumbnail.Url;
                await _uow.CompleteAsync();
            }
        }
    }
}
