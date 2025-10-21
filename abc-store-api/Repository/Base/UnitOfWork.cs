using ABCStoreAPI.Database;

namespace ABCStoreAPI.Repository;

public interface IUnitOfWork : IDisposable
{
    IExchangeRateRepository ExchangeRates { get; }
    IProductRepository Products { get; }
    IProductCategoryRepository ProductCategories { get; }
    IProductImageRepository ProductImages { get; }
    ISupportedCurrenyRepository SupportedCurrencies { get; }

    int Complete();
    Task<int> CompleteAsync();
}
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IExchangeRateRepository ExchangeRates { get; private set; }
    public IProductRepository Products { get; private set; }
    public IProductCategoryRepository ProductCategories { get; private set; }
    public IProductImageRepository ProductImages { get; private set; }
    public ISupportedCurrenyRepository SupportedCurrencies { get; private set; }

    public UnitOfWork(AppDbContext context,
    IExchangeRateRepository exchangeRateRepository,
    IProductRepository productRepository,
    IProductCategoryRepository productCategoryRepository,
    IProductImageRepository productImageRepository,
    ISupportedCurrenyRepository supportedCurrenyRepository)
    {
        _context = context;
        ExchangeRates = exchangeRateRepository;
        Products = productRepository;
        ProductCategories = productCategoryRepository;
        ProductImages = productImageRepository;
        SupportedCurrencies = supportedCurrenyRepository;
    }

    public int Complete()
    {
        return _context.SaveChanges();
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
