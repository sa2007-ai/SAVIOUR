import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeWbaxPstmebT4FP0Gf3ndki1CwOdtjy4",
  authDomain: "saviour-5e230.firebaseapp.com",
  projectId: "saviour-5e230",
  storageBucket: "saviour-5e230.firebasestorage.app",
  messagingSenderId: "931424840548",
  appId: "1:931424840548:web:0838560b506ddabe8b2871",
  measurementId: "G-XX46TP924P"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

console.log("SAVIOUR Firebase connected:", firebaseApp.name);
