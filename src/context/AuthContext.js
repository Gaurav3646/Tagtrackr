import { useContext, createContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [startDate, setStartDate] = useState(new Date());
  const handlerDate = (date) => {
    setStartDate(date);
    console.log(date);
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    // signInWithPopup(auth, provider);
    await signInWithRedirect(auth, provider);
  };

  const [sear, setSear] = useState("");
  const logOut = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setCurrentUser(currentUser);
      console.log("User", currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        logOut,
        sear,
        setSear,
        googleSignIn,
        startDate,
        handlerDate,
        // status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
