
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;

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

    public async Task PersistProductImages(string name, List<string> imageUrls, string user)
    {
        var product = _uow.Products.GetByName(name).ToList().FirstOrDefault();

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
}
