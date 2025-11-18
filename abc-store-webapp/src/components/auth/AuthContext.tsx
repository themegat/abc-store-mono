import { createContext, useContext, useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { User as FirebaseUser, getAuth, onAuthStateChanged } from 'firebase/auth';

import useUserDetails from '@/hooks/useUserDetails';
import { setCart } from '@/store/slice/cartSlice';
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
  const dispatch = useDispatch<AppDispatch>();
  const { getUserDetails } = useUserDetails();

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
        const token = await authInstance.currentUser?.getIdToken();
        const userDetails = await getUserDetails({ userId: currentUser.uid });
        const newUser: User = {
          accessToken: token ?? '',
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          userDetails: {
            userId: userDetails.data?.userId ?? '',
            firstName: userDetails.data?.firstName ?? '',
            lastName: userDetails.data?.lastName ?? '',
            preferredCurrency: userDetails.data?.preferredCurrency ?? '',
          },
          state: userDetails.data ? UserState.COMPLETE : UserState.PENDING,
        };

        dispatch(setUser(newUser));
      } else {
        setFirebaseUser(null);
        dispatch(setUser(null));
        dispatch(setCart(null));
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
