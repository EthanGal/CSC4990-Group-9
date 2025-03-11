import React from 'react'

const Loading = ({progress, onCancel}) => {

    return (
        <div className = "loading-overlay">
            <div className='loading-box'>
                <p>Scanning... {progress}%</p>
                <div className='progress-bar mb-2'>
                    <div className='progress-fill' style={{ width: `${progress}%`}}></div>
                </div>
                <button className="btn btn-danger" onClick={onCancel}>Cancel Scan</button>
            </div>
        </div>
    );
};

export default Loading;