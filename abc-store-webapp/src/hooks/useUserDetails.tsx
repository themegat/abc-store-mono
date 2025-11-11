import { UserDetailsDto, usePostApiUserDetailsUpdateCreateMutation } from '@/store/api/abcApi';

const useUserDetails = () => {
  const [createUpdateUserRequest, { isLoading: userUpdating }] =
    usePostApiUserDetailsUpdateCreateMutation();

  const createUpdateUser = async (user: UserDetailsDto) => {
    return await createUpdateUserRequest({
      userDetailsDto: user,
    }).unwrap();
  };

  return {
    createUpdateUser,
    userUpdating,
  };
};

export default useUserDetails;
