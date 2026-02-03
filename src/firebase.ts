import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZq3RTz8yBBfExuC5Gw0rpr5iIa3rxtI8",
  authDomain: "fleetwatch-ngju7.firebaseapp.com",
  projectId: "fleetwatch-ngju7",
  storageBucket: "fleetwatch-ngju7.firebasestorage.app",
  messagingSenderId: "222852489599",
  appId: "1:222852489599:web:e9644112d10d50394dba4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence enabled
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db, auth, googleProvider };
