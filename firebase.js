// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDx-zN7rKyDivezJY_jpdnyB1P6dvSI9WI",
  authDomain: "live-score-f4f27.firebaseapp.com",
  databaseURL: "https://live-score-f4f27-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "live-score-f4f27",
  storageBucket: "live-score-f4f27.appspot.com", // <-- FIXED HERE
  messagingSenderId: "542532741836",
  appId: "1:542532741836:web:871520a37565342d187069",
  measurementId: "G-5L4K9TX51C"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, update, get };
