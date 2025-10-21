import { getAuth } from 'firebase/auth';

export async function getFirebaseIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn('Attempted to fetch token, but no user is logged in.');
    return null;
  }

  try {
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error fetching Firebase ID token:', error);
    return null;
  }
}
