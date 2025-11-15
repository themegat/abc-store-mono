using System.Net;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Dto;
using Moq;
using NUnit.Framework;

namespace ABCStoreAPI.Service.Tests
{
    [TestFixture]
    public class OrderServiceTest
    {
        private Mock<IUnitOfWork> _uowMock = null!;
        private Mock<IUserDetailsRepository> _userDetailsRepositoryMock = null!;
        private Mock<ICartRepository> _cartRepositoryMock = null!;
        private Mock<IOrderRepository> _orderRepositoryMock = null!;
        private Mock<IProductRepository> _productRepositoryMock = null!;
        private Mock<ILogger<OrderService>> _loggerMock = null!;

        private OrderService _orderService = null!;

        [SetUp]
        public void SetUp()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _userDetailsRepositoryMock = new Mock<IUserDetailsRepository>();
            _cartRepositoryMock = new Mock<ICartRepository>();
            _orderRepositoryMock = new Mock<IOrderRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _loggerMock = new Mock<ILogger<OrderService>>();

            _uowMock.Setup(u => u.UserDetails).Returns(_userDetailsRepositoryMock.Object);
            _uowMock.Setup(u => u.Cart).Returns(_cartRepositoryMock.Object);
            _uowMock.Setup(u => u.Order).Returns(_orderRepositoryMock.Object);
            _uowMock.Setup(u => u.Products).Returns(_productRepositoryMock.Object);

            _uowMock.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

            _orderService = new OrderService(_uowMock.Object, _loggerMock.Object);
        }

        #region Helper builders

        private static OrderDto BuildOrderDto(string userId = "user-1", int cartId = 1)
        {
            return new OrderDto
            {
                UserId = userId,
                CartId = cartId,
                ShippingAddress = new AddressDto
                {
                    AddressLine1 = "Line 1",
                    AddressLine2 = "Line 2",
                    ZipCode = "12345"
                }
            };
        }

        private static Cart BuildCart(int cartId, List<CartProduct> products)
        {
            return new Cart
            {
                Id = cartId,
                CartProducts = products
            };
        }

        #endregion

        #region CreateOrder - User not found

        [Test]
        public void CreateOrder_WhenUserNotFound_ThrowsAbcExecptionException()
        {
            var orderDto = BuildOrderDto(userId: "missing-user", cartId: 1);

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("missing-user"))
                .Returns((UserDetails?)null);

            var ex = Assert.ThrowsAsync<AbcExecptionException>(
                async () => await _orderService.CreateOrder(orderDto));

            Assert.That(ex!.ErrorCode, Is.EqualTo(HttpStatusCode.BadRequest));
            Assert.That(ex.Message, Is.EqualTo("User not found"));

