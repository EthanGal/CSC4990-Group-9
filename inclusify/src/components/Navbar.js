import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <nav style={{ backgroundColor: "#7484C6", padding: "10px" }} className="navbar mb-3">
        <div className="container-fluid d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <span className="text-primary mb-0 h2">Inclusify</span>
            </div>

            <div className="d-flex me-4">
            <Link className="nav-link me-2" to="/">Home</Link>
            <Link className="nav-link me-2" to="/reports">Reports</Link>
            <Link className="nav-link me-2" to="/login">Login</Link>
            <Link className="nav-link me-2" to="/scannedsites">Scanned Sites</Link> {/*TODO: hide this option until user is logged in.*/}
            </div>
        </div>
    </nav>
);

export default Navbar;