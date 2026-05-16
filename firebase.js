// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } 
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuzHhnGNZDfjdJlfQMlqU76FY4Xp8ZnQE",
  authDomain: "enderecos-ea50e.firebaseapp.com",
  projectId: "enderecos-ea50e",
  storageBucket: "enderecos-ea50e.firebasestorage.app",
  messagingSenderId: "530757930448",
  appId: "1:530757930448:web:4a032f48c32291bbdf3dd5",
  measurementId: "G-6DNTTZED64"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔥 FIX DEFINITIVO DO "DESLOGA SOZINHO"
setPersistence(auth, browserLocalPersistence);