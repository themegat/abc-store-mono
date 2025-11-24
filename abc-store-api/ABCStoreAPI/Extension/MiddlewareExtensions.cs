using ABCStoreAPI.Extension.Base;
using ABCStoreAPI.Service.Consumer.Base;

namespace ABCStoreAPI.Extension;

public static class MiddlewareExtensions
{
    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            Console.WriteLine("Running in Development environment");
            app.MapOpenApi();
        }

        app.UseCors(ServiceExtensions.AbcStoreWebapp);

        app.RunConsumers();

        app.UseMiddleware<ExceptionMiddleware>();
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        return app;
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
}
