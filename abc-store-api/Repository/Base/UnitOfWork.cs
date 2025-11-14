using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database;
using ABCStoreAPI.Repository.Base;

namespace ABCStoreAPI.Repository;

public interface IUnitOfWork : IDisposable
{
    IExchangeRateRepository ExchangeRates { get; }
    IProductRepository Products { get; }
    IProductCategoryRepository ProductCategories { get; }
    IProductImageRepository ProductImages { get; }
    ISupportedCurrenyRepository SupportedCurrencies { get; }
    IUserDetailsRepository UserDetails { get; }
    ICartRepository Cart { get; }
    ICartProductRepository CartProduct { get; }
    IAddressRepository Address { get; }
    IOrderRepository Order { get; }


    int Complete();
    Task<int> CompleteAsync();
}

[ExcludeFromCodeCoverage]
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IExchangeRateRepository ExchangeRates { get; private set; }
    public IProductRepository Products { get; private set; }
    public IProductCategoryRepository ProductCategories { get; private set; }
    public IProductImageRepository ProductImages { get; private set; }
    public ISupportedCurrenyRepository SupportedCurrencies { get; private set; }
    public IUserDetailsRepository UserDetails { get; private set; }
    public ICartRepository Cart { get; private set; }
    public ICartProductRepository CartProduct { get; private set; }
    public IAddressRepository Address { get; private set; }
    public IOrderRepository Order { get; private set; }


    public UnitOfWork(AppDbContext context,
    IExchangeRateRepository exchangeRateRepository,
    IProductRepository productRepository,
    IProductCategoryRepository productCategoryRepository,
    IProductImageRepository productImageRepository,
    ISupportedCurrenyRepository supportedCurrenyRepository,
    IUserDetailsRepository userDetails,
    ICartRepository cart,
    ICartProductRepository cartProduct,
    IAddressRepository address,
    IOrderRepository order
    )
    {
        _context = context;
        ExchangeRates = exchangeRateRepository;
        Products = productRepository;
        ProductCategories = productCategoryRepository;
        ProductImages = productImageRepository;
        SupportedCurrencies = supportedCurrenyRepository;
        UserDetails = userDetails;
        Cart = cart;
        CartProduct = cartProduct;
        Address = address;
        Order = order;
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
