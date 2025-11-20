using ABCStoreAPI.Service;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ABCStoreAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        public OrderController(OrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("create")]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] OrderDto orderDto)
        {
            var result = await _orderService.CreateOrder(orderDto);
            return Ok(result);
        }

        [HttpGet("get-orders")]
        public async Task<ActionResult<PagedResult<OrderDto>>> GetOrders([FromQuery] string userId, [FromQuery] OrderSortBy sortBy,
             [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] bool desc = false)
        {
            var page = new PagedRequest()
            {
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            var result = await _orderService.GetOrders(userId, page, sortBy, desc);
            return Ok(result);
        }
    }
}
