using System.Net;
using System.Text.Json;
using ABCStoreAPI.Service.Base;

namespace ABCStoreAPI.Extension.Base;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception is AbcExecptionException
            ? (int)HttpStatusCode.BadRequest
            : (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            context.Response.StatusCode,
            exception.Message,
            Details = exception.StackTrace
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
