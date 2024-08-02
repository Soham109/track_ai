import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAY4kh04kxmjtL5ks949EciNjXnAYrh87A",
  authDomain: "track-ai-95e6d.firebaseapp.com",
  projectId: "track-ai-95e6d",
  storageBucket: "track-ai-95e6d.appspot.com",
  messagingSenderId: "121690907004",
  appId: "1:121690907004:web:ceab8fb4b9b1f43f9004f9",
  measurementId: "G-7PBDXSEEHK"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };