import { createContext, useContext, useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { User as FirebaseUser, getAuth, onAuthStateChanged } from 'firebase/auth';

import { abcApi } from '@/store/api/abcApi';
import { User, UserState, setUser } from '@/store/slice/userSlice';
import { AppDispatch } from '@/store/store';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  auth: ReturnType<typeof getAuth> | null;
}

export const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  loading: true,
  auth: null,
});

export const useAuthStatus = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [getUserDetails] = abcApi.endpoints.getApiUserDetails.useLazyQuery();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
        const token = await authInstance.currentUser?.getIdToken();
        const UserDetails = await getUserDetails({ userId: currentUser.uid });
        const newUser: User = {
          accessToken: token ?? '',
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          firstName: UserDetails.data?.firstName ?? undefined,
          lastName: UserDetails.data?.lastName ?? undefined,
          preferredCurrency: UserDetails.data?.preferredCurrency ?? undefined,
          state: UserDetails.data ? UserState.COMPLETE : UserState.PENDING,
        };

        dispatch({
          type: 'SET_USER',
          payload: newUser,
        });
        dispatch(setUser(newUser));
      } else {
        setFirebaseUser(null);
        dispatch(setUser(null));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { firebaseUser, loading, auth: getAuth() };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authStatus = useAuthStatus();

  return <AuthContext.Provider value={authStatus}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
