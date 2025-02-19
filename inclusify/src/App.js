import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Reports from "./components/Reports";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home/>} /> {/*Homepage*/}
            <Route path="/reports" element={<Reports/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
