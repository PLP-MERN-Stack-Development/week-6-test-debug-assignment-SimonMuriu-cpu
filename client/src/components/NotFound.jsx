import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found" data-testid="not-found">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title" data-testid="not-found-title">404</h1>
          <h2>Page Not Found</h2>
          <p>
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="not-found-actions">
            <Link 
              to="/dashboard" 
              className="not-found-button primary"
              data-testid="back-home"
            >
              Go to Dashboard
            </Link>
            <Link 
              to="/posts" 
              className="not-found-button secondary"
            >
              Browse Posts
            </Link>
          </div>
        </div>
        
        <div className="not-found-illustration">
          <div className="illustration-404">
            <div className="number">4</div>
            <div className="circle">
              <div className="face">
                <div className="eyes">
                  <div className="eye"></div>
                  <div className="eye"></div>
                </div>
                <div className="mouth"></div>
              </div>
            </div>
            <div className="number">4</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;