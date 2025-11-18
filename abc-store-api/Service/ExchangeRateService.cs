using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Repository;
using Microsoft.EntityFrameworkCore;
using ABCStoreAPI.Service.Validation;

namespace ABCStoreAPI.Service;

public interface IExchangeRateService
{
    Task<List<Dto.ExchangeRateDto>> GetAllExchangeRatesAsync();
    Task<Dto.ExchangeRateDto?> GetExchangeRateByCurrencyCodeAsync(string currencyCode);
}

public class ExchangeRateService : IExchangeRateService
{
    private readonly IUnitOfWork _uow;

    public ExchangeRateService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<List<Dto.ExchangeRateDto>> GetAllExchangeRatesAsync()
    {
        var exchangeRates = await _uow.ExchangeRates
        .GetAll()
        .Include(e => e.SupportedCurrency)
        .ToListAsync();

        return exchangeRates.Select(Dto.ExchangeRateDto.toDto).ToList();
    }

    [Validated]
    public async Task<Dto.ExchangeRateDto?> GetExchangeRateByCurrencyCodeAsync([Required][MinLength(3)] string currencyCode)
    {
        var exchangeRate = await _uow.ExchangeRates
        .GetByCurrency(currencyCode)
        .Include(e => e.SupportedCurrency)
        .FirstOrDefaultAsync();

        if (exchangeRate == null)
        {
            return null;
        }

        return Dto.ExchangeRateDto.toDto(exchangeRate);
    }
}
