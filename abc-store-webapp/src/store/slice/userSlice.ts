import { createSlice } from '@reduxjs/toolkit';

export enum UserState {
  PENDING,
  COMPLETE,
  SKIPPED,
}

export type User = {
  accessToken: string;
  uid: string;
  email: string;
  state: UserState | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  preferredCurrency: string | undefined;
};

const initialState: User = {
  accessToken: '',
  uid: '',
  email: '',
  state: undefined,
  firstName: undefined,
  lastName: undefined,
  preferredCurrency: undefined,
};

const userslice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUser: (state, action: { payload: User | null }) => {
      if (action.payload) {
        state = { ...action.payload };
      } else {
        state = initialState;
      }
      return state;
    },
    updateUserState: (state, action: { payload: UserState }) => {
      if (state.state) {
        state.state = action.payload;
      }
    },
  },
});

export const selectUser = (state: { user: User | null }) => state.user;
export const selectUserState = (state: { user: User | null }) => state.user?.state;

export const { setUser, updateUserState } = userslice.actions;

export default userslice.reducer;
