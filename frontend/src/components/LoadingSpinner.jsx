import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
    return (
        <div className={`loading-container loading-${size}`}>
            <div className="spinner"></div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
