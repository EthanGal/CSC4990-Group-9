import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [urls, setUrls] = useState (["", "", ""]);
    const navigate = useNavigate();

    const handleChange = (index,value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:5000/scan", {urls});
            navigate ("/reports", {state: {reports: response.data.reports}});
        } catch (error) {
               console.error ("Error Scanning URLs:", error);
        }
    }
    return (
        <div className="container ">
            <h2 className=" text-primary"> Inclusify</h2>
            <p> Enter up to 3 website URLs to scan: </p>

            {urls.map ((url, index) => (
                <input
                    key={index}
                    type="text"
                    value={url}
                    onChange={(e) => handleChange(index, e.target.value)}
                    placeholder = {`Website URL ${index + 1}`}
                    style={{display: "block", marginBottom:"10px"}} //todo:change this to css
                />
            ))}
            <button onClick = {handleSubmit}> Scan Websites </button>
        </div>
    );
};

export default Home;