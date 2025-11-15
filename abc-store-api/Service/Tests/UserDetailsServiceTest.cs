using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Dto;
using Moq;
using NUnit.Framework;

namespace ABCStoreAPI.Service.Tests
{
    [TestFixture]
    public class UserDetailsServiceTest
    {
        private Mock<IUnitOfWork> _uowMock = null!;
        private Mock<IUserDetailsRepository> _userDetailsRepositoryMock = null!;
        private UserDetailsService _service = null!;

        [SetUp]
        public void SetUp()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _userDetailsRepositoryMock = new Mock<IUserDetailsRepository>();

            _uowMock.Setup(u => u.UserDetails).Returns(_userDetailsRepositoryMock.Object);

            _service = new UserDetailsService(_uowMock.Object);
        }

        #region UpdateCreateUserDetails - validation

        [Test]
        public void UpdateCreateUserDetails_WhenUserDetailsIsNull_Throws()
        {
            var ex = Assert.Throws<Exception>(() => _service.UpdateCreateUserDetails(null!));
            Assert.That(ex!.Message, Is.EqualTo("Invalid user details."));
            _userDetailsRepositoryMock.Verify(r => r.Add(It.IsAny<UserDetails>()), Times.Never);
            _uowMock.Verify(u => u.Complete(), Times.Never);
        }

        [Test]
        public void UpdateCreateUserDetails_WhenUserIdMissing_Throws()
        {
            var dto = new UserDetailsDto
            {
                UserId = "",
                FirstName = "John",
                LastName = "Doe",
                PreferredCurrency = "USD"
            };

            var ex = Assert.Throws<Exception>(() => _service.UpdateCreateUserDetails(dto));
            Assert.That(ex!.Message, Is.EqualTo("Invalid user details."));
            _userDetailsRepositoryMock.Verify(r => r.Add(It.IsAny<UserDetails>()), Times.Never);
            _uowMock.Verify(u => u.Complete(), Times.Never);
        }

        #endregion

        #region Create path (user does not exist)

