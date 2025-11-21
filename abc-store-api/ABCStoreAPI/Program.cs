using ABCStoreAPI.Extension;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureServices()
    .ConfigureConsumers()
    .ConfigureCors()
    .ConfigureFirebaseAuthentication();

var app = builder.Build();

await app.ConfigurePipeline().RunAsync();
