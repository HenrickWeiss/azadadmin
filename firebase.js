import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDe4Vag-622YeSnp785etcVYFWNvnHdxZI",
  authDomain: "bestellsystem-c5742.firebaseapp.com",
  projectId: "bestellsystem-c5742",
  storageBucket: "bestellsystem-c5742.firebasestorage.app",
  messagingSenderId: "645088029874",
  appId: "1:645088029874:web:e40e55371a89f49c522dab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
