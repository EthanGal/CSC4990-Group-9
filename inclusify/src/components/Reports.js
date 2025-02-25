import React from "react";
import {useLocation} from "react-router-dom";

const Reports = () => {
    const location = useLocation();
    const reports = location.state?.reports || [];

    return (
        <div className="container">
            <h2>Scan Results</h2>
            {reports.length > 0 ? (
                reports.map((report, index) => (
                    <div key = {index} style = {{border: "1px solid black", padding: "10px", marginBottom:"10px" }}> {/*todo: change style to css 1*/}
                        <p><strong> URL:</strong> {report.url}</p>
                        {report.error ? (
                            <p style = {{ color:"red"}}> Error: {report.error}</p> //todo: change style to css 2
                        ) : (
                            <>
                                <p><strong>Title:</strong> {report.title}</p>
                                <p><strong>Placeholder Accessibility Score: </strong> {report.accessibilityScore} </p>
                            </>
                        )}
                    </div>
                ))
            ) : (
                <p> No Reports Available</p>
            )}
        </div>
    );
};
export default Reports;