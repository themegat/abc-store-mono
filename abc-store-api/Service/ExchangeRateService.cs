using ABCStoreAPI.Repository;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Service;

public class ExchangeRateService
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

    public async Task<Dto.ExchangeRateDto?> GetExchangeRateByCurrencyCodeAsync(string currencyCode)
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
