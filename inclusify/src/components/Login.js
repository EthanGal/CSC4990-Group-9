import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: loginUsername, password: loginPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful. Setting user:", loginUsername); // Debug
                login(loginUsername, data.token);  // ✅ Ensure both username & token are passed
                navigate("/");
            } else {
                console.log("Login failed:", data.message);
                setError(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.log("Login error:", err);
            setError("An error occurred. Please try again.");
        }
    };


    // Handle Registration
    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: registerUsername, password: registerPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! Please log in.");
                setRegisterUsername("");
                setRegisterPassword("");
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="container login-container">
            <div className="row">
                {/* Registration Section */}
                <div className="col-md-6 left-section">
                    <h2>Register</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={registerUsername}
                                onChange={(e) => setRegisterUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
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

                {/* Login Section */}
                <div className="col-md-6 right-section">
                    <h2>Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
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
        </div>
    );
};

export default Login;
