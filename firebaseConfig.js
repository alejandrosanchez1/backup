// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Para la base de datos
import { getAuth } from "firebase/auth";           // Para usuarios

const firebaseConfig = {
  apiKey: "AIzaSyD4fxOsUpusMiekwN7c-YcdWnyN_EKJU-E",
  authDomain: "my-fit-app-cc7c0.firebaseapp.com",
  projectId: "my-fit-app-cc7c0",
  storageBucket: "my-fit-app-cc7c0.firebasestorage.app",
  messagingSenderId: "598467192760",
  appId: "1:598467192760:web:ad4c55c84519603ba2114d",
  measurementId: "G-25EPTWK7WB"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportamos los servicios para usarlos en tus componentes
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
