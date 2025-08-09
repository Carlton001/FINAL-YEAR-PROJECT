// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStroage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDidgGHHjbLumrJUeVXhxir7JFshIe4D-0",
  authDomain: "jobshopgh.firebaseapp.com",
  projectId: "jobshopgh",
  storageBucket: "jobshopgh.firebasestorage.app",
  messagingSenderId: "1027634614949",
  appId: "1:1027634614949:web:291a17b2d5b63aec58334c",
  measurementId: "G-Q2Y7J1C5HG"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStroage)
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

