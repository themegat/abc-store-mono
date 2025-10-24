import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const initialiseApp = () => {
  const firebaseConfigString = process.env.FIREBASE_CONFIG;
  if (!firebaseConfigString) {
    throw new Error("Missing Firebase config");
  }
  const firebaseConfig = JSON.parse(firebaseConfigString);
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  return {
    app,
    storage,
  };
};

export default initialiseApp;
