




import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzNlYb6KECB-rBnKUhb9t1am75ifIvGrw",
  authDomain: "dito-4b412.firebaseapp.com",
  projectId: "dito-4b412",
  storageBucket: "dito-4b412.appspot.com",
  messagingSenderId: "69037442589",
  appId: "1:69037442589:web:e4d9aa6d36ca42648228f4",
  measurementId: "G-Q4MK1SYW8X",
};

const app = initializeApp(firebaseConfig)


const auth = getAuth(app)

export { auth }