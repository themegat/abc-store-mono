using System.Net;

namespace ABCStoreAPI.Service.Base;

public class AbcExecption : Exception
{
    public HttpStatusCode ErrorCode { get; set; }

    public AbcExecption(HttpStatusCode errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }
    protected AbcExecption(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
}
