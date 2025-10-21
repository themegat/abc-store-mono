using ABCStoreAPI.Database;
using ABCStoreAPI.Service.Consumer.Base;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Extension;

public static class MiddlewareExtensions
{
    private static string DevSpecificOrigins = "_devSpecificOrigins";

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            Console.WriteLine("Running in Development environment");

            app.MapOpenApi();
            app.UseCors(DevSpecificOrigins);
        }

        app.MigrateDatabase();

        app.SeedData();
        app.RunConsumers();

        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        return app;
    }

    private static void MigrateDatabase(this IHost app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();
    }

    private static void RunConsumers(this IHost app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider.GetServices<IConsumer>();

        foreach (var consumer in services)
        {
            consumer.ConsumeAsync().GetAwaiter().GetResult();
        }
    }

    private static void SeedData(this IHost app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<DataSeeder>>();
        var seeders = new List<DataSeeder>
    {
        new Database.Seeder.FromCodeSeeder(dbContext, logger)
    };

        foreach (var seeder in seeders)
        {
            seeder.SeedAsync().GetAwaiter().GetResult();
        }
    }
}
