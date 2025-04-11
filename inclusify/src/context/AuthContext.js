import React, {createContext, useState, useEffect} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [userID, setUserID] = useState(localStorage.getItem("userID") || "");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        const storedUserID = localStorage.getItem("userID");

        setIsLoggedIn(!!token);
        setUsername(storedUsername || "");
        setUserID(storedUserID || "");
        console.log("user id from authcontext:" + userID);
    }, [userID]);


    const login = (username, token, userID) => {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("userID", userID);

        setIsLoggedIn(true);
        setUsername(username);
        setUserID(userID);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userID");

        setIsLoggedIn(false);
        setUsername("");
        setUserID("");
    };
    return (
        <AuthContext.Provider value={{isLoggedIn, username, userID, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};
