import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [username, setUsername] = useState(localStorage.getItem("username") || "");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        setIsLoggedIn(!!token);
        setUsername(storedUsername || ""); // Ensure username updates
    }, []);

    const login = (username, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username); // ✅ Store username
        setIsLoggedIn(true);
        setUsername(username);
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setUsername(""); // Clear state
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
