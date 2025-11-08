using System.Net;
using System.Security.Claims;
using ABCStoreAPI.Configuration;
using ABCStoreAPI.Database;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Repository.Base;
using ABCStoreAPI.Service;
using ABCStoreAPI.Service.Consumer;
using ABCStoreAPI.Service.Consumer.Base;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Extension;

public static class ServiceExtensions
{
    public static string AbcStoreWebapp = "_AbcStoreWebapp";

    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsDevelopment())
        {
            ConfigureKestrel(builder);
        }

        builder.Services.Configure<ApiConfig>(builder.Configuration.GetSection("ApiSettings"));

        builder.Services.AddHttpClient();

        var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        builder.Services.AddControllers();

        builder.Services.AddOpenApi();

        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IExchangeRateRepository, ExchangeRateRepository>();
        builder.Services.AddScoped<IProductRepository, ProductRepository>();
        builder.Services.AddScoped<IProductCategoryRepository, ProductCategoryRepository>();
        builder.Services.AddScoped<IProductImageRepository, ProductImageRepository>();
        builder.Services.AddScoped<ISupportedCurrenyRepository, SupportedCurrenyRepository>();
        builder.Services.AddScoped<IUserDetailsRepository, UserDetailsRepository>();
        builder.Services.AddScoped<ICartRepository, CartRepository>();
        builder.Services.AddScoped<ICartProductRepository, CartProductRepository>();

        builder.Services.AddScoped<ExchangeRateService>();
        builder.Services.AddScoped<ProductService>();
        builder.Services.AddScoped<UserDetailsService>();
        builder.Services.AddScoped<CartService>();

        return builder;
    }

    public static WebApplicationBuilder ConfigureConsumers(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<ProductConsumerUtil>();
        builder.Services.AddScoped<IConsumer, FakestoreConsumer>();
        builder.Services.AddScoped<IConsumer, DummyjsonConsumer>();
        builder.Services.AddScoped<IConsumer, ExchangerateapiConsumer>();

        return builder;
    }

    public static WebApplicationBuilder ConfigureKestrel(this WebApplicationBuilder builder)
    {
        var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Listen(IPAddress.Any, int.Parse(port));
        });

        return builder;
    }

    public static WebApplicationBuilder ConfigureCors(this WebApplicationBuilder builder)
    {
        var allowedOriginsCSV = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");

        if (!string.IsNullOrWhiteSpace(allowedOriginsCSV))
        {
            List<string> allowdOrigins = allowedOriginsCSV.Split(',').ToList();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: AbcStoreWebapp,
                    policy =>
                    {
                        policy.WithOrigins(allowdOrigins.ToArray())
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                    });
            });
        }

        return builder;
    }

    public static WebApplicationBuilder ConfigureFirebaseAuthentication(this WebApplicationBuilder builder)
    {

        var tokenIssuer = builder.Configuration.GetSection("ApiSettings").GetValue<string>("TokenIssuer");
        var projectId = Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID");
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                if (isDevelopment)
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        RequireSignedTokens = false,
                        RequireAudience = false,
                        ValidateIssuerSigningKey = false,
                        ValidateIssuer = false,
                        ValidateAudience = false,

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                }
                else
                {
                    options.Authority = $"{tokenIssuer}/{projectId}";
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,

                        ValidateIssuer = true,
                        ValidIssuer = $"{tokenIssuer}/{projectId}",

                        ValidateAudience = true,
                        ValidAudience = projectId,

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                }

                options.TokenValidationParameters.NameClaimType = ClaimTypes.NameIdentifier;

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var uid = context.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        return Task.CompletedTask;
                    }
                };
            });

        return builder;
    }
}
