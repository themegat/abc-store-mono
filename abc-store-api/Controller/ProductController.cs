using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ABCStoreAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductController : ControllerBase
    {
        private readonly Service.ProductService _productService;

        public ProductController(Service.ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        [Route("filter/{currencyCode?}")]
        public async Task<ActionResult<PagedResult<ProductDto>>> FilterProducts(
        string currencyCode = "USD", [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10,
        [FromQuery] string searchTerm = "", [FromQuery] int categoryId = 0,
        [FromQuery] decimal minPrice = 0, [FromQuery] decimal maxPrice = decimal.MaxValue,
        [FromQuery] bool inStock = true)
        {
            var page = new PagedRequest
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var products = await _productService.GetFilteredProductsAsync(page, searchTerm, categoryId,
            minPrice, maxPrice, inStock, currencyCode);
            return Ok(products);
        }

        [HttpGet]
        [Route("categories")]
        public async Task<ActionResult<List<Service.Dto.ProductCategoryDto>>> GetAllProductCategories()
        {
            var categories = await _productService.GetAllProductCategoriesAsync();
            return Ok(categories);
        }
    }
}