        [Test]
        public void UpdateCreateUserDetails_WhenUserDoesNotExist_CreatesNewUser()
        {
            var dto = new UserDetailsDto
            {
                UserId = "user-1",
                FirstName = "John",
                LastName = "Doe",
                PreferredCurrency = "USD",
                ContactNumber = "1234567890",
                BillingAddress = new AddressDto
                {
                    AddressLine1 = "Line1",
                    AddressLine2 = "Line2",
                    ZipCode = "0001"
                }
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns((UserDetails?)null);

            UserDetails? captured = null;
            _userDetailsRepositoryMock
                .Setup(r => r.Add(It.IsAny<UserDetails>()))
                .Callback<UserDetails>(u => captured = u);

            _service.UpdateCreateUserDetails(dto);

            Assert.That(captured, Is.Not.Null);
            Assert.That(captured!.UserId, Is.EqualTo("user-1"));
            Assert.That(captured.FirstName, Is.EqualTo("John"));
            Assert.That(captured.LastName, Is.EqualTo("Doe"));
            Assert.That(captured.PreferredCurrency, Is.EqualTo("USD"));
            Assert.That(captured.ContactNumber, Is.EqualTo("1234567890"));
            Assert.That(captured.CreatedBy, Is.EqualTo("System"));
            Assert.That(captured.UpdatedBy, Is.EqualTo("System"));

            Assert.That(captured.BillingAddress, Is.Not.Null);
            Assert.That(captured.BillingAddress!.AddressLine1, Is.EqualTo("Line1"));
            Assert.That(captured.BillingAddress.AddressLine2, Is.EqualTo("Line2"));
            Assert.That(captured.BillingAddress.ZipCode, Is.EqualTo("0001"));
            Assert.That(captured.BillingAddress.AddressType, Is.EqualTo(AddressType.BILLING));
            Assert.That(captured.BillingAddress.CreatedBy, Is.EqualTo("System"));
            Assert.That(captured.BillingAddress.UpdatedBy, Is.EqualTo("System"));
            Assert.That(captured.BillingAddress.CreatedAt, Is.Not.EqualTo(default(DateTime)));
            Assert.That(captured.BillingAddress.UpdatedAt, Is.Not.EqualTo(default(DateTime)));

            _userDetailsRepositoryMock.Verify(r => r.Add(It.IsAny<UserDetails>()), Times.Once);
            _uowMock.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateCreateUserDetails_WhenNewUserMissingRequiredFields_Throws()
        {
            var dto = new UserDetailsDto
            {
                UserId = "user-1",
                FirstName = "",
                LastName = "Doe",
                PreferredCurrency = "USD"
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns((UserDetails?)null);

            var ex = Assert.Throws<Exception>(() => _service.UpdateCreateUserDetails(dto));
            Assert.That(ex!.Message, Is.EqualTo("Invalid user details."));

            _userDetailsRepositoryMock.Verify(r => r.Add(It.IsAny<UserDetails>()), Times.Never);
            _uowMock.Verify(u => u.Complete(), Times.Never);
        }

        #endregion

        #region Update path (user exists)

        [Test]
        public void UpdateCreateUserDetails_WhenUserExistsAndNoBillingAddress_AddsBillingAddress()
        {
            var existing = new UserDetails
            {
                UserId = "user-1",
                FirstName = "Old",
                LastName = "Name",
                PreferredCurrency = "ZAR",
                BillingAddress = null
            };

            var dto = new UserDetailsDto
            {
                UserId = "user-1",
                FirstName = "NewFirst",
                LastName = "NewLast",
                PreferredCurrency = "USD",
                ContactNumber = "999",
                BillingAddress = new AddressDto
                {
                    AddressLine1 = "NewLine1",
                    AddressLine2 = "NewLine2",
                    ZipCode = "9999"
                }
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(existing);

            _service.UpdateCreateUserDetails(dto);

            Assert.That(existing.FirstName, Is.EqualTo("NewFirst"));
            Assert.That(existing.LastName, Is.EqualTo("NewLast"));
            Assert.That(existing.PreferredCurrency, Is.EqualTo("USD"));
            Assert.That(existing.ContactNumber, Is.EqualTo("999"));
            Assert.That(existing.UpdatedAt, Is.Not.EqualTo(default(DateTime)));

            Assert.That(existing.BillingAddress, Is.Not.Null);
            Assert.That(existing.BillingAddress!.AddressLine1, Is.EqualTo("NewLine1"));
            Assert.That(existing.BillingAddress.AddressLine2, Is.EqualTo("NewLine2"));
            Assert.That(existing.BillingAddress.ZipCode, Is.EqualTo("9999"));
            Assert.That(existing.BillingAddress.AddressType, Is.EqualTo(AddressType.BILLING));
            Assert.That(existing.BillingAddress.CreatedAt, Is.Not.EqualTo(default(DateTime)));
            Assert.That(existing.BillingAddress.UpdatedAt, Is.Not.EqualTo(default(DateTime)));

            _userDetailsRepositoryMock.Verify(r => r.Add(It.IsAny<UserDetails>()), Times.Never);
            _uowMock.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateCreateUserDetails_WhenUserExistsAndBillingAddressExists_UpdatesBillingAddress()
        {
            var existing = new UserDetails
            {
                UserId = "user-1",
                FirstName = "Old",
                LastName = "Name",
                PreferredCurrency = "ZAR",
                ContactNumber = "111",
                BillingAddress = new Address
                {
                    AddressLine1 = "OldLine1",
                    AddressLine2 = "OldLine2",
                    ZipCode = "0000",
                    AddressType = AddressType.BILLING,
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1),
                    CreatedBy = "System",
                    UpdatedBy = "System"
                }
            };

            var dto = new UserDetailsDto
            {
                UserId = "user-1",
                FirstName = "NewFirst",
                LastName = "NewLast",
                PreferredCurrency = "USD",
                ContactNumber = "222",
                BillingAddress = new AddressDto
                {
                    AddressLine1 = "NewLine1",
                    AddressLine2 = "NewLine2",
                    ZipCode = "9999"
                }
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(existing);

            _service.UpdateCreateUserDetails(dto);

            Assert.That(existing.FirstName, Is.EqualTo("NewFirst"));
            Assert.That(existing.LastName, Is.EqualTo("NewLast"));
            Assert.That(existing.PreferredCurrency, Is.EqualTo("USD"));
            Assert.That(existing.ContactNumber, Is.EqualTo("222"));
            Assert.That(existing.UpdatedAt, Is.Not.EqualTo(default(DateTime)));

            Assert.That(existing.BillingAddress, Is.Not.Null);
            Assert.That(existing.BillingAddress!.AddressLine1, Is.EqualTo("NewLine1"));
            Assert.That(existing.BillingAddress.AddressLine2, Is.EqualTo("NewLine2"));
            Assert.That(existing.BillingAddress.ZipCode, Is.EqualTo("9999"));

            Assert.That(existing.BillingAddress.AddressType, Is.EqualTo(AddressType.SHIPPING));
            Assert.That(existing.BillingAddress.UpdatedAt, Is.Not.EqualTo(default(DateTime)));
            Assert.That(existing.BillingAddress.UpdatedBy, Is.EqualTo("System"));

            _userDetailsRepositoryMock.Verify(r => r.Add(It.IsAny<UserDetails>()), Times.Never);
            _uowMock.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateCreateUserDetails_WhenUserExistsAndDtoMissingRequiredFields_Throws()
        {
            var existing = new UserDetails
            {
                UserId = "user-1",
                FirstName = "Old",
                LastName = "Name",
                PreferredCurrency = "ZAR"
            };

            var dto = new UserDetailsDto
            {
                UserId = "user-1",
                FirstName = "",
                LastName = "NewLast",
                PreferredCurrency = "USD"
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(existing);

            var ex = Assert.Throws<Exception>(() => _service.UpdateCreateUserDetails(dto));
            Assert.That(ex!.Message, Is.EqualTo("Invalid user details."));

            _uowMock.Verify(u => u.Complete(), Times.Never);
        }

        #endregion

        #region GetUserDetails

        [Test]
        public void GetUserDetails_WhenUserNotFound_Throws()
        {
            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("missing"))
                .Returns((UserDetails?)null);

            var ex = Assert.Throws<Exception>(() => _service.GetUserDetails("missing"));
            Assert.That(ex!.Message, Is.EqualTo("User details not found."));
        }

        [Test]
        public void GetUserDetails_WhenUserExists_ReturnsDto()
        {
            var user = new UserDetails
            {
                UserId = "user-1",
                FirstName = "John",
                LastName = "Doe",
                PreferredCurrency = "USD",
                ContactNumber = "123",
                BillingAddress = new Address()
                {
                    AddressLine1 = "Line1",
                    AddressLine2 = "Line2",
                    ZipCode = "1234"
                }
            };

            _userDetailsRepositoryMock
                .Setup(r => r.GetByUserId("user-1"))
                .Returns(user);

            var dto = _service.GetUserDetails("user-1");

            Assert.That(dto, Is.Not.Null);
            Assert.That(dto.UserId, Is.EqualTo("user-1"));
            Assert.That(dto.FirstName, Is.EqualTo("John"));
            Assert.That(dto.LastName, Is.EqualTo("Doe"));
            Assert.That(dto.PreferredCurrency, Is.EqualTo("USD"));
            Assert.That(dto.ContactNumber, Is.EqualTo("123"));
            Assert.That(dto.BillingAddress?.AddressLine1, Is.EqualTo("Line1"));
            Assert.That(dto.BillingAddress?.AddressLine2, Is.EqualTo("Line2"));
            Assert.That(dto.BillingAddress?.ZipCode, Is.EqualTo("1234"));

        }

        #endregion
    }
}
