import { createContext, useContext, useEffect, useState } from 'react';
import { ReactNode } from 'react';

import { User, getAuth, onAuthStateChanged } from 'firebase/auth';

import { abcApi } from '@/store/api/abcApi';
import { UserState } from '@/store/app-reducer';
import { store } from '@/store/store';

import { User as AppUser } from '../../store/app-reducer';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  auth: ReturnType<typeof getAuth> | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  auth: null,
});

export const useAuthStatus = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [getUserDetails] = abcApi.endpoints.getApiUserDetails.useLazyQuery();

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const token = currentUser.toJSON() as any;
        const UserDetails = await getUserDetails({ userId: currentUser.uid });
        const newUser: AppUser = {
          accessToken: token.stsTokenManager.accessToken,
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          firstName: UserDetails.data?.firstName ?? undefined,
          lastName: UserDetails.data?.lastName ?? undefined,
          preferredCurrency: UserDetails.data?.preferredCurrency ?? undefined,
          state: UserDetails.data ? UserState.COMPLETE : UserState.PENDING,
        };

        store.dispatch({
          type: 'SET_USER',
          payload: newUser,
        });
      } else {
        setUser(null);
        store.dispatch({ type: 'SET_USER', payload: null });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading, auth: getAuth() };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authStatus = useAuthStatus();

  return <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
