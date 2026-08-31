import { auth } from "../firebase/firebase";
import {
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const doSignOut = () => {
  return auth.signOut();
};