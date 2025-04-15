import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import generateReportPDF from '../utils/generateReportPDF';

const formatCriteriaName = (key) => {
    const criteriaMap = {
        contrast: 'Color Contrast',
        fontSize: 'Font Size',
        fontReadability: 'Font Readability',
        tabNavigation: 'Tab Navigation',
        html: 'HTML Validation',
        altText: 'Alt Text Compliance',
        aria: 'ARIA Compliance'
    };

    return criteriaMap[key] || key;
};

const gradingDescriptions = {
    html: "The HTML criteria is based on the presence of deprecated tags that may affect accessibility. Any deprecated tags should be updated.",
    altText: "The Alt Text criteria evaluates whether images have meaningful alt attributes for screen readers. The presence of alt text for images severely affects the final score",
    aria: "The ARIA Compliance criteria checks for the correct usage of ARIA attributes to improve accessibility for assistive technologies. The lack of ARIA tags severely affects the final score.",
    fontSize: "The Font Size criteria assesses whether text is large enough to be easily readable. Body text font size should be a minimum of 16px and no text should be smaller than 12px.",
    fontReadability: "The Font Readability criteria detects if the webpage uses difficult-to-read fonts that may impact accessibility.",
    contrast: "The Color Contrast criteria identifies color pairings that may be difficult for colorblind users to distinguish.",
    tabNavigation: "The Tab Navigation criteria evaluates whether a website has explicit tab indexes set. This allows users to better navigate a website using a keyboard alone. Lack of defined tab indexes does not majorly affect the final score."
};

