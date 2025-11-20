
using System.Net;
using System.Net.Http.Json;

namespace ABCStoreAPI.Service.Tests.Helpers;

public class FakeHttpMessageHandler : HttpMessageHandler
{
    private readonly string _jsonResponse;
    private readonly string? _firebaseJsonResponse;
    private readonly HttpStatusCode _statusCode;

    public FakeHttpMessageHandler(string jsonResponse, HttpStatusCode statusCode, string firebaseJsonResponse = "")
    {
        _jsonResponse = jsonResponse;
        _statusCode = statusCode;
        _firebaseJsonResponse = firebaseJsonResponse;
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        if (request.Method == HttpMethod.Post && request.RequestUri!.AbsoluteUri.Contains("test.cloudfunctions.net"))
        {
            return Task.FromResult(new HttpResponseMessage(_statusCode)
            {
                Content = new StringContent(_firebaseJsonResponse ?? "")
            });
        }
        var response = new HttpResponseMessage(_statusCode)
        {
            Content = new StringContent(_jsonResponse)
        };

        return Task.FromResult(response);
    }
}

public class HttpClientTestHelpers
{
    public static HttpClient CreateHttpClient(string jsonResponse, HttpStatusCode statusCode, string firebaseJsonResponse = "")
    {
        var handler = new FakeHttpMessageHandler(jsonResponse, statusCode, firebaseJsonResponse);
        return new HttpClient(handler)
        {
            BaseAddress = new Uri("https://fake-store.test")
        };
    }

}

public interface IHttpClientWrapper
{
    Task<HttpResponseMessage> GetAsync<T>(string uri);
    Task<HttpResponseMessage> PostAsJsonAsync<T>(string uri, T value);
}

public class HttpClientWrapper : IHttpClientWrapper
{
    private readonly HttpClient _client;
    public HttpClientWrapper(HttpClient client) => _client = client;

    public Task<HttpResponseMessage> GetAsync<T>(string uri)
        => _client.GetAsync(uri);
    public Task<HttpResponseMessage> PostAsJsonAsync<T>(string uri, T value)
        => _client.PostAsJsonAsync(uri, value);
}

