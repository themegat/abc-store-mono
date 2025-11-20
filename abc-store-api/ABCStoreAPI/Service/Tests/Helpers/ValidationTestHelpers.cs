using System;
using Castle.DynamicProxy;

namespace ABCStoreAPI.Service.Tests.Helpers;

public class ValidationTestHelpers
{
    public static TInterface RegisterServiceValidation<TInterface, TImpl>(TImpl service)
      where TInterface : class
        where TImpl : class, TInterface
    {
        var interceptor = new ValidationInterceptor();
        var proxyGenerator = new ProxyGenerator();

        return proxyGenerator
            .CreateInterfaceProxyWithTarget<TInterface>(
                service,
                interceptor);
    }

}
