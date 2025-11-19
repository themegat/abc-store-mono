import { AbcExceptionResponse } from '@/error-handling/AbcExceptionResponse';
import { useToasterContext } from '@/sections/Toaster/ToasterContext';
import {
  AddressDto2,
  UserDetailsDto,
  abcApi,
  usePostApiUserDetailsUpdateCreateMutation,
} from '@/store/api/abcApi';

const useUserDetails = () => {
  const toasterContext = useToasterContext();

  const showError = (message: string) => {
    toasterContext.setMessage(message);
    toasterContext.setSeverity('error');
    toasterContext.setOpen(true);
  };

  const [createUpdateUserRequest, { isLoading: userUpdating }] =
    usePostApiUserDetailsUpdateCreateMutation();
  const [getUserDetails] = abcApi.endpoints.getApiUserDetails.useLazyQuery();

  const createUpdateUser = async (user: UserDetailsDto) => {
    try {
      const billingAddress: AddressDto2 = {
        addressLine1: user?.billingAddress?.addressLine1 ?? '',
        addressLine2: user?.billingAddress?.addressLine2 ?? '',
        zipCode: user?.billingAddress?.zipCode ?? '',
        addressType: user?.billingAddress?.addressType ?? 'BILLING',
      };
      return await createUpdateUserRequest({
        userDetailsDto2: {
          userId: user?.userId ?? '',
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          contactNumber: user?.contactNumber ?? '',
          preferredCurrency: user?.preferredCurrency ?? '',
          billingAddress: user?.billingAddress ? billingAddress : undefined,
        },
      }).unwrap();
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  return {
    createUpdateUser,
    userUpdating,
    getUserDetails,
  };
};

export default useUserDetails;
