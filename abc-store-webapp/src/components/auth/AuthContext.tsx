import { createContext, useContext, useEffect, useState } from 'react';
import { ReactNode } from 'react';

import { User, getAuth, onAuthStateChanged } from 'firebase/auth';

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

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
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
