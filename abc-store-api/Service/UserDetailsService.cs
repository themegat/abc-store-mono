using ABCStoreAPI.Database.Model;
using ABCStoreAPI.Repository;
using ABCStoreAPI.Service.Dto;

namespace ABCStoreAPI.Service;

public class UserDetailsService
{
    private readonly IUnitOfWork _uow;

    public UserDetailsService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    private void CreateUserDetails(UserDetailsDto userDetails)
    {
        if (userDetails == null || string.IsNullOrEmpty(userDetails.UserId)
            || string.IsNullOrEmpty(userDetails.FirstName)
            || string.IsNullOrEmpty(userDetails.LastName)
            || string.IsNullOrEmpty(userDetails.PreferredCurrency))
        {
            throw new Exception("Invalid user details.");
        }

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
        if (userDetails == null || string.IsNullOrEmpty(userDetails.UserId)
            || string.IsNullOrEmpty(userDetails.FirstName)
            || string.IsNullOrEmpty(userDetails.LastName)
            || string.IsNullOrEmpty(userDetails.PreferredCurrency))
        {
            throw new Exception("Invalid user details.");
        }

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

    public void UpdateCreateUserDetails(UserDetailsDto userDetails)
    {
        if (userDetails == null || string.IsNullOrEmpty(userDetails.UserId))
        {
            throw new Exception("Invalid user details.");
        }

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

    public UserDetailsDto GetUserDetails(string userId)
    {
        var user = _uow.UserDetails.GetByUserId(userId);
        if (user == null)
        {
            throw new Exception("User details not found.");
        }
        return UserDetailsDto.toDto(user);
    }

}
