import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyB1CrN1757mIwO0kjlrSeQXA-0y3VZl2vU",
  authDomain: "hackaton-19d6d.firebaseapp.com",
  projectId: "hackaton-19d6d",
  storageBucket: "hackaton-19d6d.firebasestorage.app",
  messagingSenderId: "531051829748",
  appId: "1:531051829748:web:87b515fb3bfd0d2ab581a1",
  measurementId: "G-TNJTVP3KRK"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const db = getFirestore(app);


enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore: офлайн-персистентность включена');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {

      console.warn('Firestore: персистентность не включена - открыто несколько вкладок');
    } else if (err.code === 'unimplemented') {

      console.warn('Firestore: персистентность не реализована в данном браузере');
    } else {
      console.error('Firestore: ошибка включения персистентности', err);
    }
  });

export default app; 