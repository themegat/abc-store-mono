
using Microsoft.EntityFrameworkCore.Query;
using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;

namespace ABCStoreAPI.Service.Tests.Base;

/// <summary>
/// Helper classes to support EF Core async LINQ (ToListAsync, FirstOrDefaultAsync)
/// against in-memory collections.
/// </summary>

[ExcludeFromCodeCoverage]
internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(IEnumerable<T> enumerable)
        : base(enumerable)
    {
    }

    public TestAsyncEnumerable(Expression expression)
        : base(expression)
    {
    }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

[ExcludeFromCodeCoverage]
internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;

    public TestAsyncEnumerator(IEnumerator<T> inner)
    {
        _inner = inner;
    }

    public ValueTask<bool> MoveNextAsync()
        => new ValueTask<bool>(_inner.MoveNext());

    public T Current => _inner.Current;

    public ValueTask DisposeAsync()
    {
        _inner.Dispose();
        return default;
    }
}

[ExcludeFromCodeCoverage]
internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(Expression expression)
        => new TestAsyncEnumerable<TEntity>(expression);

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        => new TestAsyncEnumerable<TElement>(expression);

    public object Execute(Expression expression)
        => _inner.Execute(expression);

    public TResult Execute<TResult>(Expression expression)
        => _inner.Execute<TResult>(expression);

    // This one is fine to keep; it's not part of IAsyncQueryProvider’s contract,
    // but it can be useful for async enumeration scenarios.
    public IAsyncEnumerable<TResult> ExecuteAsync<TResult>(Expression expression)
        => new TestAsyncEnumerable<TResult>(expression);

    // *** THIS is the important one: explicit interface implementation ***
    TResult IAsyncQueryProvider.ExecuteAsync<TResult>(
        Expression expression,
        CancellationToken cancellationToken)
    {
        // TResult is something like Task<ExchangeRate>
        var expectedResultType = typeof(TResult).GetGenericArguments()[0];

        // Call Execute<ExchangeRate>(expression) via reflection
        var executeMethod = typeof(IQueryProvider)
            .GetMethods()
            .First(m => m.Name == nameof(IQueryProvider.Execute)
                        && m.IsGenericMethodDefinition);

        var genericExecute = executeMethod.MakeGenericMethod(expectedResultType);
        var executionResult = genericExecute.Invoke(this, new object[] { expression });

        // Wrap the result into Task.FromResult<ExchangeRate>(...)
        var fromResultMethod = typeof(Task)
            .GetMethods()
            .First(m => m.Name == nameof(Task.FromResult)
                        && m.IsGenericMethodDefinition);

        var genericFromResult = fromResultMethod.MakeGenericMethod(expectedResultType);

        return (TResult)genericFromResult.Invoke(null, new[] { executionResult })!;
    }
}
