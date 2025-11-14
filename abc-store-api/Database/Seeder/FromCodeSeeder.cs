using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Database.Model;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Database.Seeder;

 [ExcludeFromCodeCoverage]
public class FromCodeSeeder : DataSeeder
{
    public FromCodeSeeder(AppDbContext context, ILogger<DataSeeder> logger) : base(context, logger)
    {
    }

    public override async Task SeedAsync()
    {
        if (await _context.SupportedCurrency.AnyAsync())
        {
            return;
        }

        var currencies = new List<SupportedCurrency>
            {
                new SupportedCurrency { Code = "USD", Name = "United States Dollar", Symbol = "$", CreatedBy = SysUser, UpdatedBy = SysUser  },
                new SupportedCurrency { Code = "EUR", Name = "Euro", Symbol = "€", CreatedBy = SysUser, UpdatedBy = SysUser  },
                new SupportedCurrency { Code = "GBP", Name = "British Pound", Symbol = "£", CreatedBy = SysUser, UpdatedBy = SysUser  },
                new SupportedCurrency { Code = "JPY", Name = "Japanese Yen", Symbol = "¥", CreatedBy = SysUser, UpdatedBy = SysUser  },
                new SupportedCurrency { Code = "AUD", Name = "Australian Dollar", Symbol = "A$", CreatedBy = SysUser, UpdatedBy = SysUser  },
                new SupportedCurrency { Code = "ZAR", Name = "South African Rand", Symbol = "R", CreatedBy = SysUser, UpdatedBy = SysUser  },
                new SupportedCurrency { Code = "KRW", Name = "Korean Won", Symbol = "₩", CreatedBy = SysUser, UpdatedBy = SysUser },
            };

        await _context.SupportedCurrency.AddRangeAsync(currencies);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Supported currencies seeded.");
    }
}
