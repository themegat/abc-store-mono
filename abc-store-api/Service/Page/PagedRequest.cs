using System.ComponentModel.DataAnnotations;

namespace ABCStoreAPI.Service.Page;

public class PagedRequest
{
    [Required]
    public int PageNumber { get; set; } = 1;
    [Required]
    [Range(1, 100)]
    public int PageSize { get; set; } = 10;
}
