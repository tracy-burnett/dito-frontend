




import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_FRONTEND_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_FRONTEND_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_FRONTEND_PROJECTID,
  storageBucket: process.env.VUE_APP_FIREBASE_FRONTEND_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_FRONTEND_MESSAGINGSENDERID,
  appId: process.env.VUE_APP_FIREBASE_FRONTEND_APPID
};

const app = initializeApp(firebaseConfig)


const auth = getAuth()

export { auth }