const Reports = () => {
    const location = useLocation();
    const reports = location.state?.reports || [];
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [expandedCriteria, setExpandedCriteria] = useState({});

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const toggleCriteriaExpand = (reportIndex, key) => {
        setExpandedCriteria((prev) => ({
            ...prev,
            [`${reportIndex}-${key}`]: !prev[`${reportIndex}-${key}`],
        }));
    };

    return (
        <div className="container">
            <h2>Scan Results</h2>
            {reports.length > 0 ? (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>URL</th>
                        <th>Title</th>
                        <th>Accessibility Score</th>
                        <th>Accessibility Grade</th>
                        <th>Details</th>
                    </tr>
                    </thead>
                    <tbody>
                    {reports.map((report, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                <td>{index + 1}</td>
                                <td>{report.url}</td>
                                {report.error ? (
                                    <td colSpan="4" style={{ color: "red" }}>
                                        Error: {report.error}
                                    </td>
                                ) : (
                                    <>
                                        <td>{report.title}</td>
                                        <td>{report.finalScore}</td>
                                        <td>{report.grade}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-info"
                                                onClick={() => toggleExpand(index)}
                                            >
                                                {expandedIndex === index ? "Hide Details" : "Expand for Detailed Info"}
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                            {expandedIndex === index && !report.error && (
                                <tr>
                                    <td colSpan="6">
                                        <div className="card mt-2">
                                            <div className="card-body">
                                                <h5>Detailed Info for {report.title}</h5>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => generateReportPDF(index, report.title, reports)}
                                                >
                                                    Download as PDF
                                                </button>

                                                <table className="table">
                                                    <thead>
                                                    <tr>
                                                        <th>Criteria</th>
                                                        <th>Score</th>
                                                        <th>Issues</th>
                                                        <th></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {Object.entries(report.criteriaScores).map(([key, value]) => {
                                                        const hasIssues = value.issues && (
                                                            value.issues.message ||
                                                            value.issues.lineNumbers?.length ||
                                                            value.issues.badFonts?.length ||
                                                            value.issues.flaggedUniquePairs?.length
                                                        );

                                                        return (
                                                            <tr key={key}>
                                                                <td><strong>{formatCriteriaName(key)}</strong></td>
                                                                <td>{value.score}</td>
                                                                <td>{value.issues?.message || "No issues"}</td>
                                                                <td>
                                                                    {/* Only show the expand button if the criteria has issues */}
                                                                    {hasIssues && key !== "tabNavigation" && key !== "aria" && (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => toggleCriteriaExpand(index, key)}
                                                                        >
                                                                            {expandedCriteria[`${index}-${key}`] ? "Hide" : "Expand"}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>

                                                {Object.entries(report.criteriaScores).map(([key, value]) =>
                                                    expandedCriteria[`${index}-${key}`] && value.issues ? (
                                                        <div
                                                            key={key}
                                                            className="mt-3 p-3 border rounded shadow-sm"
                                                            style={{backgroundColor: "#f9f9f9", marginBottom: "15px"}}
                                                        >
                                                            <h6><strong>Expanded Details for {formatCriteriaName(key)}</strong></h6>
                                                            {value.issues?.deprecatedTags && (
                                                                <p><strong>Deprecated Tags:</strong> {value.issues.deprecatedTags}</p>
                                                            )}
                                                            {value.issues?.totalImages && (
                                                                <p><strong>Total Images Detected:</strong> {value.issues.totalImages}</p>
                                                            )}
                                                            {value.issues?.badImages && (
                                                                <p><strong>No Alt Text Detected:</strong> {value.issues.badImages}</p>
                                                            )}
                                                            {value.issues?.count && (
                                                                <p><strong>Error Count:</strong> {value.issues.count}</p>
                                                            )}
                                                            {value.issues?.penalty && (
                                                                <p><strong>Penalty:</strong> {value.issues.penalty} Point(s)</p>
                                                            )}
                                                            {value.issues?.detectedFontSizes && (
                                                                <p><strong>Problematic Font Sizes:</strong> {value.issues.detectedFontSizes.join(", ")}</p>
                                                            )}
                                                            {value.issues?.badFonts && (
                                                                <p><strong>Problematic Font Types:</strong> {value.issues.badFonts.join(", ")}</p>
                                                            )}
                                                            {value.issues?.detectedFonts && (
                                                                <p><strong>Total Number of Different Font Types:</strong> {value.issues.detectedFonts}</p>
                                                            )}
                                                            {value.issues?.flaggedUniquePairs && (
                                                                <div>
                                                                    <p><strong>Color Contrast Issues:</strong></p>
                                                                    <table className="table table-sm">
                                                                        <thead>
                                                                        <tr>
                                                                            <th>Color 1</th>
                                                                            <th>Element 1</th>
                                                                            <th>Line Number</th>
                                                                            <th>Color 2</th>
                                                                            <th>Element 2</th>
                                                                            <th>Line Number</th>
                                                                            <th>Reason</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        {value.issues.flaggedUniquePairs.map((pair, idx) => (
                                                                            <tr key={idx}>
                                                                                <td>{pair.color1}</td>
                                                                                <td>{pair.element1}</td>
                                                                                <td>{pair.lineNumber1}</td>
                                                                                <td>{pair.color2}</td>
                                                                                <td>{pair.element2}</td>
                                                                                <td>{pair.lineNumber2}</td>
                                                                                <td>{pair.reason}</td>
                                                                            </tr>
                                                                        ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                            {value.issues?.lines && (
                                                                <p><strong>Line Numbers:</strong> {value.issues.lines}</p>
                                                            )}
                                                            {value.issues?.totalBadSizes && (
                                                                <p><strong>Total Number of Bad Fonts:</strong> {value.issues.totalBadSizes}</p>
                                                            )}
                                                            {value.issues?.totalDetectedSizes && (
                                                                <p><strong>Total Number of Different Font Sizes:</strong> {value.issues.totalDetectedSizes}</p>
                                                            )}
                                                            {value.issues?.percentage && (
                                                                <p><strong>Error Percentage:</strong> {Number(value.issues.percentage).toFixed(2) + "%"}</p>
                                                            )}
                                                        </div>
                                                    ) : null
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}

                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>
                    No reports found. To make a report, begin a scan{' '}
                    <a href="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
                        here
                    </a>
                    .
                </p>

            )}
            <div id="grades" className="card mt-4">
                <div className="card-body">
                    <h5>How We Grade Accessibility</h5>
                    {Object.entries(gradingDescriptions).map(([key, description]) => (
                        <div key={key} className="mb-2">
                            <strong>{formatCriteriaName(key)}:</strong> {description}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;