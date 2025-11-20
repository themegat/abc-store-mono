using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using ABCStoreAPI.Service.Validation;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Service;

public interface IProductService
{
    Task<List<ProductCategoryDto>> GetAllProductCategoriesAsync();
    Task<PagedResult<ProductDto>> GetFilteredProductsAsync(PagedRequest page,
        string searchTerm = "", int categoryId = 0, decimal minPrice = 0,
        decimal maxPrice = decimal.MaxValue, bool inStock = true, string currencyCode = "USD");
}

public class ProductService : IProductService
{
    private readonly IUnitOfWork _uow;

    public ProductService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<List<ProductCategoryDto>> GetAllProductCategoriesAsync()
    {
        var categories = await _uow.ProductCategories.GetAll().ToListAsync();
        return categories.Select(Dto.ProductCategoryDto.toDto).ToList();
    }

    [Validated]
    public async Task<PagedResult<ProductDto>> GetFilteredProductsAsync(PagedRequest page,
            string searchTerm = "", int categoryId = 0, decimal minPrice = 0,
            decimal maxPrice = decimal.MaxValue, bool inStock = true, string currencyCode = "USD")
    {
        var exchangeRate = GetExchangeRateAsync(currencyCode);
        page.PageNumber = Math.Max(1, page.PageNumber);
        int skip = (page.PageNumber - 1) * page.PageSize;

        var products = await _uow.Products.FilterBy(exchangeRate, searchTerm, categoryId, minPrice, maxPrice, inStock)
        .OrderBy(p => p.Id)
        .Skip(skip)
        .Take(page.PageSize)
        .Include(p => p.ProductCategory)
        .Include(p => p.ProductImages)
        .ToListAsync();

        var items = products.Select(ProductDto.toDto)
        .Select(p => { p.Price = ProductDto.ConvertPriceAsync(p.Price, currencyCode, exchangeRate).Result; return p; })
        .ToList();

        return PagedResult<ProductDto>.Build(page, items);
    }

    private ExchangeRate GetExchangeRateAsync(string targetCurrencyCode)
    {
        var exchangeRate = _uow.ExchangeRates
       .GetByCurrency(targetCurrencyCode);

        return exchangeRate.Any() ? exchangeRate.First() : new ExchangeRate();
    }
}
