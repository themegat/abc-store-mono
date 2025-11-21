using System.Net;
using System.Security.Cryptography;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Page;
using ABCStoreAPI.Service.Tests.Helpers;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Soenneker.Utils.AutoBogus;

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

        private IOrderService _orderService = null!;

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

            var orderService = new OrderService(_uowMock.Object, _loggerMock.Object);

            _orderService = ValidationTestHelpers.RegisterServiceValidation<IOrderService, OrderService>(orderService);
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
                    ZipCode = "12345",
                    AddressType = AddressType.SHIPPING
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
        public void CreateOrder_WhenUserNotFound_ThrowsAbcExecption()
        {
            var orderDto = BuildOrderDto(userId: "missing-user", cartId: 1);

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("missing-user"))
                .Returns((UserDetails?)null);

            var ex = Assert.ThrowsAsync<AbcExecption>(
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
        public void CreateOrder_WhenCartNotFound_ThrowsAbcExecption()
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

            var ex = Assert.ThrowsAsync<AbcExecption>(
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

            var ex = Assert.ThrowsAsync<AbcExecption>(
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

        #region CreateOrder - Invalid request 

        [Test]
        public void CreateOrder_InvalidRequest_ThrowsExecption()
        {
            var ex = Assert.ThrowsAsync<AbcExecption>(async () => await _orderService.CreateOrder(new OrderDto()
            {
                CartId = 1,
                UserId = string.Empty,
                ShippingAddress = new AddressDto()
                {
                    AddressLine1 = string.Empty,
                    AddressLine2 = string.Empty,
                    ZipCode = string.Empty,
                    AddressType = AddressType.SHIPPING
                }
            }));
            Assert.That(ex!.ErrorCode, Is.EqualTo(HttpStatusCode.BadRequest));
            Assert.That(ex.Message, Does.Contain("The UserId field is required"));
            Assert.That(ex.Message, Does.Contain("The StreetAddress field is required"));
            Assert.That(ex.Message, Does.Contain("The Suburb field is required"));
            Assert.That(ex.Message, Does.Contain("The AreaCode field is required"));
        }

        #endregion

        #region GetOrder
        [Test]
        public async Task GetOrder_WhenUserNotFound_ThrowsExecption()
        {
            var userFaker = new AutoFaker<UserDetails>();
            var users = userFaker.Generate(5);

            var testUser = users[1];

            var page = new PagedRequest()
            {
                PageNumber = 1,
                PageSize = 10
            };

            var ex = Assert.ThrowsAsync<AbcExecption>(async () => await _orderService.GetOrders(testUser.UserId, page, OrderSortBy.Date));
            Assert.That(ex!.ErrorCode, Is.EqualTo(HttpStatusCode.BadRequest));
            Assert.That(ex.Message, Does.Contain("User not found"));
        }

        [Test]
        public async Task GetOrder_WhenOrderExists_ReturnsOrder()
        {
            var userFaker = new AutoFaker<UserDetails>();
            var users = userFaker.Generate(5);
            var orderFaker = new AutoFaker<Order>();
            orderFaker.RuleFor(o => o.UserId, (faker) =>
            {
                if (faker.IndexFaker < 5)
                {
                    return users[0].Id;
                }
                else if (faker.IndexFaker < 12)
                {
                    return users[1].Id;
                }
                else if (faker.IndexFaker < 16)
                {
                    return users[2].Id;
                }
                else
                {
                    return users[3].Id;
                }
            });
            orderFaker.RuleFor(o => o.UserDetails, (faker) =>
            {
                if (faker.IndexFaker < 5)
                {
                    return users[0];
                }
                else if (faker.IndexFaker < 12)
                {
                    return users[1];
                }
                else if (faker.IndexFaker < 16)
                {
                    return users[2];
                }
                else
                {
                    return users[3];
                }
            });
            var orders = orderFaker.Generate(20);

            var testUser = users[1];
            _userDetailsRepositoryMock.Setup(r => r.GetByUserId(It.IsAny<string>())).Returns(testUser);
            _orderRepositoryMock.Setup(or => or.GetByUserId(It.IsAny<int>()))
            .Returns(orders.FindAll(o => o.UserId == testUser.Id).AsQueryable());

            var page = new PagedRequest()
            {
                PageNumber = 1,
                PageSize = 10
            };

            var result = await _orderService.GetOrders(testUser.UserId, page, OrderSortBy.Date);

            Assert.That(result, Is.Null);
            Assert.That(result.Items.Count, Is.EqualTo(7));
        }
        #endregion
    }
}
