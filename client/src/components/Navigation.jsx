import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/dashboard" onClick={closeMobileMenu}>
            BlogApp
          </Link>
        </div>

        <div className="nav-desktop">
          <div className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              data-testid="nav-dashboard"
            >
              Dashboard
            </Link>
            <Link 
              to="/posts" 
              className={`nav-link ${isActive('/posts') ? 'active' : ''}`}
              data-testid="nav-posts"
            >
              Posts
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              data-testid="nav-profile"
            >
              Profile
            </Link>
          </div>
          
          <button 
            onClick={handleLogout}
            className="logout-button"
            data-testid="logout-button"
          >
            Logout
          </button>
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          data-testid="menu-toggle"
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div 
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        data-testid="mobile-menu"
      >
        <div className="mobile-nav-links">
          <Link 
            to="/dashboard" 
            className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={closeMobileMenu}
            data-testid="mobile-nav-dashboard"
          >
            Dashboard
          </Link>
          <Link 
            to="/posts" 
            className={`mobile-nav-link ${isActive('/posts') ? 'active' : ''}`}
            onClick={closeMobileMenu}
            data-testid="mobile-nav-posts"
          >
            Posts
          </Link>
          <Link 
            to="/profile" 
            className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={closeMobileMenu}
            data-testid="mobile-nav-profile"
          >
            Profile
          </Link>
          <button 
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="mobile-logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navigation;