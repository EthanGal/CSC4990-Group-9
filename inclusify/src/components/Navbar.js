import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

const Navbar = () => {
    const {isLoggedIn, logout} = useContext(AuthContext);

    return (
        <nav className="navbar navbar-light bg-light mb-3">
            <div className="container-fluid d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <span className="text-primary mb-0 h2">Inclusify</span>
                </div>

                <div className="d-flex me-4">
                    <Link className="nav-link me-2" to="/">Home</Link>
                    <Link className="nav-link me-2" to="/reports">Reports</Link>
                    <Link className="nav-link me-2" to="/reviews">Reviews</Link>
                    {isLoggedIn && (
                        <Link className="nav-link me-2" to="/scannedsites">Scanned Sites</Link>
                    )}

                    {isLoggedIn ? (
                        <button className="btn btn-link nav-link me-2" onClick={logout}>
                            Logout
                        </button>
                    ) : (
                        <Link className="nav-link me-2" to="/login">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
