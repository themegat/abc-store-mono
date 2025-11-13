import { AbcExceptionResponse } from '@/error-handling/AbcExceptionResponse';
import { useToasterContext } from '@/sections/Toaster/ToasterContext';
import { UserDetailsDto, abcApi, usePostApiUserDetailsUpdateCreateMutation } from '@/store/api/abcApi';

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
      return await createUpdateUserRequest({
        userDetailsDto: user,
      }).unwrap();
    } catch (err) {
      const error = err as AbcExceptionResponse;
      showError(error.data.Message);
    }
  };

  return {
    createUpdateUser,
    userUpdating,
    getUserDetails
  };
};

export default useUserDetails;
