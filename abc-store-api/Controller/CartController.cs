using ABCStoreAPI.Service;
using ABCStoreAPI.Service.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ABCStoreAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        [Route("{userId}")]
        public async Task<ActionResult<CartDto>> GetActiveCart([FromQuery] string userId)
        {
            var cart = await _cartService.GetCartInProgress(userId);
            return new ActionResult<CartDto>(cart);
        }

        [HttpPost]
        [Route("create")]
        public async Task<ActionResult<CartDto>> CreateCart([FromBody] CartDto cartDto)
        {
            await _cartService.CreateCart(cartDto);
            return new ActionResult<CartDto>(cartDto);
        }

        [HttpPut]
        [Route("complete")]
        public async Task<ActionResult<CartDto>> CompleteCart([FromBody] CartDto cartDto)
        {
            var cart = await _cartService.CompleteCart(cartDto);
            return new ActionResult<CartDto>(cart);
        }

        [HttpDelete]
        [Route("remove")]
        public async Task<ActionResult<CartDto>> RemoveCart([FromBody] CartDto cartDto)
        {
            await _cartService.RemoveCart(cartDto);
            return new ActionResult<CartDto>(cartDto);
        }

        [HttpPost]
        [Route("product/add/{cartId}")]
        public async Task<ActionResult<CartProductDto>> AddProductToCart(
            [FromQuery] int cartId,
            [FromBody] CartProductDto cartProductDto)
        {
            var cartProduct = await _cartService.AddProductToCart(cartId, cartProductDto);
            return new ActionResult<CartProductDto>(cartProduct);
        }

        [HttpPut]
        [Route("product/update/{cartId}")]
        public async Task<ActionResult<CartProductDto>> UpdateCartProduct(
            [FromQuery] int cartId,
            [FromBody] CartProductDto cartProductDto)
        {
            var cartProduct = await _cartService.UpdateCartProduct(cartId, cartProductDto);
            return new ActionResult<CartProductDto>(cartProduct);
        }

        [HttpDelete]
        [Route("product/remove/{cartId}")]
        public async Task<ActionResult<CartProductDto>> RemoveCartProduct(
            [FromQuery] int cartId,
            [FromBody] CartProductDto cartProductDto)
        {
            await _cartService.RemoveCartProduct(cartId, cartProductDto);
            return new ActionResult<CartProductDto>(cartProductDto);
        }

    }
}
