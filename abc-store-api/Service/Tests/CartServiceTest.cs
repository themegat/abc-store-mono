using System.Linq;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Repository.Base;
using ABCStoreAPI.Service;
using ABCStoreAPI.Service.Base;
using ABCStoreAPI.Service.Dto;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Soenneker.Utils.AutoBogus;

namespace ABCStoreAPI.Service.Tests;

public class CartServiceTest
{
    private Mock<ICartRepository> _cartRepositoryMock = null!;
    private Mock<ICartProductRepository> _cartProductRepositoryMock = null!;
    private Mock<IProductRepository> _productyRepositoryMock = null!;

    private Mock<IUnitOfWork> _uowMock = null!;
    private Mock<ILogger<CartService>> _loggerMock = null!;
    private CartService _cartService = null!;

    private List<Cart> _cart = null!;

    [SetUp]
    public void Setup()
    {
        var autoFaker = new AutoFaker();

        _cart = autoFaker.Generate<Cart>(5);

        _uowMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<CartService>>();

        _cartRepositoryMock = new Mock<ICartRepository>();
        _cartProductRepositoryMock = new Mock<ICartProductRepository>();
        _productyRepositoryMock = new Mock<IProductRepository>();

        _cartRepositoryMock
            .Setup(cr => cr.GetByUserIdAndStatus(It.IsAny<string>(), It.IsAny<CartStatus>()))
            .Returns(Enumerable.Empty<Cart>().AsQueryable());

        _cartRepositoryMock
            .Setup(cr => cr.GetByUserIdAndStatus("1", CartStatus.IN_PROGRESS))
            .Returns(_cart.AsQueryable());

        _uowMock.Setup(uow => uow.Cart).Returns(_cartRepositoryMock.Object);
        _uowMock.Setup(uow => uow.CartProduct).Returns(_cartProductRepositoryMock.Object);
        _uowMock.Setup(uow => uow.Products).Returns(_productyRepositoryMock.Object);

        _uowMock.Setup(uow => uow.CompleteAsync()).ReturnsAsync(1);

        _cartService = new CartService(_uowMock.Object, _loggerMock.Object);
    }

    #region CreateCart

