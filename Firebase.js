// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStroage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiRMX2juVcI5oVf45z9ksUfvsONvNWK0E",
  authDomain: "we-are-233.firebaseapp.com",
  projectId: "we-are-233",
  storageBucket: "we-are-233.appspot.com",
  messagingSenderId: "93701474508",
  appId: "1:93701474508:web:ea00f7e1704498ecda5a69",
  measurementId: "G-H14M3284V7"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStroage)
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

