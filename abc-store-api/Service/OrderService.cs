using System.Net;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Validation;

namespace ABCStoreAPI.Service;

public interface IOrderService
{
    Task<OrderDto> CreateOrder(OrderDto orderDto);
}

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IUnitOfWork uow, ILogger<OrderService> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    [Validated]
    public async Task<OrderDto> CreateOrder(OrderDto orderDto)
    {
        var user = _uow.UserDetails.GetByUserId(orderDto.UserId);
        if (user == null)
        {
            var message = "User not found";
            _logger.LogDebug(message);
            throw new AbcExecption(HttpStatusCode.BadRequest, message);
        }
        var address = new Address()
        {
            AddressLine1 = orderDto.ShippingAddress.AddressLine1,
            AddressLine2 = orderDto.ShippingAddress.AddressLine2,
            ZipCode = orderDto.ShippingAddress.ZipCode,
            AddressType = AddressType.SHIPPING,
            CreatedBy = "System",
            UpdatedBy = "System"
        };
        var order = new Order()
        {
            UserId = user.Id,
            CartId = orderDto.CartId,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.CREATED,
            CreatedBy = "System",
            UpdatedBy = "System",
            IsPaid = false,
            ShippingAddress = address
        };

        var cart = _uow.Cart.FindById(orderDto.CartId);
        if (cart == null)
        {
            var message = "Cart not found";
            _logger.LogDebug(message);
            throw new AbcExecption(HttpStatusCode.BadRequest, message);
        }
        await UpdateStockAvailable(cart.CartProducts);

        _uow.Order.Add(order);
        await _uow.CompleteAsync();
        return orderDto;
    }

    private async Task UpdateStockAvailable(List<CartProduct> cartProducts)
    {
        foreach (var cartProduct in cartProducts)
        {
            var product = _uow.Products.GetById(cartProduct.ProductId);
            if (product != null)
            {
                if (product.StockQuantity >= cartProduct.Quantity)
                {
                    product.StockQuantity -= cartProduct.Quantity;
                }
                else
                {
                    var message = $"Product {product.Name} is out of stock";
                    _logger.LogDebug(message);
                    throw new AbcExecption(HttpStatusCode.BadRequest, message);
                }
            }
        }

        await _uow.CompleteAsync();
    }
}