    [Test]
    public async Task TestCreateCartDuplicate_ThrowsException()
    {
        var cartDto = new CartDto
        {
            UserId = "1",
            CartProducts = new List<CartProductDto>
            {
                new CartProductDto
                {
                    ProductId = 1,
                    Quantity = 1
                }
            }
        };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.CreateCart(cartDto));
    }

    [Test]
    public async Task TestCreateCart_Pass()
    {
        var cartDto = new CartDto
        {
            UserId = "2",
            CartProducts = new List<CartProductDto>
            {
                new CartProductDto
                {
                    ProductId = 1,
                    Quantity = 1
                }
            }
        };

        var result = await _cartService.CreateCart(cartDto);

        Assert.That(result.UserId, Is.EqualTo("2"));
        _cartRepositoryMock.Verify(cr => cr.Add(It.IsAny<Cart>()), Times.Once);
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
    }

    #endregion

    #region CompleteCart

    [Test]
    public async Task CompleteCart_WhenCartInProgress_UpdatesStatusAndSaves()
    {
        var cart = new Cart
        {
            Id = 10,
            UserId = "user-complete",
            Status = CartStatus.IN_PROGRESS
        };

        _cartRepositoryMock
            .Setup(cr => cr.GetByUserIdAndStatus("user-complete", CartStatus.IN_PROGRESS))
            .Returns(new List<Cart> { cart }.AsQueryable());

        var dto = new CartDto { UserId = "user-complete" };

        var result = await _cartService.CompleteCart(dto);

        Assert.That(cart.Status, Is.EqualTo(CartStatus.COMPLETE));
        Assert.That(cart.UpdatedBy, Is.EqualTo("system"));
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
        Assert.That(result.Status, Is.EqualTo(CartStatus.COMPLETE));
    }

    [Test]
    public void CompleteCart_WhenNoCartInProgress_ThrowsException()
    {
        var dto = new CartDto { UserId = "no-cart-user" };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.CompleteCart(dto));
    }

    #endregion

    #region RemoveCart

    [Test]
    public async Task RemoveCart_WhenCartExists_RemovesAndSaves()
    {
        var cart = new Cart
        {
            Id = 20,
            UserId = "user-remove",
            Status = CartStatus.IN_PROGRESS
        };

        _cartRepositoryMock
            .Setup(cr => cr.GetByUserIdAndStatus("user-remove", CartStatus.IN_PROGRESS))
            .Returns(new List<Cart> { cart }.AsQueryable());

        var dto = new CartDto { UserId = "user-remove" };

        await _cartService.RemoveCart(dto);

        _cartRepositoryMock.Verify(cr => cr.Remove(cart), Times.Once);
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
    }

    [Test]
    public void RemoveCart_WhenCartDoesNotExist_ThrowsException()
    {
        var dto = new CartDto { UserId = "no-cart-to-remove" };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.RemoveCart(dto));
    }

    #endregion

    #region GetCartInProgress

    [Test]
    public async Task GetCartInProgress_WhenCartExists_ReturnsDto()
    {
        var cart = new Cart
        {
            Id = 30,
            UserId = "user-get",
            Status = CartStatus.IN_PROGRESS
        };

        _cartRepositoryMock
            .Setup(cr => cr.GetByUserIdAndStatus("user-get", CartStatus.IN_PROGRESS))
            .Returns(new List<Cart> { cart }.AsQueryable());

        var result = await _cartService.GetCartInProgress("user-get");

        Assert.That(result.UserId, Is.EqualTo("user-get"));
        Assert.That(result.Status, Is.EqualTo(CartStatus.IN_PROGRESS));
    }

    [Test]
    public void GetCartInProgress_WhenCartDoesNotExist_ThrowsException()
    {
        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.GetCartInProgress("no-cart-user"));
    }

    #endregion

    #region AddProductToCart

    [Test]
    public async Task AddProductToCart_WhenOk_AddsProductAndSaves()
    {
        var product = new Product
        {
            Id = 1,
            StockQuantity = 10
        };

        _productyRepositoryMock
            .Setup(pr => pr.GetById(1))
            .Returns(product);

        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 1))
            .Returns(Enumerable.Empty<CartProduct>().AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 1,
            Quantity = 2
        };

        var result = await _cartService.AddProductToCart(1, dto);

        Assert.That(result.ProductId, Is.EqualTo(1));
        Assert.That(result.Quantity, Is.EqualTo(2));
        _cartProductRepositoryMock.Verify(cr => cr.Add(It.IsAny<CartProduct>()), Times.Once);
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
    }

    [Test]
    public void AddProductToCart_WhenProductNotFound_ThrowsException()
    {
        _productyRepositoryMock
            .Setup(pr => pr.GetById(It.IsAny<int>()))
            .Returns((Product?)null);

        var dto = new CartProductDto
        {
            ProductId = 99,
            Quantity = 1
        };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.AddProductToCart(1, dto));
    }

    [Test]
    public void AddProductToCart_WhenNotEnoughStock_ThrowsException()
    {
        var product = new Product
        {
            Id = 2,
            StockQuantity = 1
        };

        _productyRepositoryMock
            .Setup(pr => pr.GetById(2))
            .Returns(product);

        var dto = new CartProductDto
        {
            ProductId = 2,
            Quantity = 5 
        };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.AddProductToCart(1, dto));
    }

    [Test]
    public void AddProductToCart_WhenProductAlreadyOnCart_ThrowsException()
    {
        var product = new Product
        {
            Id = 3,
            StockQuantity = 10
        };

        _productyRepositoryMock
            .Setup(pr => pr.GetById(3))
            .Returns(product);

        var existingCartProduct = new CartProduct
        {
            CartId = 1,
            ProductId = 3,
            Quantity = 1
        };

        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 3))
            .Returns(new List<CartProduct> { existingCartProduct }.AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 3,
            Quantity = 2
        };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.AddProductToCart(1, dto));
    }

    #endregion

    #region UpdateCartProduct

    [Test]
    public async Task UpdateCartProduct_WhenQuantityNonZero_UpdatesQuantityAndSaves()
    {
        var product = new Product
        {
            Id = 4,
            StockQuantity = 10
        };

        _productyRepositoryMock
            .Setup(pr => pr.GetById(4))
            .Returns(product);

        var existingCartProduct = new CartProduct
        {
            CartId = 1,
            ProductId = 4,
            Quantity = 1
        };

        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 4))
            .Returns(new List<CartProduct> { existingCartProduct }.AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 4,
            Quantity = 5
        };

        var result = await _cartService.UpdateCartProduct(1, dto);

        Assert.That(existingCartProduct.Quantity, Is.EqualTo(5));
        Assert.That(result.Quantity, Is.EqualTo(5));
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
    }

    [Test]
    public async Task UpdateCartProduct_WhenQuantityZero_RemovesProduct()
    {
        var product = new Product
        {
            Id = 5,
            StockQuantity = 10
        };

        _productyRepositoryMock
            .Setup(pr => pr.GetById(5))
            .Returns(product);

        var existingCartProduct = new CartProduct
        {
            CartId = 1,
            ProductId = 5,
            Quantity = 3
        };

        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 5))
            .Returns(new List<CartProduct> { existingCartProduct }.AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 5,
            Quantity = 0
        };

        var result = await _cartService.UpdateCartProduct(1, dto);

        _cartProductRepositoryMock.Verify(cr => cr.Remove(It.IsAny<CartProduct>()), Times.Once);
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
        Assert.That(result.Quantity, Is.EqualTo(0));
    }

    [Test]
    public void UpdateCartProduct_WhenProductNotOnCart_ThrowsException()
    {
        var product = new Product
        {
            Id = 6,
            StockQuantity = 10
        };

        _productyRepositoryMock
            .Setup(pr => pr.GetById(6))
            .Returns(product);

        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 6))
            .Returns(Enumerable.Empty<CartProduct>().AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 6,
            Quantity = 1
        };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.UpdateCartProduct(1, dto));
    }

    #endregion

    #region RemoveCartProduct

    [Test]
    public async Task RemoveCartProduct_WhenProductOnCart_RemovesAndSaves()
    {
        var existingCartProduct = new CartProduct
        {
            CartId = 1,
            ProductId = 7,
            Quantity = 3
        };

        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 7))
            .Returns(new List<CartProduct> { existingCartProduct }.AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 7,
            Quantity = 3
        };

        await _cartService.RemoveCartProduct(1, dto);

        _cartProductRepositoryMock.Verify(cr => cr.Remove(existingCartProduct), Times.Once);
        _uowMock.Verify(uow => uow.CompleteAsync(), Times.Once);
    }

    [Test]
    public void RemoveCartProduct_WhenProductNotOnCart_ThrowsException()
    {
        _cartProductRepositoryMock
            .Setup(cr => cr.GetByCartIdAndProductId(1, 8))
            .Returns(Enumerable.Empty<CartProduct>().AsQueryable());

        var dto = new CartProductDto
        {
            ProductId = 8,
            Quantity = 1
        };

        Assert.ThrowsAsync<AbcExecptionException>(
            async () => await _cartService.RemoveCartProduct(1, dto));
    }

    #endregion
}
