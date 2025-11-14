using System.Net;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Dto;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Service;

public class CartService
{
    private const string SYS_USER = "system";
    private readonly IUnitOfWork _uow;
    private readonly ILogger<CartService> _logger;

    public CartService(IUnitOfWork uow, ILogger<CartService> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    private IQueryable<Cart> GetCart(string userId, CartStatus status)
    {
        return _uow.Cart.GetByUserIdAndStatus(userId, status).Include(c => c.CartProducts)
            .ThenInclude(cp => cp.Product);
    }

    public async Task<CartDto> CreateCart(CartDto cartDto)
    {
        var cartQuery = GetCart(cartDto.UserId, CartStatus.IN_PROGRESS);
        if (cartQuery.FirstOrDefault() == null)
        {
            var cartProducts = cartDto.CartProducts.Select(cp => new CartProduct
            {
                CreatedBy = SYS_USER,
                UpdatedBy = SYS_USER,
                ProductId = cp.ProductId,
                Quantity = cp.Quantity
            }).ToList();

            var cart = new Cart
            {
                CreatedBy = SYS_USER,
                UpdatedBy = SYS_USER,
                UserId = cartDto.UserId,
                Status = CartStatus.IN_PROGRESS,
                CartProducts = cartProducts
            };
            _uow.Cart.Add(cart);
            await _uow.CompleteAsync();
            return CartDto.toDto(cart);
        }
        else
        {
            var message = "A cart in progress already exists";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.BadRequest, message);
        }
    }

    public async Task<CartDto> CompleteCart(CartDto cartDto)
    {
        var cartQuery = GetCart(cartDto.UserId, CartStatus.IN_PROGRESS);
        if (cartQuery.FirstOrDefault() == null)
        {
            var message = "A cart in progress could not be found";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.BadRequest, message);
        }
        else
        {
            var cart = cartQuery.First();
            cart.Status = CartStatus.COMPLETE;
            cart.UpdatedBy = SYS_USER;
            cart.UpdatedAt = DateTime.UtcNow;
            await _uow.CompleteAsync();
            return CartDto.toDto(cart);
        }
    }

    public async Task RemoveCart(CartDto cartDto)
    {
        var cartQuery = GetCart(cartDto.UserId, CartStatus.IN_PROGRESS);
        if (cartQuery.FirstOrDefault() == null)
        {
            var message = "A cart in progress could not be found";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.NotFound, message);
        }
        else
        {
            _uow.Cart.Remove(cartQuery.First());
            await _uow.CompleteAsync();
        }
    }

    public async Task<CartDto> GetCartInProgress(string userId)
    {
        var cartQuery = GetCart(userId, CartStatus.IN_PROGRESS);
        if (cartQuery.FirstOrDefault() == null)
        {
            var message = "A cart in progress could not be found";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.NotFound, message);
        }
        else
        {
            return CartDto.toDto(cartQuery.First());
        }
    }

    private IQueryable<CartProduct> GetCartProduct(int cartId, int productId)
    {
        return _uow.CartProduct
            .GetByCartIdAndProductId(cartId, productId);
    }

    private Product? GerProduct(int productId)
    {
        return _uow.Products.GetById(productId);
    }

    private void CheckProductStockAgainstQuantity(int productId, int quantity)
    {
        var product = GerProduct(productId);
        string message;
        if (product == null)
        {
            message = "Product does not exist";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.NotFound, message);
        }
        else
        {
            if (quantity > product.StockQuantity)
            {
                message = "Product does not have enough stock";
                _logger.LogDebug(message);
                throw new AbcExecptionException(HttpStatusCode.BadRequest, message);
            }
        }
    }

    public async Task<CartProductDto> AddProductToCart(int cartId, CartProductDto cartProductDto)
    {
        CheckProductStockAgainstQuantity(cartProductDto.ProductId, cartProductDto.Quantity);
        var cartProductQuery = GetCartProduct(cartId, cartProductDto.ProductId);
        if (cartProductQuery.FirstOrDefault() == null)
        {

            var cartProduct = new CartProduct
            {
                CreatedBy = SYS_USER,
                UpdatedBy = SYS_USER,
                CartId = cartId,
                ProductId = cartProductDto.ProductId,
                Quantity = cartProductDto.Quantity
            };
            _uow.CartProduct.Add(cartProduct);
            await _uow.CompleteAsync();
            return CartProductDto.toDto(cartProduct);
        }
        else
        {
            var message = "Cart already contains the product";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.BadRequest, message);
        }
    }

    public async Task<CartProductDto> UpdateCartProduct(int cartId, CartProductDto cartProductDto)
    {
        CheckProductStockAgainstQuantity(cartProductDto.ProductId, cartProductDto.Quantity);
        var cartProductQuery = GetCartProduct(cartId, cartProductDto.ProductId);
        if (cartProductQuery.FirstOrDefault() == null)
        {
            var message = "Product does not exist on cart";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.NotFound, message);
        }
        else
        {
            if (cartProductDto.Quantity.Equals(0))
            {
                await RemoveCartProduct(cartId, cartProductDto);
                return cartProductDto;
            }
            else
            {
                var cartProduct = cartProductQuery.First();
                cartProduct.Quantity = cartProductDto.Quantity;
                cartProduct.UpdatedBy = SYS_USER;
                await _uow.CompleteAsync();
                return CartProductDto.toDto(cartProduct);
            }
        }
    }

    public async Task RemoveCartProduct(int cartId, CartProductDto cartProductDto)
    {
        var cartProductQuery = GetCartProduct(cartId, cartProductDto.ProductId);
        if (cartProductQuery.FirstOrDefault() == null)
        {
            var message = "Product does not exist on cart";
            _logger.LogDebug(message);
            throw new AbcExecptionException(HttpStatusCode.NotFound, message);
        }
        else
        {
            _uow.CartProduct.Remove(cartProductQuery.First());
            await _uow.CompleteAsync();
        }
    }
}
