import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import {toast} from "react-toastify";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey, i am using LumiChat",
            lastSeen: Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatData: []
        })
    } catch (error) {
        console.error(error);
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split("/")[1].split("-").join(" "))
    }
}

const logOut = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error(error);
        toast.error(error.code.split("/")[1].split("-").join(" "))
    }
}

const resetPassword = async (email) => {
    if(!email){
        toast.error("Enter Your Email")
        return null;
    }

    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where("email", "==", email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth, email);
            toast.success("Reset Email Sent");
        }else{
            toast.error("Email Doesn't Exists");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
}

export {signup, login, logOut, auth, db, resetPassword};