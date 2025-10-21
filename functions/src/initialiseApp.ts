import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import config from "./config.js";

const initialiseApp = () => {
  const app = initializeApp(config.firebaseConfig);
  const storage = getStorage(app);

  return {
    app,
    storage,
  };
};

export default initialiseApp;
