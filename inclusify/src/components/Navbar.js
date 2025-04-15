import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

const Navbar = () => {
    const {isLoggedIn, logout} = useContext(AuthContext);

    return (
        <nav className="navbar navbar-light bg-light mb-3">
            <div className="container-fluid d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <img src="/inclusify-grey-high-resolution-logo2.png" width="250"id="logo" className="mt-1 ms-4 me-1" alt="NavbarLogo"/>
                </div>

                <div className="d-flex me-4" id="navbarLinks">
                    <Link className="nav-link me-2" to="/">Home</Link>
                    <Link className="nav-link me-2" to="/reports">Reports</Link>
                    <Link className="nav-link me-2" to="/reviews">Reviews</Link>
                    {isLoggedIn && (
                        <Link className="nav-link me-2" to="/scannedsites">Your Scanned Sites</Link>
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
