// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYLE0CSem8K8xWuZIFMEmVbje6lZ4RWuE",
  authDomain: "login-ecos.firebaseapp.com",
  projectId: "login-ecos",
  storageBucket: "login-ecos.firebasestorage.app",
  messagingSenderId: "137791723274",
  appId: "1:137791723274:web:d9337f5e11c3281a3b8cf3",
  measurementId: "G-E1M8NRXFMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);