namespace ABCStoreAPI.Service.Page;

public class PagedResult<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public List<T> Items { get; set; } = new List<T>();

    public static PagedResult<T> Build (PagedRequest request, List<T> items)
    {
        return new PagedResult<T>
        {
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = items.Count,
            TotalPages = (int)Math.Ceiling((double)items.Count / request.PageSize),
            Items = items
        };
    }
}