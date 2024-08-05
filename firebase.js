// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALdgCCih2jhuB8GwYVPjFMxkOuEjko_1U",
  authDomain: "pantryapp-5bd30.firebaseapp.com",
  projectId: "pantryapp-5bd30",
  storageBucket: "pantryapp-5bd30.appspot.com",
  messagingSenderId: "219361300436",
  appId: "1:219361300436:web:66b0c78c5cb7434a9d9041"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore }
