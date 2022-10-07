




import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBU2lZ_qxl2M4SZ_BE12-_f2BqdoUAHdmk",
  authDomain: "ditolive-5e611.firebaseapp.com",
  projectId: "ditolive-5e611",
  storageBucket: "ditolive-5e611.appspot.com",
  messagingSenderId: "516008746184",
  appId: "1:516008746184:web:79204bf20868c8864659fd"
};

const app = initializeApp(firebaseConfig)


const auth = getAuth()

export { auth }