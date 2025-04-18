import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import axios from 'axios';
import Loading from "./Loading";

const Home = () => {
    const { userID } = useContext(AuthContext);
    const { username, isLoggedIn } = useContext(AuthContext);
    const [urls, setUrls] = useState(["", "", ""]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scanRequest, setScanRequest] = useState(null);
    const navigate = useNavigate();

    const handleChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
        setErrorMessage("");
    };

    const handleSubmit = async () => {
        setLoading(true);
        setProgress(0);

        const source = axios.CancelToken.source();
        setScanRequest(() => source.cancel);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 99) return prev + 1;
                return 99;
            });
        }, 445); // Modify for loading bar speed

        try {
            console.log("Sending scan request with:", urls);
            const response = await axios.post("http://localhost:5000/api/scan",
                { urls, userID},
                {
                    headers: { "Content-Type": "application/json" },
                    cancelToken: source.token
                });

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                navigate("/reports", { state: { reports: response.data.reports } });
                setLoading(false);
            }, 500);
        } catch (error) {
            clearInterval(interval);
            setLoading(false);

            if (axios.isCancel(error)) {
                console.log("Scan canceled by user.");
            } else {
                console.error("Error scanning URLs:", error);
                setErrorMessage("One or more URLs are invalid or the scan failed. Please check your input.");
            }
        }
    };

    const handleCancel = () => {
        if (scanRequest) {
            scanRequest();
        }
        setLoading(false);
        setProgress(0);
    };

    return (
        <>
            <div className="container" id="homeContain">
                <img src="/inclusify-grey-high-resolution-logo.png" width="275" id="logo" className="mt-1 "
                     alt="HomeLogo"/>

                {isLoggedIn && <h5>Current user: {username}</h5>}

                <div><h2>Copy and Paste up to 3 website URLs to scan:</h2></div>

                {urls.map((url, index) => (
                    <input
                        key={index}
                        type="text"
                        value={url}
                        onChange={(e) => handleChange(index, e.target.value)}
                        placeholder={`Website URL ${index + 1}`}
                        style={{display: "block", marginBottom: "10px"}} // TODO: Change this to CSS
                    />
                ))}

                <button id="submitSite" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Scanning..." : "Scan Websites"}
                </button>
                {errorMessage && (
                    <div className="error-notification">
                        {errorMessage}
                    </div>
                )}

                {loading && <Loading progress={progress} onCancel={handleCancel}/>}
            </div>
            <div className="container" id="infoContain">
                <h2>Understanding WCAG 2.1 and ARIA</h2>
                <p>
                    <strong>WCAG 2.1</strong> (Web Content Accessibility Guidelines) is a set of guidelines designed to
                    make web content more accessible to people with disabilities. It builds upon WCAG 2.0 by adding
                    criteria to address mobile accessibility, low vision, and cognitive disabilities. With WCAG's POUR
                    principle, the guidelines emphasize having web content be Perceivable, Operable, Understandable, and Robust.
                </p>
                <p>
                    <strong>ARIA</strong> (Accessible Rich Internet Applications) is a set of attributes that can be
                    added to HTML elements to improve accessibility, especially for dynamic content and advanced user
                    interface controls.
                </p>
            </div>
        </>
    );
};

export default Home;
