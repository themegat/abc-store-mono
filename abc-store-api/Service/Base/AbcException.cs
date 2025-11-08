using System.Net;

namespace ABCStoreAPI.Service.Base;

public class AbcExecptionException : Exception
{
    public HttpStatusCode ErrorCode { get; set; }
    public AbcExecptionException() { }
    public AbcExecptionException(string message) : base(message) { }
    public AbcExecptionException(HttpStatusCode errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }
    public AbcExecptionException(string message, System.Exception inner) : base(message, inner) { }
    protected AbcExecptionException(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
}