            _cartRepositoryMock.Verify(r => r.FindById(It.IsAny<int>()), Times.Never);
            _orderRepositoryMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Never);
            _uowMock.Verify(u => u.CompleteAsync(), Times.Never);
        }

        #endregion

        #region CreateOrder - Cart not found

        [Test]
        public void CreateOrder_WhenCartNotFound_ThrowsAbcExecptionException()
        {
            var orderDto = BuildOrderDto(userId: "user-1", cartId: 42);

            var user = new UserDetails
            {
                Id = 42,
                UserId = "user-1"
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(user);

            _cartRepositoryMock
                .Setup(r => r.FindById(42))
                .Returns((Cart?)null);

            var ex = Assert.ThrowsAsync<AbcExecptionException>(
                async () => await _orderService.CreateOrder(orderDto));

            Assert.That(ex!.ErrorCode, Is.EqualTo(HttpStatusCode.BadRequest));
            Assert.That(ex.Message, Is.EqualTo("Cart not found"));

            _orderRepositoryMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Never);
            _uowMock.Verify(u => u.CompleteAsync(), Times.Never);
        }

        #endregion

        #region CreateOrder - Product out of stock

        [Test]
        public void CreateOrder_WhenProductOutOfStock_ThrowsAndDoesNotCreateOrder()
        {
            var orderDto = BuildOrderDto(userId: "user-1", cartId: 1);

            var user = new UserDetails
            {
                Id = 42,
                UserId = "user-1"
            };

            var cartProducts = new List<CartProduct>
            {
                new CartProduct { ProductId = 10, Quantity = 5 }
            };

            var cart = BuildCart(1, cartProducts);

            var product = new Product
            {
                Id = 10,
                Name = "Test Product",
                StockQuantity = 2
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(user);

            _cartRepositoryMock
                .Setup(r => r.FindById(1))
                .Returns(cart);

            _productRepositoryMock
                .Setup(r => r.GetById(10))
                .Returns(product);

            var ex = Assert.ThrowsAsync<AbcExecptionException>(
                async () => await _orderService.CreateOrder(orderDto));

            Assert.That(ex!.ErrorCode, Is.EqualTo(HttpStatusCode.BadRequest));
            Assert.That(ex.Message, Does.Contain("out of stock"));

            _orderRepositoryMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Never);
            _uowMock.Verify(u => u.CompleteAsync(), Times.Never);
        }

        #endregion

        #region CreateOrder - Success

        [Test]
        public async Task CreateOrder_WhenValid_CreatesOrderAndUpdatesStock()
        {
            var orderDto = BuildOrderDto(userId: "user-1", cartId: 1);

            var user = new UserDetails
            {
                Id = 42,
                UserId = "user-1"
            };

            var cartProducts = new List<CartProduct>
            {
                new CartProduct { ProductId = 10, Quantity = 3 },
                new CartProduct { ProductId = 11, Quantity = 1 }
            };

            var cart = BuildCart(1, cartProducts);

            var product10 = new Product
            {
                Id = 10,
                Name = "Product 10",
                StockQuantity = 10
            };

            var product11 = new Product
            {
                Id = 11,
                Name = "Product 11",
                StockQuantity = 5
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(user);

            _cartRepositoryMock
                .Setup(r => r.FindById(1))
                .Returns(cart);

            _productRepositoryMock
                .Setup(r => r.GetById(10))
                .Returns(product10);

            _productRepositoryMock
                .Setup(r => r.GetById(11))
                .Returns(product11);

            Order? capturedOrder = null;
            _orderRepositoryMock
                .Setup(r => r.Add(It.IsAny<Order>()))
                .Callback<Order>(o => capturedOrder = o);

            var result = await _orderService.CreateOrder(orderDto);

            Assert.That(result, Is.Not.Null);
            Assert.That(result.UserId, Is.EqualTo(orderDto.UserId));
            Assert.That(result.CartId, Is.EqualTo(orderDto.CartId));

            Assert.That(capturedOrder, Is.Not.Null);
            Assert.That(capturedOrder!.UserId, Is.EqualTo(user.Id));
            Assert.That(capturedOrder.CartId, Is.EqualTo(orderDto.CartId));
            Assert.That(capturedOrder.Status, Is.EqualTo(OrderStatus.CREATED));
            Assert.That(capturedOrder.IsPaid, Is.False);
            Assert.That(capturedOrder.ShippingAddress, Is.Not.Null);
            Assert.That(capturedOrder.ShippingAddress.AddressType, Is.EqualTo(AddressType.SHIPPING));
            Assert.That(capturedOrder.ShippingAddress.AddressLine1, Is.EqualTo(orderDto.ShippingAddress.AddressLine1));

            Assert.That(product10.StockQuantity, Is.EqualTo(10 - 3));
            Assert.That(product11.StockQuantity, Is.EqualTo(5 - 1));

            _orderRepositoryMock.Verify(r => r.Add(It.IsAny<Order>()), Times.Once);

            _uowMock.Verify(u => u.CompleteAsync(), Times.Exactly(2));
        }

        #endregion
    }
}
