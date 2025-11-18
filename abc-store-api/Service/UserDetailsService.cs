using System.ComponentModel.DataAnnotations;
using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Dto;
using ABCStoreAPI.Service.Validation;

namespace ABCStoreAPI.Service;

public interface IUserDetailsService
{
    void UpdateCreateUserDetails([Required] UserDetailsDto userDetails);
    UserDetailsDto GetUserDetails(string userId);
}

public class UserDetailsService : IUserDetailsService
{
    private readonly IUnitOfWork _uow;

    public UserDetailsService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    private void CreateUserDetails(UserDetailsDto userDetails)
    {
        UserDetails newUserDetails = new UserDetails()
        {
            UserId = userDetails.UserId,
            FirstName = userDetails.FirstName,
            LastName = userDetails.LastName,
            PreferredCurrency = userDetails.PreferredCurrency,
            ContactNumber = userDetails.ContactNumber,
            CreatedBy = "System",
            UpdatedBy = "System"
        };

        if (userDetails.BillingAddress != null)
        {
            newUserDetails.BillingAddress = new Address()
            {
                AddressLine1 = userDetails.BillingAddress.AddressLine1,
                AddressLine2 = userDetails.BillingAddress.AddressLine2,
                ZipCode = userDetails.BillingAddress.ZipCode,
                AddressType = AddressType.BILLING,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                UpdatedBy = "System"
            };
        }

        _uow.UserDetails.Add(newUserDetails);
        _uow.Complete();
    }

    private void UpdateUserDetails(UserDetailsDto userDetails, UserDetails existingUserDetails)
    {
        existingUserDetails.FirstName = userDetails.FirstName;
        existingUserDetails.LastName = userDetails.LastName;
        existingUserDetails.PreferredCurrency = userDetails.PreferredCurrency;
        existingUserDetails.UpdatedAt = DateTime.UtcNow;
        existingUserDetails.ContactNumber = userDetails.ContactNumber;

        if (userDetails.BillingAddress != null)
        {
            if (existingUserDetails.BillingAddress == null)
            {
                existingUserDetails.BillingAddress = new Address()
                {
                    AddressLine1 = userDetails.BillingAddress.AddressLine1,
                    AddressLine2 = userDetails.BillingAddress.AddressLine2,
                    ZipCode = userDetails.BillingAddress.ZipCode,
                    AddressType = AddressType.BILLING,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    UpdatedBy = "System"
                };
            }
            else
            {
                existingUserDetails.BillingAddress.AddressLine1 = userDetails.BillingAddress.AddressLine1;
                existingUserDetails.BillingAddress.AddressLine2 = userDetails.BillingAddress.AddressLine2;
                existingUserDetails.BillingAddress.ZipCode = userDetails.BillingAddress.ZipCode;
                existingUserDetails.BillingAddress.AddressType = AddressType.SHIPPING;
                existingUserDetails.BillingAddress.UpdatedAt = DateTime.UtcNow;
                existingUserDetails.BillingAddress.UpdatedBy = "System";
            }
        }

        _uow.Complete();
    }

    [Validated]
    public void UpdateCreateUserDetails(UserDetailsDto userDetails)
    {
        var user = _uow.UserDetails.GetByUserId(userDetails.UserId);
        if (user == null)
        {
            CreateUserDetails(userDetails);
        }
        else
        {
            UpdateUserDetails(userDetails, user);
        }
    }

    [Validated]
    public UserDetailsDto GetUserDetails([Required][StringLength(20, MinimumLength = 3)] string userId)
    {
        var user = _uow.UserDetails.GetByUserId(userId);
        if (user == null)
        {
            throw new Exception("User details not found.");
        }
        return UserDetailsDto.toDto(user);
    }

}
