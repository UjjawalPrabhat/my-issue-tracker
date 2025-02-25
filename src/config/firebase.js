import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqx2WdtcHdzWnaoB5cM4AdqDrn-hz0pes",
  authDomain: "issue-tracker-d8bba.firebaseapp.com",
  projectId: "issue-tracker-d8bba",
  storageBucket: "issue-tracker-d8bba.firebasestorage.app",
  messagingSenderId: "283764971344",
  appId: "1:283764971344:web:3563a8d1efd4ddd0863e55",
  measurementId: "G-5NVNSC9RBH",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
