import React, {useState, useContext, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

const Login = () => {
    const {login} = useContext(AuthContext);
    const [notification, setNotification] = useState("");
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification("");
            }, 4000); // 4 seconds

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: loginUsername, password: loginPassword}),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful. Setting user:", loginUsername); // Debug
                console.log("Login successful. Setting userID:", data.userID); // Debug
                login(loginUsername, data.token, data.userID);
                navigate("/");
            } else {
                if (data.message && data.message.toLowerCase().includes("invalid username or password")) {
                    setNotification("Invalid username or password")
                } else {
                    // Fallback for any other unexpected error
                    setNotification("Invalid credentials.");
                }
            }
        } catch (err) {
            console.log("Login error:", err);
            setNotification("An error occurred. Please try again.");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username: registerUsername, password: registerPassword}),
            });

            const data = await response.json();

            if (response.ok) {
                setNotification("Registration successful! Please log in.");
                setRegisterUsername("");
                setRegisterPassword("");
            } else {
                setNotification(data.message || "Registration failed")
            }
        } catch (err) {
            setNotification("An error occurred. Please try again.");
        }
    };

    return (
        <div id="login" className="container login-container">
            <div className="row">
                {/* Registration Section */}
                <div id="left" className="col-md-5 left-section">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label> <h5> Username: </h5></label>
                            <input
                                type="text"
                                className="form-control"
                                value={registerUsername}
                                onChange={(e) => setRegisterUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><h5>Password:</h5></label>
                            <input
                                type="password"
                                className="form-control"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-success">Register</button>
                    </form>
                </div>
                <div className="col">
                    <div className="p-0.5"></div>
                </div>
                {/* Login Section */}
                <div id="right" className="col-md-5 right-section">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label><h5>Username:</h5></label>
                            <input
                                type="text"
                                className="form-control"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><h5>Password:</h5></label>
                            <input
                                type="password"
                                className="form-control"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
            {notification && (
                <div className="notification">
                    {notification}
                </div>
            )}

        </div>
    );
};

export default Login;
