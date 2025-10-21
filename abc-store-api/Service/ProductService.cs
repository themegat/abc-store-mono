using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Service;

public class ProductService
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

    public async Task<PagedResult<ProductDto>> GetFilteredProductsAsync(PagedRequest page,
        string searchTerm = "", int categoryId = 0, decimal minPrice = 0,
        decimal maxPrice = decimal.MaxValue, bool inStock = true, string currencyCode = "USD")
    {
        var exchangeRate = await GetExchangeRateAsync(currencyCode);
        page.PageNumber = Math.Max(1, page.PageNumber);
        int skip = (page.PageNumber - 1) * page.PageSize;

        var products = await _uow.Products.FilterBy(exchangeRate, searchTerm, categoryId, minPrice, maxPrice, inStock)
        .OrderBy(p => p.Id)
        .Skip(skip)
        .Take(page.PageSize)
        .Include(p => p.ProductCategory)
        .Include(p => p.ProductImages)
        .ToListAsync();

        var items = products.Select(Dto.ProductDto.toDto)
        .Select(p => { p.Price = ConvertPriceAsync(p.Price, currencyCode, exchangeRate).Result; return p; })
        .ToList();

        return PagedResult<ProductDto>.Build(page, items);
    }

    private async Task<ExchangeRate> GetExchangeRateAsync(string targetCurrencyCode)
    {
        var exchangeRate = await _uow.ExchangeRates
       .GetByCurrency(targetCurrencyCode)
       .FirstOrDefaultAsync();

        return exchangeRate == null ? new ExchangeRate() : exchangeRate;
    }

    private async Task<decimal> ConvertPriceAsync(decimal price, string targetCurrencyCode,
    ExchangeRate exchangeRate)
    {
        if (targetCurrencyCode == "USD")
        {
            return price;
        }

        if (exchangeRate == null)
        {
            throw new Exception($"Exchange rate for currency code '{targetCurrencyCode}' not found.");
        }

        return price * exchangeRate.Rate;
    }
}
