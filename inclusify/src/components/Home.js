import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import axios from 'axios';
import Loading from "./Loading";

const Home = () => {
    const { username, isLoggedIn } = useContext(AuthContext); // Access username and isLoggedIn state
    const [urls, setUrls] = useState(["", "", ""]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scanRequest, setScanRequest] = useState(null);
    const navigate = useNavigate();

    const handleChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
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
                { urls },
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
        <div className="container" id="homeContain">
            <h1 id="inclusify" className=" text-primary"> Inclusify</h1>

            {isLoggedIn && <h5>Current user: {username}</h5>}

            <div><h2>Enter up to 3 website URLs to scan:</h2></div>

            {urls.map((url, index) => (
                <input
                    key={index}
                    type="text"
                    value={url}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder={`Website URL ${index + 1}`}
                    style={{ display: "block", marginBottom: "10px"}} // TODO: Change this to CSS
                />
            ))}

            <button id="submitSite"  className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Scanning..." : "Scan Websites"}
            </button>

            {loading && <Loading progress={progress} onCancel={handleCancel} />}
        </div>
    );
};

export default Home;
