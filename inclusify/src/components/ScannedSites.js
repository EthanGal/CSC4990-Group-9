import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ScannedSitesPage = () => {
    const { isLoggedIn, userID } = useContext(AuthContext);
    const [userScans, setUserScans] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUserScans, setTotalUserScans] = useState(0);
    const SCANS_PER_PAGE = 5;

    useEffect(() => {
        if (!isLoggedIn || !userID) return;

        axios.get(`http://localhost:5000/scannedsites?userID=${userID}&page=${currentPage}&limit=5`)
            .then(res => {
                setUserScans(res.data.results);
                setTotalUserScans(res.data.total);
            })
            .catch(err => console.error('Failed to fetch user scans:', err));
    }, [userID, isLoggedIn, currentPage]);

    const totalPages = Math.ceil(totalUserScans / SCANS_PER_PAGE);

    const renderPagination = () => (
        <div className="pagination-controls text-center mt-4">
            <button
                className="btn btn-outline-primary mb-3 me-2"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
            >
                Jump to Newest
            </button>

            {Array.from({ length: totalPages }, (_, idx) => (
                <button
                    key={idx}
                    className={`btn mb-3 mx-1 ${currentPage === idx + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentPage(idx + 1)}
                >
                    {idx + 1}
                </button>
            ))}

            <button
                className="btn btn-outline-primary mb-3 ms-2"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
            >
                Jump to Oldest
            </button>
        </div>
    );

    return (
        <div>
            <h2>Your Scanned Sites</h2>

            {!isLoggedIn ? (
                <p style={{ color: 'red', fontWeight: 'bold' }}>You must be logged in to view your scanned sites.</p>
            ) : userScans.length > 0 ? (
                <>
                    {userScans.map((scan) => (
                        <div key={scan.webID} className="mb-5">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                <tr>
                                    <th>URL</th>
                                    <th>Title</th>
                                    <th>Last Scanned</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{scan.webURL}</td>
                                    <td>{scan.webName}</td>
                                    <td>{new Date(scan.Date).toLocaleDateString()}</td>
                                    <td>{scan.TotalScore}</td>
                                    <td>{scan.LatestGrade}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}
                    {renderPagination()}
                </>
            ) : (
                <p>You haven't scanned any sites yet.</p>
            )}
        </div>
    );
};

export default ScannedSitesPage;
