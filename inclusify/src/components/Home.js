import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';


const Home = () => {
    const [urls, setUrls] = useState (["", "", ""]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scanRequest, setScanRequest] = useState(null);
    const navigate = useNavigate();

    const handleChange = (index,value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    }

    const handleSubmit = async () => {

        setLoading(true);
        setProgress(0);
        //progress bar
        const interval = setInterval(()=> {
            setProgress((prev) => (prev < 90 ? prev + 1 : prev));
        }, 250); //change progress bar speed

        try {
            const source = axios.CancelToken.source();
            setScanRequest(() => source.cancel);

            const response = await axios.post("http://localhost:5000/scan", {urls}, {cancelToken: source.token});

            clearInterval(interval);
            setProgress (100);

            setTimeout(() => {
                navigate ("/reports", {state: {reports: response.data.reports}});
                setLoading(false);
            }, 500);
        } catch (error) {
               clearInterval(interval);
               setLoading(false);

               if (axios.isCancel(error)){
                   console.log("Scan canceled by user.");
               } else {
                   console.error("Error Scanning URLs:", error);
               }
        }
    };
    const handleCancel= () => {
        if (scanRequest) {
            scanRequest ();
        }
        setLoading(false);
        setProgress(0);
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
            <button className="btn btn-primary" onClick = {handleSubmit} disabled={loading}>
                {loading ? "Scanning..." :"Scan Websites"}
            </button>

            {loading && <Loading progress = {progress} onCancel = {handleCancel} />}
        </div>
    );
};

export default Home;