import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <nav className="navbar navbar-light bg-light mb-3">
        <div className="container-fluid d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <span className="text-primary mb-0 h2">Inclusify</span>
            </div>

            <div className="d-flex me-4">
            <Link className="nav-link me-2" to="/">Home</Link>
                <Link className="nav-link" to="/reports">Reports</Link>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/scannedsites">Scanned Sites</Link> {/*TODO: hide this option until user is logged in.*/}
            </div>
        </div>
    </nav>
);

export default Navbar;