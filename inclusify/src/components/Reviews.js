import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

const ReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const {isLoggedIn, userID} = useContext(AuthContext);
    const [commentText, setCommentText] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const REVIEWS_PER_PAGE = 4;

    useEffect(() => {
        axios.get(`http://localhost:5000/reviews/scans?page=${currentPage}&limit=${REVIEWS_PER_PAGE}`)
            .then(async res => {
                const baseReviews = res.data.results;
                setTotalReviews(res.data.total);

                const reviewsWithComments = await Promise.all(
                    baseReviews.map(async (review) => {
                        try {
                            const commentRes = await axios.get(`http://localhost:5000/reviews/comments/${review.webID}`);
                            const sorted = commentRes.data.sort((a, b) => new Date(b.revDate) - new Date(a.revDate));
                            return {
                                ...review,
                                comments: sorted.slice(0, 3),
                                allComments: sorted
                            };
                        } catch {
                            return {...review, comments: [], allComments: []};
                        }
                    })
                );

                setReviews(reviewsWithComments);
            })
            .catch(err => console.error(err));
    }, [currentPage]);

    const handleCommentChange = (webID, text) => {
        setCommentText(prev => ({...prev, [webID]: text}));
    };

    const handleCommentSubmit = (webID) => {
        if (!isLoggedIn) {
            alert('You must be logged in to comment');
            return;
        }

        const comment = commentText[webID] || '';
        if (!comment.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        axios.post('http://localhost:5000/reviews/comment', {webID, comment, userID})
            .then(() => {
                setCommentText(prev => ({...prev, [webID]: ''}));
                axios.get(`http://localhost:5000/reviews/comments/${webID}`)
                    .then(commentRes => {
                        const sortedComments = commentRes.data.sort((a, b) => new Date(b.revDate) - new Date(a.revDate));
                        setReviews(prevReviews =>
                            prevReviews.map(review =>
                                review.webID === webID
                                    ? {...review, comments: sortedComments.slice(0, 3), allComments: sortedComments}
                                    : review
                            )
                        );
                    })
                    .catch(err => console.error("Error fetching updated comments:", err));
            })
            .catch(err => console.error(err));
    };

    const handleShowMore = (webID) => {
        setExpandedComments(prev => ({...prev, [webID]: true}));
    };

    const handleShowLess = (webID) => {
        setExpandedComments(prev => ({...prev, [webID]: false}));
    };

    const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

    const renderPagination = () => (
        <div className="pagination-controls text-center mt-4">
            <button
                className="btn btn-outline-primary mb-3 me-2"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
            >
                Jump to Newest
            </button>

            {Array.from({length: totalPages}, (_, idx) => (
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
            <h2>Community Reviews</h2>

            {!isLoggedIn && <p>You must be logged in to comment.</p>}

            {reviews.length > 0 ? (
                <>
                    {reviews.map((review) => (
                        <div key={review.webID} className="scan-item">
                            <table id="reviews" className="table table-bordered mt-4 mb-2">
                                <thead className="sticky-header">
                                <tr>
                                    <th>URL</th>
                                    <th>Title</th>
                                    <th>Scanned By User</th>
                                    <th>Last Scanned</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{review.webURL}</td>
                                    <td>{review.webName}</td>
                                    <td>{review.username}</td>
                                    <td>{new Date(review.Date).toLocaleDateString()}</td>
                                    <td>{review.totalScore}</td>
                                    <td>{review.LatestGrade}</td>
                                </tr>
                                </tbody>
                            </table>

                            <div id="comments" className="comment-section mt-2 p-4 bg-white rounded shadow-sm border
                            border-dark border-3">
                                <h4>Comments</h4>
                                {review.comments && review.comments.length > 0 ? (
                                    review.comments.map((comment, idx) => (
                                        <div key={idx} className="mb-2">
                                            <strong>{comment.username}</strong> -{" "}
                                            <small>{new Date(comment.revDate).toLocaleDateString()}</small>
                                            <p className="mb-1">{comment.commentBody}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No comments yet.</p>
                                )}

                                {review.comments.length < review.allComments.length && !expandedComments[review.webID] && (
                                    <button
                                        className="btn btn-link"
                                        onClick={() => handleShowMore(review.webID)}
                                    >
                                        Show More Comments
                                    </button>
                                )}

                                {expandedComments[review.webID] && review.allComments.length > 3 && (
                                    <div>
                                        {review.allComments.slice(3).map((comment, idx) => (
                                            <div key={idx} className="mb-2">
                                                <strong>{comment.username}</strong> -{" "}
                                                <small>{new Date(comment.revDate).toLocaleDateString()}</small>
                                                <p className="mb-1">{comment.commentBody}</p>
                                            </div>
                                        ))}
                                        <button
                                            className="btn btn-link"
                                            onClick={() => handleShowLess(review.webID)}
                                        >
                                            Show Less
                                        </button>
                                    </div>
                                )}

                                {isLoggedIn && (
                                    <div className="comment-input-container mt-2 mb-4">
                                        <textarea
                                            className="form-control w-100"
                                            placeholder="Write your comment..."
                                            value={commentText[review.webID] || ''}
                                            onChange={(e) => handleCommentChange(review.webID, e.target.value)}
                                        ></textarea>
                                        <button
                                            className="btn btn-primary mt-1 mb-3 float-end"
                                            onClick={() => handleCommentSubmit(review.webID)}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {renderPagination()}
                </>
            ) : (
                <p>No Reviews Available</p>
            )}
        </div>
    );
};

export default ReviewPage;
