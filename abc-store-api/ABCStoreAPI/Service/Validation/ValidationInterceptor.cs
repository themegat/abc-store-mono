using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Reflection;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Validation;
using Castle.DynamicProxy;
using MiniValidation;

public class ValidationInterceptor : IInterceptor
{
    public void Intercept(IInvocation invocation)
    {
        var method = invocation.MethodInvocationTarget ?? invocation.Method;

        var hasValidatedAttribute = method
            .GetCustomAttributes(typeof(Validated), true)
            .Any();

        if (hasValidatedAttribute)
        {
            ValidateArguments(method, invocation.Arguments);
        }

        invocation.Proceed();
    }

    private void ValidateArguments(MethodInfo method, object[] args)
    {
        var parameters = method.GetParameters();
        var validationMessages = new List<string>();

        for (int i = 0; i < parameters.Length; i++)
        {
            var parameterInfo = parameters[i];
            var argumentValue = args[i];

            var validationAttributes = parameterInfo
                .GetCustomAttributes(typeof(ValidationAttribute), true)
                .Cast<ValidationAttribute>()
                .ToList();

            foreach (var attr in validationAttributes)
            {
                var context = new ValidationContext(argumentValue, null, null)
                {
                    MemberName = parameterInfo.Name
                };

                var result = attr.GetValidationResult(argumentValue, context);
                if (result != ValidationResult.Success)
                {
                    validationMessages.Add($"Validation failed for parameter '{parameterInfo.Name}': {result.ErrorMessage}");
                }
            }

            if (argumentValue != null)
            {
                if (!MiniValidator.TryValidate(argumentValue, out var errors))
                {
                    foreach (var kvp in errors)
                    {
                        var memberPath = string.IsNullOrWhiteSpace(kvp.Key)
                            ? parameterInfo.Name
                            : $"{parameterInfo.Name}.{kvp.Key}";

                        foreach (var error in kvp.Value)
                        {
                            validationMessages.Add(
                                $"Validation failed for parameter '{memberPath}': {error}"
                            );
                        }
                    }
                }
            }
        }

        if (validationMessages.Any())
        {
            throw new AbcExecption(HttpStatusCode.BadRequest, string.Join("; ", validationMessages));
        }
    }
}
