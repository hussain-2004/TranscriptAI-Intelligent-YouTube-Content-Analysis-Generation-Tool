import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaFHXXtTU6LyuDTPc3SX7S3f3Fn6HnI4c",
  authDomain: "summarizer-project-4da6f.firebaseapp.com",
  projectId: "summarizer-project-4da6f",
  storageBucket: "summarizer-project-4da6f.firebasestorage.app",
  messagingSenderId: "566690815559",
  appId: "1:566690815559:web:ea47db8ed048dd0d555b62",
  measurementId: "G-VDVDEYYHNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics }; 