using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json.Serialization;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using ABCStoreAPI.Service.Validation;

namespace ABCStoreAPI.Service;

[JsonConverter(typeof(JsonStringEnumConverter<OrderSortBy>))]
public enum OrderSortBy
{
    Date,
    Status
}

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

    private List<Order> SortOrders(IEnumerable<Order> orders, OrderSortBy sortBy, bool desc)
    {
        IOrderedEnumerable<Order> query = sortBy switch
        {
            OrderSortBy.Date => desc ? orders.OrderByDescending(o => o.OrderDate) : orders.OrderBy(o => o.OrderDate),
            OrderSortBy.Status => desc ? orders.OrderByDescending(o => o.Status) : orders.OrderBy(o => o.Status),
            _ => orders.OrderBy(o => o.OrderDate)
        };

        return query.ToList();
    }

    [Validated]
    public async Task<PagedResult<OrderDto>> GetOrders([Required] string userId, PagedRequest pagedRequest, OrderSortBy sortBy, bool desc = false)
    {
        var userDetails = _uow.UserDetails.GetByUserId(userId);
        if (userDetails == null)
        {
            var message = "User not found";
            _logger.LogDebug(message);
            throw new AbcExecption(HttpStatusCode.BadRequest, message);
        }
        var orders = _uow.Order.GetByUserId(userDetails.Id);
        var sortedOrder = SortOrders(orders, sortBy, desc);

        pagedRequest.PageNumber = Math.Max(1, pagedRequest.PageNumber);
        int skip = (pagedRequest.PageNumber - 1) * pagedRequest.PageSize;

        var pagedOrders = orders.Skip(skip).Take(pagedRequest.PageSize).ToList();
        return PagedResult<OrderDto>.Build(pagedRequest, pagedOrders.Select(OrderDto.toDto).ToList());
    }
}
