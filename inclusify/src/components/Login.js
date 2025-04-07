import React, {useState, useContext} from "react";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

const Login = () => {
    const {login} = useContext(AuthContext);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerUsername, setRegisterUsername] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const navigate = useNavigate();

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
                    setLoginError("Invalid username or password.");
                } else {
                    // Fallback for any other unexpected error
                    setLoginError("Invalid credentials.");
                }
            }
        } catch (err) {
            console.log("Login error:", err);
            setLoginError("An error occurred. Please try again.");
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
                alert("Registration successful! Please log in.");
                setRegisterUsername("");
                setRegisterPassword("");
            } else {
                setRegisterError(data.message || "Registration failed");
            }
        } catch (err) {
            setRegisterError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="container login-container">
            <div className="row">
                {/* Registration Section */}
                <div className="col-md-6 left-section">
                    <h2>Register</h2>
                    {registerError && <p className="error-message" style={{color: 'red'}}>{registerError}</p>}
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
                        {registerError && <p className="error-message" style={{color: 'red'}}>{registerError}</p>}
                    </form>
                </div>

                {/* Login Section */}
                <div className="col-md-6 right-section">
                    <h2>Login</h2>
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
                        {loginError && <p className="error-message"
                                          style={{color: 'red'}}>{loginError}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
