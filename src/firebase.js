// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMGKsYerCivz8oLn5vVOsXdWPxQlWsmno",
  authDomain: "assettracer-5fbd9.firebaseapp.com",
  databaseURL: "https://assettracer-5fbd9-default-rtdb.firebaseio.com",
  projectId: "assettracer-5fbd9",
  storageBucket: "assettracer-5fbd9.appspot.com",
  messagingSenderId: "758579720933",
  appId: "1:758579720933:web:c3b540b79be8de4b815a0c",
  measurementId: "G-XT5Y04HES6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
export { app, auth, db };
