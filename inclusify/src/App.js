import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Reports from "./components/Reports";
import Login from "./components/Login";
import Reviews from "./components/Reviews";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="container mt-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
