/**
 * Header Component
 * 
 * Purpose:
 * Provides navigation and access to different features of the application.
 * 
 * Props:
 * - activeTab: Current active tab
 * - setActiveTab: Function to change the active tab
 * 
 * Outputs:
 * - Header with navigation links
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, logOut } from '../services/authService';

function Header({ activeTab, setActiveTab }) {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="logo-container">
        <h1>YouTube Summarizer</h1>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li 
            className={activeTab === 'transcribe' ? 'active' : ''}
            onClick={() => setActiveTab('transcribe')}
          >
            Transcribe
          </li>
          <li 
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            Search
          </li>
          {user && (
            <>
              <li 
                className={activeTab === 'collections' ? 'active' : ''}
                onClick={() => setActiveTab('collections')}
              >
                My Collections
              </li>
              <li 
                className={activeTab === 'generator' ? 'active' : ''}
                onClick={() => setActiveTab('generator')}
              >
                Content Generator
              </li>
            </>
          )}
        </ul>
      </nav>
      
      <div className="auth-container">
        {loading ? (
          <div className="loading-indicator-small"></div>
        ) : user ? (
          <div className="user-profile">
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="user-avatar"
            />
            <span className="user-name">{user.displayName}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={handleSignIn} className="sign-in-button">
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
}

export default Header; 